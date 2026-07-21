import {
  DEMO_PROFILE,
  FEES,
  fallbackForState,
  type Appointment,
  type AppointmentDate,
  type AppointmentHold,
  type AppointmentSlot,
  type ApplicationForm,
  type ConversationState,
  type DFAOffice,
  type InformationChangeType,
  type Notification,
  type PassportJourney,
  type PassportJourneyStatus,
  type PassportServiceType,
  type PaymentSession,
  type ProcessingType,
  type RenewalPassportCondition,
  type SlotOffer,
  type SlotWatchRequest,
} from '@egovai/core';
import { create } from 'zustand';
import { api } from '../api';

export type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
  tone?: 'info' | 'success' | 'warning' | 'error';
};

type Toast = { id: string; message: string; tone: 'info' | 'success' | 'warning' | 'error' };

const id = () => crypto.randomUUID();
const timestamp = () => new Date().toISOString();
const assistant = (text: string, tone: ChatMessage['tone'] = 'info'): ChatMessage => ({
  id: id(),
  role: 'assistant',
  text,
  timestamp: timestamp(),
  tone,
});
const user = (text: string): ChatMessage => ({ id: id(), role: 'user', text, timestamp: timestamp() });

const openingMessages: ChatMessage[] = [
  assistant(
    'Hello, Juan! I can help prepare a passport application, find a synthetic DFA schedule, simulate payment, and track a demo Passport Journey.',
  ),
];

type DemoState = {
  conversationState: ConversationState;
  messages: ChatMessage[];
  isTyping: boolean;
  aiMode: 'ai' | 'guided';
  forcedGuided: boolean;
  aiEnabled: boolean;
  acceleratedTimers: boolean;
  forcedNoSlots: boolean;
  service: PassportServiceType | null;
  groupApplicantCount: number | null;
  passportCondition: RenewalPassportCondition | null;
  informationChange: InformationChangeType;
  offices: DFAOffice[];
  selectedOffice: DFAOffice | null;
  dates: AppointmentDate[];
  selectedDate: string | null;
  times: AppointmentSlot[];
  selectedTime: string | null;
  form: ApplicationForm | null;
  processingType: ProcessingType | null;
  hold: AppointmentHold | null;
  payment: PaymentSession | null;
  appointment: Appointment | null;
  appointments: Appointment[];
  journey: PassportJourney | null;
  notifications: Notification[];
  slotWatches: SlotWatchRequest[];
  slotOffer: SlotOffer | null;
  toasts: Toast[];
  lastEvent: string;
  addToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (toastId: string) => void;
  sendMessage: (message: string) => Promise<void>;
  startBooking: () => void;
  chooseService: (service: PassportServiceType) => void;
  chooseGroupSize: (count: number) => void;
  confirmGroupApplicants: () => void;
  chooseCondition: (condition: RenewalPassportCondition) => void;
  chooseChange: (change: InformationChangeType) => void;
  findOffices: (mode: 'location' | 'manual' | 'all', city?: string) => Promise<void>;
  selectOffice: (office: DFAOffice) => Promise<void>;
  selectDate: (date: AppointmentDate) => Promise<void>;
  selectTime: (slot: AppointmentSlot) => void;
  prepareForm: () => Promise<void>;
  confirmForm: () => void;
  chooseProcessing: (type: ProcessingType) => void;
  createHold: () => Promise<void>;
  cancelHold: () => Promise<void>;
  continueToPayment: () => void;
  createPayment: (method: PaymentSession['method']) => Promise<void>;
  settlePayment: (outcome: 'success' | 'fail') => Promise<void>;
  cancelPayment: () => void;
  joinSlotWatch: (preference: SlotWatchRequest['timePreference']) => Promise<void>;
  triggerSlotWatch: () => Promise<void>;
  respondSlotOffer: (response: 'ACCEPTED' | 'DECLINED') => Promise<void>;
  loadAppointments: () => Promise<void>;
  loadAppointment: (appointmentId: string) => Promise<void>;
  loadJourney: (applicationId: string) => Promise<void>;
  advanceJourney: (status: PassportJourneyStatus) => Promise<void>;
  loadNotifications: () => Promise<void>;
  readNotification: (notificationId: string) => Promise<void>;
  setDemoSetting: (setting: 'aiEnabled' | 'forcedNoSlots' | 'acceleratedTimers', value: boolean) => Promise<void>;
  expireHold: () => Promise<void>;
  resetDemo: () => Promise<void>;
  clearChat: () => void;
};

