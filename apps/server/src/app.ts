import {
  DEMO_OFFICES,
  DEMO_PROFILE,
  OFFICE_DATES,
  createSlots,
  conversationStates,
  sortOfficesByDistance,
  type ConversationState,
} from '@egovai/core';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { join } from 'node:path';
import { z, ZodError } from 'zod';
import { generateAssistantResponse } from './ai/client.js';
import { config } from './config.js';
import { demoStore } from './store.js';

const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === config.WEB_ORIGIN ||
        origin.endsWith('.replit.dev') ||
        origin.endsWith('.repl.co')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'DELETE'],
  }),
);
app.use(express.json({ limit: '100kb' }));

const asyncRoute =
  (handler: (req: Request, res: Response) => Promise<unknown> | unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, prototype: true, aiConfigured: Boolean(config.ABSK_API_KEY) });
});

const aiContextSchema = z
  .object({
    currentState: z.enum(conversationStates),
    language: z.enum(['en', 'fil', 'taglish']).default('en'),
    userMessage: z.string().max(1000),
    forceGuided: z.boolean().optional(),
    profile: z
      .object({
        verified: z.boolean(),
        displayName: z.string().max(60),
        hasExistingPassportRecord: z.boolean(),
      })
      .optional(),
  })
  .passthrough();

app.post(
  '/api/ai/chat',
  asyncRoute(async (req, res) => {
    const context = aiContextSchema.parse(req.body);
    const safeContext = {
      ...context,
      prototype: true,
      profile: context.profile ?? {
        verified: true,
        displayName: DEMO_PROFILE.displayName,
        hasExistingPassportRecord: true,
      },
    };
    const result = await generateAssistantResponse(
      context.currentState as ConversationState,
      safeContext,
      context.forceGuided || !demoStore.aiEnabled,
    );
    res.json(result);
  }),
);

app.get('/api/demo/profile', (_req, res) => res.json(DEMO_PROFILE));

const currentOffices = () =>
  demoStore.forcedNoSlots
    ? DEMO_OFFICES.map((office) => ({ ...office, availableSlotCount: 0 }))
    : DEMO_OFFICES;

app.get('/api/dfa/offices', (_req, res) => res.json(currentOffices()));

app.get('/api/dfa/offices/nearby', (req, res) => {
  const query = z
    .object({ latitude: z.coerce.number().min(-90).max(90), longitude: z.coerce.number().min(-180).max(180) })
    .parse(req.query);
  res.json(sortOfficesByDistance(currentOffices(), query.latitude, query.longitude));
});

app.get('/api/dfa/offices/:officeId/dates', (req, res) => {
  const dates = demoStore.forcedNoSlots
    ? (OFFICE_DATES[req.params.officeId] ?? []).map((date) => ({ ...date, availableSlotCount: 0 }))
    : OFFICE_DATES[req.params.officeId];
  if (!dates) return res.status(404).json({ error: 'Office not found' });
  res.json(dates);
});

app.get('/api/dfa/offices/:officeId/dates/:date/times', (req, res) => {
  const officeExists = DEMO_OFFICES.some((office) => office.id === req.params.officeId);
  const dateExists = OFFICE_DATES[req.params.officeId]?.some((date) => date.date === req.params.date);
  if (!officeExists || !dateExists) return res.status(404).json({ error: 'Schedule not found' });
  res.json(demoStore.forcedNoSlots ? [] : createSlots(req.params.officeId, req.params.date));
});

const formSchema = z.object({
  service: z.enum(['NEW_ADULT', 'ADULT_RENEWAL', 'GROUP']),
  change: z
    .enum(['NO_CHANGE', 'MARRIED_SURNAME', 'RETURN_TO_MAIDEN', 'CORRECTION', 'OTHER'])
    .default('NO_CHANGE'),
  groupApplicantCount: z.number().int().min(2).max(5).optional(),
  consented: z.literal(true),
});
app.post('/api/dfa/forms/prepare', (req, res) => {
  const input = formSchema.parse(req.body);
  res.status(201).json(demoStore.prepareForm(input.service, input.change, input.consented, input.groupApplicantCount));
});

const holdSchema = z.object({
  officeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  service: z.enum(['NEW_ADULT', 'ADULT_RENEWAL', 'GROUP']),
  informationChange: z
    .enum(['NO_CHANGE', 'MARRIED_SURNAME', 'RETURN_TO_MAIDEN', 'CORRECTION', 'OTHER'])
    .optional(),
  processingType: z.enum(['REGULAR', 'EXPEDITED']),
  groupApplicantCount: z.number().int().min(2).max(5).optional(),
});
app.post('/api/dfa/slots/hold', (req, res) => {
  res.status(201).json(demoStore.createHold(holdSchema.parse(req.body)));
});
app.delete('/api/dfa/slots/hold/:holdId', (req, res) => {
  const released = demoStore.releaseHold(req.params.holdId);
  res.status(released ? 204 : 404).end();
});

