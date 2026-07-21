import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from './app.js';
import { demoStore } from './store.js';

describe('demo API', () => {
  beforeEach(() => demoStore.reset());
  afterEach(() => vi.restoreAllMocks());

  it('keeps the API credential server-side', async () => {
    const health = await request(app).get('/api/health').expect(200);
    expect(JSON.stringify(health.body)).not.toContain(process.env.ABSK_API_KEY);
    const response = await request(app)
      .post('/api/ai/chat')
      .send({ currentState: 'SELECT_SERVICE', language: 'en', userMessage: 'help', forceGuided: true })
      .expect(200);
    expect(JSON.stringify(response.body)).not.toContain(process.env.ABSK_API_KEY);
    expect(response.body.mode).toBe('guided');
  });

  it('sorts nearby offices and supports location fallback data', async () => {
    const response = await request(app)
      .get('/api/dfa/offices/nearby?latitude=14.5865&longitude=121.1762')
      .expect(200);
    expect(response.body[0].id).toBe('dfa-antipolo-demo');
    expect(response.body[0].distanceKm).toBe(0);
  });

  it('requires verified payment before confirmation and supports idempotent callbacks', async () => {
    const hold = await request(app).post('/api/dfa/slots/hold').send({
      officeId: 'dfa-antipolo-demo',
      date: '2026-11-04',
      time: '10:00',
      service: 'ADULT_RENEWAL',
      processingType: 'REGULAR',
    });
    const payment = await request(app).post('/api/payments/sessions').send({
      holdId: hold.body.id,
      method: 'GCASH',
      amount: 1000,
    });
    await request(app).post('/api/appointments/confirm').send({ paymentId: payment.body.id }).expect(409);
    await request(app).post(`/api/demo/payments/${payment.body.id}/succeed`).expect(200);
    await request(app).post(`/api/demo/payments/${payment.body.id}/succeed`).expect(200);
    const appointment = await request(app)
      .post('/api/appointments/confirm')
      .send({ paymentId: payment.body.id })
      .expect(201);
    expect(appointment.body.code).toContain('DEMO');
  });

  it('offers one new slot to the first eligible watcher and advances on decline', async () => {
    const first = await request(app).post('/api/slot-watch').send({
      officeId: 'dfa-antipolo-demo',
      dateFrom: '2026-11-04',
      dateTo: '2026-11-06',
      timePreference: 'MORNING',
    });
    const second = await request(app).post('/api/slot-watch').send({
      officeId: 'dfa-antipolo-demo',
      dateFrom: '2026-11-04',
      dateTo: '2026-11-06',
      timePreference: 'ANY',
    });
    const offer = await request(app).post('/api/demo/slot-watch/trigger').expect(201);
    expect(offer.body.slotWatchId).toBe(first.body.id);
    expect([...demoStore.slotOffers.values()]).toHaveLength(1);
    const declined = await request(app)
      .post(`/api/slot-watch/offers/${offer.body.id}/respond`)
      .send({ response: 'DECLINED' })
      .expect(200);
    expect(declined.body.nextOffer.slotWatchId).toBe(second.body.id);
    expect(demoStore.slotWatches.get(second.body.id)?.status).toBe('OFFERED');
  });

  it('moves an expired Slot Watch offer to the next eligible request', async () => {
    await request(app).post('/api/slot-watch').send({
      officeId: 'dfa-antipolo-demo', dateFrom: '2026-11-04', dateTo: '2026-11-06', timePreference: 'ANY',
    });
    const second = await request(app).post('/api/slot-watch').send({
      officeId: 'dfa-antipolo-demo', dateFrom: '2026-11-04', dateTo: '2026-11-06', timePreference: 'ANY',
    });
    const offer = await request(app).post('/api/demo/slot-watch/trigger').expect(201);
    const expired = await request(app)
      .post(`/api/demo/slot-watch/offers/${offer.body.id}/expire`)
      .expect(200);
    expect(expired.body.offer.status).toBe('EXPIRED');
    expect(expired.body.nextOffer.slotWatchId).toBe(second.body.id);
  });

  it('enforces deterministic Passport Journey progression', async () => {
    const hold = demoStore.createHold({
      officeId: 'dfa-antipolo-demo',
      date: '2026-11-04',
      time: '10:00',
      service: 'ADULT_RENEWAL',
      processingType: 'REGULAR',
    });
    const payment = demoStore.createPayment(hold.id, 'GCASH', 1000);
    demoStore.settlePayment(payment.id, 'VERIFIED');
    const appointment = demoStore.confirmAppointment(payment.id);
    await request(app)
      .post(`/api/demo/passport-journey/${appointment.applicationId}/status`)
      .send({ status: 'READY_FOR_PICKUP' })
      .expect(409);
    expect(demoStore.journeys.get(appointment.applicationId)?.currentStatus).toBe('APPOINTMENT_CONFIRMED');
    demoStore.updateJourney(appointment.applicationId, 'APPOINTMENT_COMPLETED');
    demoStore.updateJourney(appointment.applicationId, 'BIOMETRICS_CAPTURED');
    demoStore.updateJourney(appointment.applicationId, 'UNDER_REVIEW');
    demoStore.updateJourney(appointment.applicationId, 'APPROVED');
    expect(demoStore.journeys.get(appointment.applicationId)?.currentStatus).toBe('APPROVED');
  });

  it('preserves the married-surname requirement through confirmation', () => {
    const hold = demoStore.createHold({
      officeId: 'dfa-antipolo-demo',
      date: '2026-11-04',
      time: '10:00',
      service: 'ADULT_RENEWAL',
      informationChange: 'MARRIED_SURNAME',
      processingType: 'REGULAR',
    });
    const payment = demoStore.createPayment(hold.id, 'GCASH', 1000);
    demoStore.settlePayment(payment.id, 'VERIFIED');
    const appointment = demoStore.confirmAppointment(payment.id);
    expect(appointment.requirements).toContain('Synthetic PSA marriage record');
  });
});