const cityCoordinates: Record<string, [number, number]> = {
  'Quezon City': [14.676, 121.0437],
  Manila: [14.5995, 120.9842],
  Antipolo: [14.5865, 121.1762],
  Pasig: [14.5764, 121.0851],
  'Cebu City': [10.3157, 123.8854],
  'Davao City': [7.0731, 125.6128],
};

const journeyFastTrack: PassportJourneyStatus[] = [
  'APPOINTMENT_CONFIRMED',
  'APPOINTMENT_COMPLETED',
  'BIOMETRICS_CAPTURED',
  'UNDER_REVIEW',
  'APPROVED',
  'IN_PRODUCTION',
  'DISPATCHED',
  'READY_FOR_PICKUP',
  'CLAIMED',
];

export const useDemoStore = create<DemoState>((set, get) => {
  const addAssistant = (text: string, tone: ChatMessage['tone'] = 'info') =>
    set((state) => ({ messages: [...state.messages, assistant(text, tone)] }));
  const addUser = (text: string) =>
    set((state) => ({ messages: [...state.messages, user(text)] }));
  const event = (lastEvent: string) => set({ lastEvent });

  return {
    conversationState: 'IDLE',
    messages: openingMessages,
    isTyping: false,
    aiMode: 'guided',
    forcedGuided: false,
    aiEnabled: true,
    acceleratedTimers: false,
    forcedNoSlots: false,
    service: null,
    groupApplicantCount: null,
    passportCondition: null,
    informationChange: 'NO_CHANGE',
    offices: [],
    selectedOffice: null,
    dates: [],
    selectedDate: null,
    times: [],
    selectedTime: null,
    form: null,
    processingType: null,
    hold: null,
    payment: null,
    appointment: null,
    appointments: [],
    journey: null,
    notifications: [],
    slotWatches: [],
    slotOffer: null,
    toasts: [],
    lastEvent: 'Prototype ready',

    addToast: (message, tone = 'info') => {
      const toast = { id: id(), message, tone };
      set((state) => ({ toasts: [...state.toasts, toast] }));
      window.setTimeout(() => get().dismissToast(toast.id), 4200);
    },
    dismissToast: (toastId) =>
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== toastId) })),

    sendMessage: async (message) => {
      const trimmed = message.trim();
      if (!trimmed || get().isTyping) return;
      addUser(trimmed);
      const currentState = get().conversationState === 'IDLE' ? 'SELECT_SERVICE' : get().conversationState;
      set({ isTyping: true, conversationState: currentState });
      try {
        const result = await api<{ response: ReturnType<typeof fallbackForState>; mode: 'ai' | 'guided' }>(
          '/api/ai/chat',
          {
            method: 'POST',
            body: JSON.stringify({
              prototype: true,
              currentState,
              language: /\b(po|ako|salamat|pwede|kailangan)\b/i.test(trimmed) ? 'taglish' : 'en',
              userMessage: trimmed,
              profile: { verified: true, displayName: 'Juan', hasExistingPassportRecord: true },
              offices: get().offices,
              selectedOffice: get().selectedOffice,
              selectedDate: get().selectedDate,
              selectedTime: get().selectedTime,
              availableDates: get().dates,
              availableTimes: get().times,
              payment: { status: get().payment?.status ?? 'NOT_STARTED' },
              booking: { status: get().appointment?.status ?? 'NOT_CONFIRMED' },
              passportJourney: get().journey,
              forceGuided: get().forcedGuided,
            }),
          },
        );
        set((state) => ({
          aiMode: result.mode,
          conversationState: result.response.state,
          messages: [
            ...state.messages,
            assistant(result.response.message, result.response.alertLevel),
          ],
        }));
      } catch {
        const fallback = fallbackForState(currentState);
        set((state) => ({
          aiMode: 'guided',
          messages: [...state.messages, assistant(fallback.message, fallback.alertLevel)],
        }));
      } finally {
        set({ isTyping: false });
      }
    },

    startBooking: () => {
      addUser('Can you book me a DFA appointment?');
      addAssistant('Certainly. What passport service do you need?');
      set({ conversationState: 'SELECT_SERVICE' });
    },

    chooseService: (service) => {
      const labels: Record<PassportServiceType, string> = {
        NEW_ADULT: 'New adult passport',
        ADULT_RENEWAL: 'Adult passport renewal',
        GROUP: 'Group appointment',
        MINOR: 'Minor passport',
        LOST_OR_DAMAGED: 'Lost or damaged passport',
        UNSURE: 'I am not sure',
      };
      addUser(labels[service]);
      if (service === 'ADULT_RENEWAL') {
        set({ service, conversationState: 'RENEWAL_PASSPORT_CONDITION' });
        addAssistant('What is the current condition of your passport?');
      } else if (service === 'GROUP') {
        set({ service, groupApplicantCount: null, conversationState: 'SELECT_GROUP_SIZE' });
        addAssistant('How many people are applying together? DFA group appointment flow supports 2 to 5 applicants.');
      } else if (service === 'NEW_ADULT') {
        set({ service, conversationState: 'REQUEST_LOCATION' });
        addAssistant('To find nearby DFA offices, may eGovAI use your current location?');
      } else {
        addAssistant(
          'I can show guided demonstration requirements for that case. The complete booking prototype currently supports new adults and selected adult renewals.',
          'warning',
        );
      }
    },

    chooseGroupSize: (groupApplicantCount) => {
      addUser(`${groupApplicantCount} applicants`);
      set({ groupApplicantCount, conversationState: 'REVIEW_GROUP_APPLICANTS' });
      addAssistant(
        'I prepared the group checklist. Each applicant keeps their own information and receives a separate demonstration appointment code.',
      );
    },

    confirmGroupApplicants: () => {
      addUser('Continue with group appointment');
      set({ conversationState: 'REQUEST_LOCATION' });
      addAssistant('Choose a DFA site for the group. I can use your location to show the nearest DFA locations first.');
    },

    chooseCondition: (passportCondition) => {
      const supported = passportCondition === 'INTACT' || passportCondition === 'EXPIRED';
      addUser(
        passportCondition === 'INTACT'
          ? 'Intact ePassport'
          : passportCondition === 'EXPIRED'
            ? 'Expired ePassport'
            : 'Other passport condition',
      );
      set({ passportCondition });
      if (supported) {
        set({ conversationState: 'RENEWAL_INFORMATION_CHANGE' });
        addAssistant('Are you requesting changes to your name or personal information?');
      } else {
        addAssistant(
          'This case needs additional DFA review. For the complete demo journey, choose an intact or expired ePassport.',
          'warning',
        );
      }
    },

    chooseChange: (informationChange) => {
      const supported = informationChange === 'NO_CHANGE' || informationChange === 'MARRIED_SURNAME';
      addUser(informationChange === 'MARRIED_SURNAME' ? 'Use married surname' : 'No changes');
      set({ informationChange });
      if (!supported) {
        addAssistant(
          'That change may require a correction process. This prototype fully demonstrates no change or use of a married surname.',
          'warning',
        );
        return;
      }
      set({ conversationState: 'REQUEST_LOCATION' });
      addAssistant('To find nearby DFA offices, may eGovAI use your current location?');
    },

    findOffices: async (mode, city) => {
      addUser(
        mode === 'location'
          ? 'Allow location'
          : mode === 'manual'
            ? city ?? 'Select city manually'
            : 'View all DFA locations',
      );
      set({ conversationState: 'FINDING_OFFICES', isTyping: true });
      try {
        let offices: DFAOffice[];
        if (mode === 'location') {
          const coordinates = await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) return reject(new Error('Location is unavailable'));
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 7000,
              maximumAge: 60_000,
            });
          });
          offices = await api<DFAOffice[]>(
            `/api/dfa/offices/nearby?latitude=${coordinates.coords.latitude}&longitude=${coordinates.coords.longitude}`,
          );
        } else if (mode === 'manual' && city) {
          const [latitude, longitude] = cityCoordinates[city] ?? cityCoordinates['Quezon City']!;
          offices = await api<DFAOffice[]>(
            `/api/dfa/offices/nearby?latitude=${latitude}&longitude=${longitude}`,
          );
        } else {
          offices = await api<DFAOffice[]>('/api/dfa/offices');
        }
        set({ offices, conversationState: 'SELECT_OFFICE' });
        addAssistant(
          get().forcedNoSlots
            ? 'No-slot mode is on, so the nearest DFA locations are shown with no available demonstration slots.'
            : mode === 'location'
              ? 'Based on your location, these are the nearest DFA locations with demonstration appointments.'
              : 'Here are the DFA locations available in this prototype.',
        );
      } catch {
        const offices = await api<DFAOffice[]>('/api/dfa/offices').catch(() => []);
        set({ offices, conversationState: 'REQUEST_LOCATION' });
        addAssistant(
          'I could not access your location. You can select a city manually or view all DFA locations.',
          'warning',
        );
      } finally {
        set({ isTyping: false });
      }
    },

    selectOffice: async (selectedOffice) => {
      addUser(selectedOffice.name);
      set({ selectedOffice, isTyping: true });
      try {
        const dates = await api<AppointmentDate[]>(`/api/dfa/offices/${selectedOffice.id}/dates`);
        set({ dates, selectedDate: null, times: [], selectedTime: null });
        if (!dates.some((date) => date.availableSlotCount > 0)) {
          set({ conversationState: 'NO_SLOT_AVAILABLE' });
          addAssistant(
            `${selectedOffice.name} currently has no demonstration slots matching your request. Would you like eGovAI to notify you when one becomes available?`,
            'warning',
          );
        } else {
          set({ conversationState: 'SELECT_DATE' });
          addAssistant(
            `${selectedOffice.name} currently has ${dates.reduce((sum, date) => sum + date.availableSlotCount, 0)} demonstration slots. Select your preferred date.`,
          );
        }
      } catch {
        get().addToast('Unable to load the demonstration schedule.', 'error');
      } finally {
        set({ isTyping: false });
      }
    },

    selectDate: async (date) => {
      addUser(new Date(`${date.date}T12:00:00`).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' }));
      set({ selectedDate: date.date, isTyping: true });
      if (date.availableSlotCount === 0) {
        set({ conversationState: 'NO_SLOT_AVAILABLE', isTyping: false });
        addAssistant('There are no matching demonstration slots on that date. Slot Watch can monitor it for you.', 'warning');
        return;
      }
      try {
        const times = await api<AppointmentSlot[]>(
          `/api/dfa/offices/${get().selectedOffice!.id}/dates/${date.date}/times`,
        );
        if (!times.length) {
          set({ times, conversationState: 'NO_SLOT_AVAILABLE' });
          addAssistant('Those demonstration times just became unavailable. Would you like to join Slot Watch?', 'warning');
        } else {
          set({ times, conversationState: 'SELECT_TIME' });
          addAssistant('These demonstration times are available. Select one specific time.');
        }
      } finally {
        set({ isTyping: false });
      }
    },

    selectTime: (slot) => {
      addUser(
        new Date(`2026-01-01T${slot.time}:00`).toLocaleTimeString('en-PH', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      );
      set({ selectedTime: slot.time, conversationState: 'PREPARING_FORM' });
      addAssistant('May eGovPH use your verified synthetic profile information to prepare your DFA application?');
    },

    prepareForm: async () => {
      addUser('Allow and continue');
      set({ isTyping: true });
      try {
        const form = await api<ApplicationForm>('/api/dfa/forms/prepare', {
          method: 'POST',
          body: JSON.stringify({
            service: get().service,
            change: get().informationChange,
            groupApplicantCount: get().groupApplicantCount ?? undefined,
            consented: true,
          }),
        });
        set({ form, conversationState: 'REVIEW_FORM' });
        addAssistant(
          get().service === 'GROUP'
            ? 'Your group appointment forms are ready. Review the shared schedule and the per-applicant information checklist before continuing.'
            : get().informationChange === 'MARRIED_SURNAME'
            ? 'Your renewal form is ready. A synthetic PSA marriage-record check was added to the requirements.'
            : 'Your demonstration application is ready. Please review it before continuing.',
        );
      } catch {
        get().addToast('The demonstration form could not be prepared.', 'error');
      } finally {
        set({ isTyping: false });
      }
    },

    confirmForm: () => {
      addUser('Confirm information');
      set({ conversationState: 'SELECT_PROCESSING_TYPE' });
      addAssistant(
        get().service === 'GROUP'
          ? 'Choose a processing type. The demonstration total is calculated per applicant.'
          : 'Choose a demonstration processing type. Fees are configurable mock data.',
      );
    },

    chooseProcessing: (processingType) => {
      addUser(processingType === 'REGULAR' ? 'Regular processing' : 'Expedited processing');
      set({ processingType, conversationState: 'REVIEW_APPOINTMENT' });
      addAssistant('Review your appointment details and explicitly confirm to place a temporary hold.');
    },

    createHold: async () => {
      addUser('Confirm and hold this slot');
      set({ isTyping: true });
      try {
        const hold = await api<AppointmentHold>('/api/dfa/slots/hold', {
          method: 'POST',
          body: JSON.stringify({
            officeId: get().selectedOffice?.id,
            date: get().selectedDate,
            time: get().selectedTime,
            service: get().service,
            informationChange: get().informationChange,
            processingType: get().processingType,
            groupApplicantCount: get().groupApplicantCount ?? undefined,
          }),
        });
        set({ hold, conversationState: 'HOLDING_SLOT' });
        addAssistant(
          `Your ${get().selectedDate} ${get().selectedTime} demonstration appointment is temporarily held while payment is completed.`,
          'success',
        );
      } catch (error) {
        set({ conversationState: 'SELECT_TIME' });
        addAssistant(error instanceof Error ? error.message : 'The slot could not be held.', 'error');
      } finally {
        set({ isTyping: false });
      }
    },

    cancelHold: async () => {
      const hold = get().hold;
      if (hold) await api(`/api/dfa/slots/hold/${hold.id}`, { method: 'DELETE' }).catch(() => undefined);
      set({ hold: null, conversationState: 'SELECT_TIME' });
      addAssistant('The demonstration hold was released. Choose another time when ready.', 'warning');
    },

    continueToPayment: () => {
      set({ conversationState: 'SELECT_PAYMENT_METHOD' });
      addAssistant('Choose a simulated payment method. No real payment will be initiated.');
    },

    createPayment: async (method) => {
      addUser(method === 'CARD' ? 'Credit/debit card' : method === 'GCASH' ? 'GCash' : 'Maya');
      try {
        const payment = await api<PaymentSession>('/api/payments/sessions', {
          method: 'POST',
          body: JSON.stringify({ holdId: get().hold?.id, method, amount: get().hold?.amount }),
        });
        set({ payment, conversationState: 'PAYMENT_PENDING' });
        addAssistant('The simulated transaction is awaiting completion. Use the demo provider controls to continue.');
      } catch {
        addAssistant('The payment session could not be created. Check that the appointment hold is active.', 'error');
      }
    },

    settlePayment: async (outcome) => {
      const payment = get().payment;
      if (!payment) return;
      set({ conversationState: 'PAYMENT_VERIFYING', isTyping: true });
      addAssistant('The backend is verifying the simulated transaction…');
      try {
        const verified = await api<PaymentSession>(
          `/api/demo/payments/${payment.id}/${outcome === 'success' ? 'succeed' : 'fail'}`,
          { method: 'POST' },
        );
        set({ payment: verified });
        if (verified.status !== 'VERIFIED') {
          set({ conversationState: 'PAYMENT_FAILED' });
          addAssistant('The simulated payment failed. No charge was made.', 'error');
          get().addToast('Demo payment failed — no charge made.', 'error');
          event('Marked payment failed');
          return;
        }
        set({ conversationState: 'PAYMENT_SUCCESSFUL' });
        const appointment = await api<Appointment>('/api/appointments/confirm', {
          method: 'POST',
          body: JSON.stringify({ paymentId: verified.id }),
        });
        set({ appointment, conversationState: 'APPOINTMENT_CONFIRMED' });
        addAssistant(
          appointment.service === 'GROUP'
            ? `Payment successful! Your group demonstration appointment is confirmed. Group code: ${appointment.code}`
            : `Payment successful! Your demonstration DFA passport appointment is confirmed. Code: ${appointment.code}`,
          'success',
        );
        get().addToast('Demonstration appointment confirmed.', 'success');
        await get().loadNotifications();
        event('Verified payment and confirmed appointment');
      } catch {
        set({ conversationState: 'PAYMENT_FAILED' });
        addAssistant('Payment verification was delayed. The appointment has not been confirmed.', 'warning');
      } finally {
        set({ isTyping: false });
      }
    },

    cancelPayment: () => {
      set({ payment: null, conversationState: 'SELECT_PAYMENT_METHOD' });
      addAssistant('The simulated payment was cancelled. Your hold remains active for now.', 'warning');
    },

    joinSlotWatch: async (timePreference) => {
      const office = get().selectedOffice;
      if (!office) return;
      addUser('Join Slot Watch');
      set({ conversationState: 'CONFIGURE_SLOT_WATCH' });
      const dateFrom = get().selectedDate ?? get().dates[0]?.date ?? office.earliestAvailableDate;
      const dateTo = get().dates.at(-1)?.date ?? dateFrom;
      try {
        const request = await api<SlotWatchRequest>('/api/slot-watch', {
          method: 'POST',
          body: JSON.stringify({ officeId: office.id, dateFrom, dateTo, timePreference }),
        });
        set((state) => ({
          slotWatches: [...state.slotWatches, request],
          conversationState: 'SLOT_WATCH_ACTIVE',
        }));
        addAssistant(
          `Slot Watch is active for ${office.name}, ${dateFrom}, ${timePreference.toLowerCase()} appointments.`,
          'success',
        );
        get().addToast('Slot Watch activated.', 'success');
        event('Activated Slot Watch');
      } catch {
        addAssistant('Slot Watch could not be activated.', 'error');
      }
    },

    triggerSlotWatch: async () => {
      try {
        const slotOffer = await api<SlotOffer>('/api/demo/slot-watch/trigger', { method: 'POST' });
        set({ slotOffer, conversationState: 'SLOT_OFFER_AVAILABLE' });
        addAssistant(
          `A ${slotOffer.slot.date} appointment at ${get().selectedOffice?.name ?? 'your selected office'} became available at ${slotOffer.slot.time}. Would you like to reserve it?`,
          'success',
        );
        get().addToast('A matching demonstration slot is available!', 'success');
        await get().loadNotifications();
        event('Triggered Slot Watch cancellation alert');
      } catch {
        get().addToast('Activate Slot Watch before triggering an offer.', 'warning');
      }
    },

    respondSlotOffer: async (response) => {
      const offer = get().slotOffer;
      if (!offer) return;
      await api(`/api/slot-watch/offers/${offer.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response }),
      });
      if (response === 'ACCEPTED') {
        addUser('Reserve and continue');
        set({
          selectedDate: offer.slot.date,
          selectedTime: offer.slot.time,
          conversationState: 'PREPARING_FORM',
        });
        addAssistant('The offered slot is reserved for your next step. May eGovPH prepare your form from the synthetic profile?');
      } else {
        set({ slotOffer: null, conversationState: 'SLOT_WATCH_ACTIVE' });
        addAssistant('The offer was declined. This request left the demonstration queue.', 'warning');
      }
      event(`Slot offer ${response.toLowerCase()}`);
    },

    loadAppointments: async () => {
      const appointments = await api<Appointment[]>('/api/appointments').catch(() => []);
      set({ appointments });
    },
    loadAppointment: async (appointmentId) => {
      const appointment = await api<Appointment>(`/api/appointments/${appointmentId}`);
      set({ appointment });
    },
    loadJourney: async (applicationId) => {
      const journey = await api<PassportJourney>(`/api/passport-journey/${applicationId}`);
      set({ journey });
    },
    advanceJourney: async (status) => {
      const applicationId = get().appointment?.applicationId ?? get().journey?.applicationId;
      if (!applicationId) {
        get().addToast('Confirm an appointment before advancing Passport Journey.', 'warning');
        return;
      }
      try {
        const currentStatus = get().journey?.currentStatus ?? 'APPOINTMENT_CONFIRMED';
        const fromIndex = journeyFastTrack.indexOf(currentStatus);
        const toIndex = journeyFastTrack.indexOf(status);
        const reviewIndex = journeyFastTrack.indexOf('UNDER_REVIEW');
        const statuses =
          get().acceleratedTimers && currentStatus === 'ADDITIONAL_REQUIREMENT' && toIndex > reviewIndex
            ? ['UNDER_REVIEW' as PassportJourneyStatus, ...journeyFastTrack.slice(reviewIndex + 1, toIndex + 1)]
            : get().acceleratedTimers && fromIndex >= 0 && toIndex > fromIndex
              ? journeyFastTrack.slice(fromIndex + 1, toIndex + 1)
              : get().acceleratedTimers && status === 'ADDITIONAL_REQUIREMENT' && currentStatus !== 'UNDER_REVIEW' && fromIndex >= 0
                ? [...journeyFastTrack.slice(fromIndex + 1, reviewIndex + 1), status]
                : [status];
        let journey: PassportJourney | null = null;
        for (const nextStatus of statuses) {
          journey = await api<PassportJourney>(`/api/demo/passport-journey/${applicationId}/status`, {
            method: 'POST',
            body: JSON.stringify({ status: nextStatus }),
          });
        }
        if (!journey) return;
        set({ journey });
        const latest = journey.events.at(-1)!;
        addAssistant(latest.explanation, status === 'READY_FOR_PICKUP' ? 'success' : 'info');
        get().addToast(latest.title, status === 'READY_FOR_PICKUP' ? 'success' : 'info');
        if (status === 'READY_FOR_PICKUP') set({ conversationState: 'PASSPORT_READY_FOR_PICKUP' });
        await get().loadNotifications();
        event(`Passport Journey: ${latest.title}`);
      } catch {
        get().addToast('Use the next valid Passport Journey status.', 'warning');
      }
    },
    loadNotifications: async () => {
      const notifications = await api<Notification[]>('/api/notifications').catch(() => []);
      set({ notifications });
    },
    readNotification: async (notificationId) => {
      const updated = await api<Notification>(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      set((state) => ({
        notifications: state.notifications.map((item) => (item.id === updated.id ? updated : item)),
      }));
    },

    setDemoSetting: async (setting, value) => {
      await api('/api/demo/settings', {
        method: 'POST',
        body: JSON.stringify({ [setting]: value }),
      });
      set({ [setting]: value } as Pick<DemoState, typeof setting>);
      if (setting === 'aiEnabled') set({ forcedGuided: !value });
      if (setting === 'forcedNoSlots') {
        if (value) {
          set((state) => ({
            offices: state.offices.map((office) => ({ ...office, availableSlotCount: 0 })),
            selectedOffice: state.selectedOffice ? { ...state.selectedOffice, availableSlotCount: 0 } : null,
            dates: state.dates.map((date) => ({ ...date, availableSlotCount: 0 })),
            times: [],
            selectedTime: null,
          }));
        } else {
          const offices = await api<DFAOffice[]>('/api/dfa/offices').catch(() => get().offices);
          set((state) => ({
            offices,
            selectedOffice: state.selectedOffice
              ? offices.find((office) => office.id === state.selectedOffice?.id) ?? state.selectedOffice
              : null,
          }));
        }
      }
      get().addToast(
        setting === 'forcedNoSlots'
          ? `No-slot locations ${value ? 'enabled' : 'disabled'}.`
          : setting === 'acceleratedTimers'
            ? `Accelerated timers and Passport Journey fast-forward ${value ? 'enabled' : 'disabled'}.`
            : `${setting} ${value ? 'enabled' : 'disabled'}.`,
      );
      event(`Changed ${setting} to ${String(value)}`);
    },

    expireHold: async () => {
      const hold = get().hold;
      if (!hold) {
        get().addToast('Create a slot hold first.', 'warning');
        return;
      }
      const expired = await api<AppointmentHold>(`/api/demo/holds/${hold.id}/expire`, { method: 'POST' });
      set({ hold: expired, conversationState: 'SELECT_TIME', payment: null });
      addAssistant('The demonstration hold expired and the slot returned to availability.', 'warning');
      event('Expired appointment hold');
    },

    resetDemo: async () => {
      await api('/api/demo/reset', { method: 'POST' }).catch(() => undefined);
      set({
        conversationState: 'IDLE',
        messages: openingMessages,
        isTyping: false,
        aiMode: 'guided',
        forcedGuided: false,
        aiEnabled: true,
        acceleratedTimers: false,
        forcedNoSlots: false,
        service: null,
        groupApplicantCount: null,
        passportCondition: null,
        informationChange: 'NO_CHANGE',
        offices: [],
        selectedOffice: null,
        dates: [],
        selectedDate: null,
        times: [],
        selectedTime: null,
        form: null,
        processingType: null,
        hold: null,
        payment: null,
        appointment: null,
        appointments: [],
        journey: null,
        notifications: [],
        slotWatches: [],
        slotOffer: null,
        lastEvent: 'Demo reset',
      });
      get().addToast('The demonstration was reset.', 'success');
    },
    clearChat: () => {
      set({ messages: openingMessages });
      event('Cleared chat');
    },
  };
});

export const demoFee = (type: ProcessingType | null) => (type ? FEES[type] : null);
export { DEMO_PROFILE };
