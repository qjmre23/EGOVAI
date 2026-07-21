import {
  DEFAULT_TIMES,
  DEMO_GROUP_APPLICANTS,
  DEMO_OFFICES,
  DEMO_PASSPORT_RECORD,
  DEMO_PROFILE,
  FEES,
  JOURNEY_COPY,
  OFFICE_DATES,
  createSlots,
  type Appointment,
  type AppointmentHold,
  type ApplicationForm,
  type InformationChangeType,
  type Notification,
  type PassportJourney,
  type PassportJourneyStatus,
  type PassportServiceType,
  type PaymentSession,
  type ProcessingType,
  type SlotOffer,
  type SlotWatchRequest,
} from '@egovai/core';
import { randomUUID } from 'node:crypto';

const now = () => new Date().toISOString();
const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();
const compactId = () => randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase();

const requirementsFor = (service: PassportServiceType, change: InformationChangeType) => {
  if (service === 'GROUP') {
    return [
      'Personal appearance and biometrics for every applicant',
      'Printed demonstration appointment packet for each applicant',
      'Accepted demonstration ID or minor supporting document per applicant',
      'Applicant-specific original and photocopy requirements',
    ];
  }
  if (service === 'NEW_ADULT') {
    return [
      'Personal appearance and biometrics',
      'Synthetic PSA birth certificate reference',
      'One accepted demonstration ID',
      'Printed demonstration appointment packet',
    ];
  }
  const items = [
    'Bring current ePassport',
    'Photocopy of passport data page',
    'Personal appearance and biometrics',
    'Printed demonstration appointment packet',
  ];
  if (change === 'MARRIED_SURNAME') items.splice(2, 0, 'Synthetic PSA marriage record');
  return items;
};

export class DemoStore {
  forms = new Map<string, ApplicationForm>();
  holds = new Map<string, AppointmentHold>();
  payments = new Map<string, PaymentSession>();
  appointments = new Map<string, Appointment>();
  slotWatches = new Map<string, SlotWatchRequest>();
  slotOffers = new Map<string, SlotOffer>();
  journeys = new Map<string, PassportJourney>();
  notifications = new Map<string, Notification>();
  audit: Array<{ id: string; type: string; description: string; timestamp: string }> = [];
  acceleratedTimers = false;
  aiEnabled = true;
  forcedNoSlots = false;

  constructor() {
    this.seed();
  }

  private seed() {
    this.addNotification({
      category: 'SYSTEM',
      title: 'Welcome to the prototype',
      preview: 'All records and transactions in this experience are synthetic.',
      priority: 'LOW',
      relatedType: 'CHAT',
    });
  }

  reset() {
    this.forms.clear();
    this.holds.clear();
    this.payments.clear();
    this.appointments.clear();
    this.slotWatches.clear();
    this.slotOffers.clear();
    this.journeys.clear();
    this.notifications.clear();
    this.audit = [];
    this.acceleratedTimers = false;
    this.aiEnabled = true;
    this.forcedNoSlots = false;
    this.seed();
  }

  addAudit(type: string, description: string) {
    this.audit.unshift({ id: randomUUID(), type, description, timestamp: now() });
  }