const slotWatchSchema = z.object({
  officeId: z.string().min(1),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timePreference: z.enum(['MORNING', 'AFTERNOON', 'ANY']),
});
app.post('/api/slot-watch', (req, res) => {
  res.status(201).json(demoStore.createSlotWatch(slotWatchSchema.parse(req.body)));
});
app.get('/api/slot-watch', (_req, res) => {
  res.json({ requests: [...demoStore.slotWatches.values()], offers: [...demoStore.slotOffers.values()] });
});
app.post('/api/demo/slot-watch/trigger', (_req, res) => {
  res.status(201).json(demoStore.triggerSlotWatch());
});
app.post('/api/slot-watch/offers/:offerId/respond', (req, res) => {
  const input = z.object({ response: z.enum(['ACCEPTED', 'DECLINED']) }).parse(req.body);
  res.json(demoStore.respondToOffer(req.params.offerId, input.response));
});
app.post('/api/demo/slot-watch/offers/:offerId/expire', (req, res) => {
  res.json(demoStore.expireSlotOffer(req.params.offerId));
});

const paymentSchema = z.object({
  holdId: z.string().uuid(),
  method: z.enum(['GCASH', 'MAYA', 'CARD']),
  amount: z.number().positive(),
});
app.post('/api/payments/sessions', (req, res) => {
  const input = paymentSchema.parse(req.body);
  res.status(201).json(demoStore.createPayment(input.holdId, input.method, input.amount));
});
app.post('/api/demo/payments/:paymentId/succeed', (req, res) => {
  res.json(demoStore.settlePayment(req.params.paymentId, 'VERIFIED'));
});
app.post('/api/demo/payments/:paymentId/fail', (req, res) => {
  res.json(demoStore.settlePayment(req.params.paymentId, 'FAILED'));
});
app.get('/api/payments/:paymentId', (req, res) => {
  const payment = demoStore.payments.get(req.params.paymentId);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
});

app.post('/api/appointments/confirm', (req, res) => {
  const input = z.object({ paymentId: z.string().uuid() }).parse(req.body);
  res.status(201).json(demoStore.confirmAppointment(input.paymentId));
});
app.get('/api/appointments', (_req, res) => res.json([...demoStore.appointments.values()]));
app.get('/api/appointments/:appointmentId', (req, res) => {
  const appointment = demoStore.appointments.get(req.params.appointmentId);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
  res.json(appointment);
});

app.get('/api/passport-journey/:applicationId', (req, res) => {
  const journey = demoStore.journeys.get(req.params.applicationId);
  if (!journey) return res.status(404).json({ error: 'Passport Journey not found' });
  res.json(journey);
});
app.post('/api/demo/passport-journey/:applicationId/status', (req, res) => {
  const input = z
    .object({
      status: z.enum([
        'APPOINTMENT_CONFIRMED',
        'APPOINTMENT_COMPLETED',
        'BIOMETRICS_CAPTURED',
        'UNDER_REVIEW',
        'ADDITIONAL_REQUIREMENT',
        'APPROVED',
        'IN_PRODUCTION',
        'DISPATCHED',
        'READY_FOR_PICKUP',
        'CLAIMED',
      ]),
    })
    .parse(req.body);
  res.json(demoStore.updateJourney(req.params.applicationId, input.status));
});

app.get('/api/notifications', (_req, res) => {
  res.json([...demoStore.notifications.values()].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
});
app.post('/api/notifications/:notificationId/read', (req, res) => {
  const notification = demoStore.notifications.get(req.params.notificationId);
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  notification.read = true;
  res.json(notification);
});

app.post('/api/demo/settings', (req, res) => {
  const input = z
    .object({
      aiEnabled: z.boolean().optional(),
      forcedNoSlots: z.boolean().optional(),
      acceleratedTimers: z.boolean().optional(),
    })
    .parse(req.body);
  if (input.aiEnabled !== undefined) demoStore.aiEnabled = input.aiEnabled;
  if (input.forcedNoSlots !== undefined) demoStore.forcedNoSlots = input.forcedNoSlots;
  if (input.acceleratedTimers !== undefined) demoStore.acceleratedTimers = input.acceleratedTimers;
  demoStore.addAudit('DEMO_SETTINGS_UPDATED', 'Updated presentation controls.');
  res.json({
    aiEnabled: demoStore.aiEnabled,
    forcedNoSlots: demoStore.forcedNoSlots,
    acceleratedTimers: demoStore.acceleratedTimers,
  });
});
app.post('/api/demo/holds/:holdId/expire', (req, res) => res.json(demoStore.expireHold(req.params.holdId)));
app.get('/api/demo/audit', (_req, res) => res.json(demoStore.audit));
app.post('/api/demo/reset', (_req, res) => {
  demoStore.reset();
  res.json({ ok: true });
});

// Serve built Vite frontend; fall back to API 404 for unmatched /api/* paths
const webDist = join(process.cwd(), 'apps/web/dist');
app.use(express.static(webDist));
app.get('/{*path}', (_req, res) => res.sendFile(join(webDist, 'index.html')));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid demonstration request', issues: error.issues.map((issue) => issue.path.join('.')) });
  }
  const message = error instanceof Error ? error.message : 'Unexpected error';
  const status = /not found/i.test(message) ? 404 : /required|invalid|available|active|match|progression/i.test(message) ? 409 : 500;
  if (process.env.NODE_ENV === 'development') console.warn('Demo request rejected:', message);
  return res.status(status).json({ error: status === 500 ? 'The demonstration service is temporarily unavailable.' : message });
});

export { app };