  addNotification(
    input: Omit<Notification, 'id' | 'timestamp' | 'read'>,
  ): Notification {
    const notification: Notification = {
      ...input,
      id: randomUUID(),
      timestamp: now(),
      read: false,
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  prepareForm(
    service: PassportServiceType,
    change: InformationChangeType,
    consented: boolean,
    groupApplicantCount = 1,
  ) {
    const normalizedGroupCount = service === 'GROUP' ? Math.min(Math.max(groupApplicantCount, 2), 5) : undefined;
    const form: ApplicationForm = {
      id: randomUUID(),
      type: service,
      profile: DEMO_PROFILE,
      groupApplicantCount: normalizedGroupCount,
      groupApplicants: normalizedGroupCount ? DEMO_GROUP_APPLICANTS.slice(0, normalizedGroupCount) : undefined,
      completionPercentage: consented ? 100 : 86,
      missingFields: consented ? [] : ['Profile consent'],
      requestedChange: change,
      passportNumberMasked: service === 'ADULT_RENEWAL' ? DEMO_PASSPORT_RECORD.passportNumberMasked : undefined,
      requirements: requirementsFor(service, change),
      warnings: [
        'Personal appearance and biometrics remain required.',
        ...(change === 'MARRIED_SURNAME' ? ['Bring the original marriage certificate.'] : []),
      ],
      consented,
    };
    this.forms.set(form.id, form);
    this.addAudit('FORM_PREPARED', `Prepared ${service} demonstration form.`);
    return form;
  }

  createHold(input: {
    officeId: string;
    date: string;
    time: string;
    service: PassportServiceType;
    informationChange?: InformationChangeType;
    processingType: ProcessingType;
    groupApplicantCount?: number;
  }) {
    const office = DEMO_OFFICES.find((item) => item.id === input.officeId);
    if (!office) throw new Error('Office not found');
    const validDate = OFFICE_DATES[input.officeId]?.some((item) => item.date === input.date);
    const validTime = DEFAULT_TIMES.includes(input.time);
    if (!validDate || !validTime || this.forcedNoSlots) throw new Error('Slot not available');

    const applicantCount = input.service === 'GROUP' ? Math.min(Math.max(input.groupApplicantCount ?? 2, 2), 5) : 1;
    const hold: AppointmentHold = {
      id: randomUUID(),
      ...input,
      groupApplicantCount: input.service === 'GROUP' ? applicantCount : undefined,
      informationChange: input.informationChange ?? 'NO_CHANGE',
      amount: FEES[input.processingType].total * applicantCount,
      expiresAt: minutesFromNow(this.acceleratedTimers ? 1 : 10),
      status: 'ACTIVE',
    };
    this.holds.set(hold.id, hold);
    this.addAudit('SLOT_HELD', `Held ${input.officeId} ${input.date} ${input.time}.`);
    return hold;
  }

  releaseHold(id: string) {
    const hold = this.holds.get(id);
    if (!hold) return false;
    hold.status = 'RELEASED';
    this.addAudit('SLOT_RELEASED', `Released appointment hold ${id}.`);
    return true;
  }

  expireHold(id: string) {
    const hold = this.holds.get(id);
    if (!hold) throw new Error('Hold not found');
    hold.status = 'EXPIRED';
    hold.expiresAt = now();
    this.addAudit('SLOT_EXPIRED', `Expired appointment hold ${id}.`);
    return hold;
  }

  createPayment(holdId: string, method: PaymentSession['method'], amount: number) {
    const hold = this.holds.get(holdId);
    if (!hold || hold.status !== 'ACTIVE' || new Date(hold.expiresAt).getTime() <= Date.now()) {
      throw new Error('Appointment hold is not active');
    }
    if (hold.amount !== amount) throw new Error('Payment amount does not match expected amount');
    const payment: PaymentSession = {
      id: randomUUID(),
      holdId,
      method,
      amount,
      reference: `PAY-DEMO-${compactId()}`,
      status: 'PENDING',
      createdAt: now(),
    };
    this.payments.set(payment.id, payment);
    this.addAudit('PAYMENT_CREATED', `Created ${method} demonstration transaction.`);
    return payment;
  }

  settlePayment(id: string, outcome: 'VERIFIED' | 'FAILED') {
    const payment = this.payments.get(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.status === outcome) return payment;
    if (payment.status !== 'PENDING') throw new Error('Payment is no longer pending');
    const hold = this.holds.get(payment.holdId);
    if (!hold || hold.status !== 'ACTIVE' || hold.amount !== payment.amount) {
      throw new Error('Payment verification failed');
    }
    payment.status = outcome;
    this.addNotification({
      category: 'PAYMENT',
      title: outcome === 'VERIFIED' ? 'Demo payment verified' : 'Demo payment failed',
      preview:
        outcome === 'VERIFIED'
          ? `Transaction ${payment.reference} was verified server-side.`
          : 'No charge was made. Choose another simulation option.',
      priority: outcome === 'VERIFIED' ? 'NORMAL' : 'HIGH',
      relatedType: 'CHAT',
    });
    this.addAudit('PAYMENT_UPDATED', `${payment.reference} changed to ${outcome}.`);
    return payment;
  }

  confirmAppointment(paymentId: string) {
    const existing = [...this.appointments.values()].find((item) => item.paymentId === paymentId);
    if (existing) return existing;
    const payment = this.payments.get(paymentId);
    if (!payment || payment.status !== 'VERIFIED') throw new Error('Verified payment required');
    const hold = this.holds.get(payment.holdId);
    if (!hold || hold.status !== 'ACTIVE' || hold.amount !== payment.amount) {
      throw new Error('Active matching hold required');
    }
    const office = DEMO_OFFICES.find((item) => item.id === hold.officeId);
    if (!office) throw new Error('Office not found');
    const id = randomUUID();
    const appointment: Appointment = {
      id,
      code: `DFA-DEMO-${office.city.slice(0, 4).toUpperCase()}-${hold.date.slice(5).replace('-', '')}-${compactId().slice(0, 5)}`,
      holdId: hold.id,
      paymentId,
      office,
      date: hold.date,
      time: hold.time,
      service: hold.service,
      groupApplicantCount: hold.groupApplicantCount,
      groupAppointmentCodes:
        hold.service === 'GROUP'
          ? Array.from({ length: hold.groupApplicantCount ?? 2 }, (_, index) => (
              `DFA-DEMO-G${index + 1}-${office.city.slice(0, 4).toUpperCase()}-${compactId().slice(0, 5)}`
            ))
          : undefined,
      processingType: hold.processingType,
      amountPaid: payment.amount,
      paymentReference: payment.reference,
      status: 'CONFIRMED',
      requirements: requirementsFor(hold.service, hold.informationChange ?? 'NO_CHANGE'),
      createdAt: now(),
      applicationId: `APP-DEMO-${compactId()}`,
    };
    hold.status = 'CONSUMED';
    this.appointments.set(id, appointment);
    const first = JOURNEY_COPY.APPOINTMENT_CONFIRMED;
    this.journeys.set(appointment.applicationId, {
      applicationId: appointment.applicationId,
      appointmentId: appointment.id,
      currentStatus: 'APPOINTMENT_CONFIRMED',
      maskedReference: `${appointment.applicationId.slice(0, 12)}••••`,
      releaseOffice: office.name,
      events: [
        {
          id: randomUUID(),
          status: 'APPOINTMENT_CONFIRMED',
          ...first,
          timestamp: now(),
          source: 'Simulated DFA Status Service',
        },
      ],
    });
    this.addNotification({
      category: 'APPOINTMENT',
      title: 'Demonstration appointment confirmed',
      preview: `${appointment.code} · ${office.city} · ${hold.date}`,
      priority: 'HIGH',
      relatedType: 'APPOINTMENT',
      relatedId: appointment.id,
    });
    this.addAudit('APPOINTMENT_CONFIRMED', `Confirmed ${appointment.code}.`);
    return appointment;
  }

  createSlotWatch(input: Omit<SlotWatchRequest, 'id' | 'createdAt' | 'status'>) {
    const request: SlotWatchRequest = {
      ...input,
      id: randomUUID(),
      createdAt: now(),
      status: 'ACTIVE',
    };
    this.slotWatches.set(request.id, request);
    this.addAudit('SLOT_WATCH_CREATED', `Watching ${request.officeId} from ${request.dateFrom}.`);
    return request;
  }

  private createOfferForRequest(request: SlotWatchRequest, existingSlot?: SlotOffer['slot']) {
    const time = existingSlot?.time ?? (request.timePreference === 'AFTERNOON' ? '13:30' : '09:00');
    const slot = existingSlot ?? createSlots(request.officeId, request.dateFrom).find((item) => item.time === time)!;
    const offer: SlotOffer = {
      id: randomUUID(),
      slotWatchId: request.id,
      slot,
      expiresAt: minutesFromNow(this.acceleratedTimers ? 1 : 5),
      status: 'ACTIVE',
    };
    request.status = 'OFFERED';
    this.slotOffers.set(offer.id, offer);
    this.addNotification({
      category: 'SLOT_WATCH',
      title: 'A demonstration slot is available',
      preview: `${slot.date} at ${slot.time}. Open the prototype to reserve it.`,
      priority: 'HIGH',
      relatedType: 'SLOT_OFFER',
      relatedId: offer.id,
    });
    this.addAudit('SLOT_OFFER_CREATED', `Offered one new slot to eligible request ${request.id}.`);
    return offer;
  }

  private nextEligibleForSlot(slot: SlotOffer['slot']) {
    return [...this.slotWatches.values()]
      .filter((item) => item.status === 'ACTIVE')
      .filter((item) => item.officeId === slot.officeId)
      .filter((item) => item.dateFrom <= slot.date && item.dateTo >= slot.date)
      .filter((item) => {
        if (item.timePreference === 'ANY') return true;
        const hour = Number(slot.time.slice(0, 2));
        return item.timePreference === 'MORNING' ? hour < 12 : hour >= 12;
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  }

  triggerSlotWatch() {
    const request = [...this.slotWatches.values()]
      .filter((item) => item.status === 'ACTIVE')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];

    if (request) return this.createOfferForRequest(request);

    // No active watch — auto-create one with the first demo office so the
    // Demo Control Center button always works regardless of conversation state.
    const defaultOffice = DEMO_OFFICES[0];
    const autoRequest = this.createSlotWatch({
      officeId: defaultOffice.id,
      dateFrom: defaultOffice.earliestAvailableDate,
      dateTo: defaultOffice.earliestAvailableDate,
      timePreference: 'ANY',
    });
    return this.createOfferForRequest(autoRequest);
  }

  respondToOffer(id: string, response: 'ACCEPTED' | 'DECLINED') {
    const offer = this.slotOffers.get(id);
    if (!offer || offer.status !== 'ACTIVE') throw new Error('Slot offer is not active');
    offer.status = response;
    const request = this.slotWatches.get(offer.slotWatchId);
    if (request) request.status = response === 'ACCEPTED' ? 'FULFILLED' : 'DECLINED';
    this.forcedNoSlots = false;
    this.addAudit('SLOT_OFFER_UPDATED', `Slot offer ${id} ${response.toLowerCase()}.`);
    const nextRequest = response === 'DECLINED' ? this.nextEligibleForSlot(offer.slot) : undefined;
    const nextOffer = nextRequest ? this.createOfferForRequest(nextRequest, offer.slot) : null;
    return { offer, nextOffer };
  }

  expireSlotOffer(id: string) {
    const offer = this.slotOffers.get(id);
    if (!offer || offer.status !== 'ACTIVE') throw new Error('Slot offer is not active');
    offer.status = 'EXPIRED';
    offer.expiresAt = now();
    const request = this.slotWatches.get(offer.slotWatchId);
    if (request) request.status = 'EXPIRED';
    this.addAudit('SLOT_OFFER_EXPIRED', `Slot offer ${id} expired.`);
    const nextRequest = this.nextEligibleForSlot(offer.slot);
    const nextOffer = nextRequest ? this.createOfferForRequest(nextRequest, offer.slot) : null;
    return { offer, nextOffer };
  }

  updateJourney(applicationId: string, status: PassportJourneyStatus) {
    const journey = this.journeys.get(applicationId);
    if (!journey) throw new Error('Passport Journey not found');
    const journeyTransitions: Record<PassportJourneyStatus, readonly PassportJourneyStatus[]> = {
      APPOINTMENT_CONFIRMED: ['APPOINTMENT_COMPLETED'],
      APPOINTMENT_COMPLETED: ['BIOMETRICS_CAPTURED'],
      BIOMETRICS_CAPTURED: ['UNDER_REVIEW'],
      UNDER_REVIEW: ['ADDITIONAL_REQUIREMENT', 'APPROVED'],
      ADDITIONAL_REQUIREMENT: ['UNDER_REVIEW'],
      APPROVED: ['IN_PRODUCTION'],
      IN_PRODUCTION: ['DISPATCHED'],
      DISPATCHED: ['READY_FOR_PICKUP'],
      READY_FOR_PICKUP: ['CLAIMED'],
      CLAIMED: [],
    };
    if (!journeyTransitions[journey.currentStatus].includes(status)) {
      throw new Error('Invalid Passport Journey progression');
    }
    const copy = JOURNEY_COPY[status];
    journey.currentStatus = status;
    journey.events.push({
      id: randomUUID(),
      status,
      ...copy,
      timestamp: now(),
      source: 'Simulated DFA Status Service',
    });
    const isReady = status === 'READY_FOR_PICKUP';
    this.addNotification({
      category: isReady ? 'PICKUP' : 'PASSPORT_STATUS',
      title: isReady ? 'Your application has a new update' : copy.title,
      preview: isReady
        ? 'Open the prototype to view the secure pickup update.'
        : copy.explanation,
      priority: isReady ? 'HIGH' : 'NORMAL',
      relatedType: 'PASSPORT_JOURNEY',
      relatedId: applicationId,
    });
    this.addAudit('PASSPORT_STATUS_UPDATED', `${applicationId} changed to ${status}.`);
    return journey;
  }
}

export const demoStore = new DemoStore();
