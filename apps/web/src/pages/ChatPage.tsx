import {
  DEMO_PASSPORT_RECORD,
  DOCUMENT_WARNING,
  FEES,
  type AppointmentDate,
  type AppointmentSlot,
  type DFAOffice,
  type InformationChangeType,
  type PassportServiceType,
  type ProcessingType,
  type RenewalPassportCondition,
} from '@egovai/core';
import { format, parseISO } from 'date-fns';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Bot,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  CreditCard,
  FileCheck2,
  Info,
  LocateFixed,
  MapPin,
  Navigation,
  QrCode,
  RotateCcw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TimerReset,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { demoFee, useDemoStore, type ChatMessage } from '../store/useDemoStore';

const serviceOptions: Array<{ label: string; value: PassportServiceType; icon: ReactNode }> = [
  { label: 'New adult passport', value: 'NEW_ADULT', icon: <FileCheck2 /> },
  { label: 'Adult passport renewal', value: 'ADULT_RENEWAL', icon: <RotateCcw /> },
  { label: 'Minor passport', value: 'MINOR', icon: <UserRoundCheck /> },
  { label: 'Lost or damaged passport', value: 'LOST_OR_DAMAGED', icon: <CircleAlert /> },
  { label: 'I am not sure', value: 'UNSURE', icon: <Info /> },
];

const conditionOptions: Array<{ label: string; value: RenewalPassportCondition }> = [
  { label: 'Intact ePassport', value: 'INTACT' },
  { label: 'Expired ePassport', value: 'EXPIRED' },
  { label: 'Damaged passport', value: 'DAMAGED' },
  { label: 'Lost or stolen passport', value: 'LOST' },
  { label: 'Old non-ePassport', value: 'OLD_NON_EPASSPORT' },
  { label: 'I am not sure', value: 'UNSURE' },
];

const changeOptions: Array<{ label: string; value: InformationChangeType }> = [
  { label: 'No changes', value: 'NO_CHANGE' },
  { label: 'Use married surname', value: 'MARRIED_SURNAME' },
  { label: 'Return to maiden name', value: 'RETURN_TO_MAIDEN' },
  { label: 'Correct personal information', value: 'CORRECTION' },
  { label: 'Other change', value: 'OTHER' },
];

const dateLabel = (date: string) => format(parseISO(date), 'MMMM d');
const longDate = (date: string) => format(parseISO(date), 'EEEE, MMMM d, yyyy');
const timeLabel = (time: string) =>
  new Date(`2026-01-01T${time}:00`).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  });
const peso = (amount: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';
  return (
    <article className={`message-row ${isAssistant ? 'assistant' : 'user'}`}>
      {isAssistant && (
        <div className="assistant-avatar" aria-label="eGovAI">
          <Bot size={18} aria-hidden="true" />
        </div>
      )}
      <div className={`message-bubble ${message.tone ? `tone-${message.tone}` : ''}`}>
        <p>{message.text}</p>
        <time dateTime={message.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}
        </time>
      </div>
    </article>
  );
}

function TypingIndicator() {
  return (
    <div className="message-row assistant" role="status" aria-label="eGovAI is typing">
      <div className="assistant-avatar"><Bot size={18} /></div>
      <div className="typing-bubble"><i /><i /><i /></div>
    </div>
  );
}

function ChoiceList({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="interaction-card" aria-label={label}>
      {children}
    </div>
  );
}

function OfficeCard({ office, onSelect }: { office: DFAOffice; onSelect: () => void }) {
  return (
    <article className="office-card">
      <div className="office-card-top">
        <div className="office-icon"><Building2 size={21} /></div>
        <div>
          <span className="synthetic-label">SYNTHETIC LOCATION</span>
          <h3>{office.name}</h3>
          <p>{office.address}</p>
        </div>
      </div>
      <div className="office-metrics">
        <span><Navigation size={15} /> {office.distanceKm !== undefined ? `${office.distanceKm} km` : office.city}</span>
        <span><CalendarDays size={15} /> {dateLabel(office.earliestAvailableDate)}</span>
        <span className={office.availableSlotCount ? 'available' : 'unavailable'}>
          <Clock3 size={15} /> {office.availableSlotCount} slots
        </span>
      </div>
      <button className="primary-button full" type="button" onClick={onSelect}>
        Select {office.city} <ChevronRight size={18} />
      </button>
    </article>
  );
}

function DateCard({ date, onSelect }: { date: AppointmentDate; onSelect: () => void }) {
  return (
    <button className="date-card" type="button" onClick={onSelect}>
      <span className="calendar-page">
        <small>{format(parseISO(date.date), 'MMM').toUpperCase()}</small>
        <strong>{format(parseISO(date.date), 'd')}</strong>
      </span>
      <span className="date-card-copy">
        <strong>{format(parseISO(date.date), 'EEEE')}</strong>
        <small className={date.availableSlotCount ? 'available' : 'unavailable'}>
          {date.availableSlotCount ? `${date.availableSlotCount} slots available` : 'No slots · watch this date'}
        </small>
      </span>
      <ChevronRight size={18} />
    </button>
  );
}

function TimeGrid({ times, onSelect }: { times: AppointmentSlot[]; onSelect: (slot: AppointmentSlot) => void }) {
  return (
    <div className="time-grid" role="group" aria-label="Available demonstration times">
      {times.map((slot) => (
        <button key={slot.id} type="button" onClick={() => onSelect(slot)}>
          <Clock3 size={16} /> {timeLabel(slot.time)}
        </button>
      ))}
    </div>
  );
}

function ConsentCard() {
  const prepareForm = useDemoStore((state) => state.prepareForm);
  return (
    <ChoiceList label="Profile consent">
      <div className="consent-card">
        <div className="consent-icon"><ShieldCheck size={24} /></div>
        <div>
          <span className="eyebrow">Permission request</span>
          <h3>Prepare your DFA form</h3>
          <p>Use a verified synthetic eGovPH profile to prefill this demonstration application.</p>
        </div>
        <div className="data-groups">
          <div><BadgeCheck size={16} /><span><strong>Verified government information</strong>Legal name, birth data, sex, parent information</span></div>
          <div><Check size={16} /><span><strong>Citizen-confirmed</strong>Address, mobile, email, occupation, emergency contact</span></div>
          <div><Info size={16} /><span><strong>Declarations</strong>Citizenship, travel purpose, processing and consent</span></div>
        </div>
        <button className="primary-button full" type="button" onClick={() => void prepareForm()}>
          Allow and continue <ArrowRight size={18} />
        </button>
        <button className="text-button full" type="button">View requested information</button>
        <p className="microcopy">No real identity information is collected. Authoritative fields cannot be silently changed.</p>
      </div>
    </ChoiceList>
  );
}

function ReviewFormCard() {
  const { form, informationChange, confirmForm, addToast } = useDemoStore();
  if (!form) return null;
  const renewal = form.type === 'ADULT_RENEWAL';
  return (
    <ChoiceList label="Application review">
      <article className="form-review-card">
        <header>
          <div className="document-icon"><FileCheck2 size={22} /></div>
          <div>
            <span className="eyebrow">Review before continuing</span>
            <h3>{renewal ? 'Passport renewal application' : 'New adult passport application'}</h3>
          </div>
          <span className="completion-ring" aria-label={`${form.completionPercentage}% complete`}>
            {form.completionPercentage}%
          </span>
        </header>

        {renewal && (
          <section className="review-section">
            <span className="review-label">Current passport</span>
            <div className="review-primary"><strong>{DEMO_PASSPORT_RECORD.passportNumberMasked}</strong><BadgeCheck size={17} /></div>
            <p>Issued by {DEMO_PASSPORT_RECORD.issuingAuthority}</p>
            <p>Expires {format(parseISO(DEMO_PASSPORT_RECORD.dateOfExpiry), 'MMMM d, yyyy')} · {useDemoStore.getState().passportCondition === 'EXPIRED' ? 'Expired' : 'Intact'}</p>
          </section>
        )}

        <section className="review-section">
          <span className="review-label">Applicant</span>
          <div className="review-primary"><strong>{form.profile.fullName}</strong><BadgeCheck size={17} /></div>
          <p>{format(parseISO(form.profile.dateOfBirth), 'MMMM d, yyyy')}</p>
          <p>{form.profile.placeOfBirth}</p>
        </section>

        <section className="review-section compact-grid">
          <div><span className="review-label">Contact</span><strong>{form.profile.mobile}</strong><p>{form.profile.email}</p></div>
          <div><span className="review-label">Requested change</span><strong>{informationChange === 'MARRIED_SURNAME' ? 'Use married surname' : 'No biographical changes'}</strong></div>
        </section>

        <section className="requirements-box">
          <span className="review-label">Requirements</span>
          {form.requirements.map((requirement) => (
            <div key={requirement}><CheckCircle2 size={16} /><span>{requirement}</span></div>
          ))}
          {form.warnings.map((warning) => (
            <div className="warning-row" key={warning}><CircleAlert size={16} /><span>{warning}</span></div>
          ))}
        </section>

        <div className="button-stack">
          <button className="primary-button full" type="button" onClick={confirmForm}>
            Confirm information <ArrowRight size={18} />
          </button>
          <button className="secondary-button full" type="button" onClick={() => addToast('Only citizen-confirmed fields are editable in this demo.')}>Edit permitted fields</button>
          <button className="text-button full" type="button" onClick={() => addToast('A correction process may be required before continuing.', 'warning')}>Report incorrect record</button>
        </div>
        <p className="record-warning"><ShieldCheck size={15} /> Verified source fields require a separate correction process.</p>
      </article>
    </ChoiceList>
  );
}

function ProcessingCards() {
  const choose = useDemoStore((state) => state.chooseProcessing);
  return (
    <ChoiceList label="Processing type">
      <div className="processing-grid">
        {(['REGULAR', 'EXPEDITED'] as ProcessingType[]).map((type) => {
          const fee = FEES[type];
          return (
            <button key={type} type="button" className="processing-card" onClick={() => choose(type)}>
              <div><span className="eyebrow">{type === 'REGULAR' ? 'Standard choice' : 'Faster option'}</span><strong>{type === 'REGULAR' ? 'Regular' : 'Expedited'}</strong></div>
              <span className="fee-total">{peso(fee.total)}</span>
              <small>{peso(fee.processing)} processing + {peso(fee.convenience)} convenience</small>
            </button>
          );
        })}
      </div>
    </ChoiceList>
  );
}

function AppointmentReviewCard() {
  const { selectedOffice, selectedDate, selectedTime, service, processingType, createHold } = useDemoStore();
  const fee = demoFee(processingType);
  if (!selectedOffice || !selectedDate || !selectedTime || !processingType || !fee) return null;
  return (
    <ChoiceList label="Appointment review">
      <article className="appointment-review-card">
        <div className="review-hero">
          <div className="review-hero-icon"><CalendarDays size={23} /></div>
          <div><span className="eyebrow">Final review</span><h3>{longDate(selectedDate)}</h3><p>{timeLabel(selectedTime)}</p></div>
        </div>
        <dl className="summary-list">
          <div><dt>Office</dt><dd>{selectedOffice.name}</dd></div>
          <div><dt>Service</dt><dd>{service === 'ADULT_RENEWAL' ? 'Adult ePassport renewal' : 'New adult passport'}</dd></div>
          <div><dt>Processing</dt><dd>{processingType === 'REGULAR' ? 'Regular' : 'Expedited'}</dd></div>
          <div className="total-row"><dt>Total</dt><dd>{peso(fee.total)}</dd></div>
        </dl>
        <div className="inline-notice"><ShieldCheck size={17} /><span>This confirmation creates only a temporary 10-minute hold. It does not confirm an appointment.</span></div>
        <button className="primary-button full" type="button" onClick={() => void createHold()}>
          Confirm and hold this slot <ArrowRight size={18} />
        </button>
      </article>
    </ChoiceList>
  );
}

function HoldCard() {
  const { hold, selectedOffice, continueToPayment, cancelHold } = useDemoStore();
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!hold) return;
    const update = () => setSeconds(Math.max(0, Math.floor((new Date(hold.expiresAt).getTime() - Date.now()) / 1000)));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [hold]);
  if (!hold || !selectedOffice) return null;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return (
    <ChoiceList label="Temporary appointment hold">
      <article className={`hold-card ${seconds < 60 ? 'urgent' : ''}`}>
        <div className="hold-top">
          <div className="hold-icon"><TimerReset size={25} /></div>
          <div><span className="eyebrow">Temporary hold</span><h3>Complete payment before time runs out</h3></div>
          <div className="countdown" aria-live="polite"><strong>{String(minutes).padStart(2, '0')}:{String(remainder).padStart(2, '0')}</strong><span>remaining</span></div>
        </div>
        <dl className="summary-list">
          <div><dt>Location</dt><dd>{selectedOffice.name}</dd></div>
          <div><dt>Schedule</dt><dd>{longDate(hold.date)} · {timeLabel(hold.time)}</dd></div>
          <div><dt>Processing</dt><dd>{hold.processingType === 'REGULAR' ? 'Regular' : 'Expedited'}</dd></div>
          <div className="total-row"><dt>Total</dt><dd>{peso(hold.amount)}</dd></div>
        </dl>
        {seconds > 0 ? (
          <button className="primary-button full" type="button" onClick={continueToPayment}>Continue to payment <ArrowRight size={18} /></button>
        ) : (
          <div className="error-summary" role="alert">This hold has expired. Select another time to continue.</div>
        )}
        <button className="text-button full" type="button" onClick={() => void cancelHold()}>Cancel hold</button>
      </article>
    </ChoiceList>
  );
}

function PaymentMethodCards() {
  const createPayment = useDemoStore((state) => state.createPayment);
  return (
    <ChoiceList label="Payment method">
      <div className="payment-methods">
        <button className="payment-method gcash" type="button" onClick={() => void createPayment('GCASH')}>
          <span className="provider-logo">G</span><span><strong>GCash</strong><small>Simulated wallet payment</small></span><ChevronRight />
        </button>
        <button className="payment-method maya" type="button" onClick={() => void createPayment('MAYA')}>
          <span className="provider-logo">M</span><span><strong>Maya</strong><small>Simulated wallet payment</small></span><ChevronRight />
        </button>
        <button className="payment-method card" type="button" onClick={() => void createPayment('CARD')}>
          <span className="provider-logo"><CreditCard size={21} /></span><span><strong>Credit/debit card</strong><small>Fixed test values only</small></span><ChevronRight />
        </button>
      </div>
      <p className="payment-security"><ShieldCheck size={15} /> Backend verification is required before confirmation.</p>
    </ChoiceList>
  );
}

function PaymentModal() {
  const { payment, hold, settlePayment, cancelPayment } = useDemoStore();
  if (!payment || payment.status !== 'PENDING' || !hold) return null;
  const providerName = payment.method === 'CARD' ? 'Secure card demo' : `${payment.method === 'GCASH' ? 'GCash' : 'Maya'} demo`;
  return (
    <div className="modal-backdrop" role="presentation">
      <section className={`payment-modal provider-${payment.method.toLowerCase()}`} role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <button className="modal-close" type="button" aria-label="Cancel payment" onClick={cancelPayment}><X size={20} /></button>
        <div className="provider-header">
          <div className="provider-large-logo">{payment.method === 'CARD' ? <CreditCard /> : payment.method.charAt(0)}</div>
          <span className="eyebrow">SIMULATED PROVIDER</span>
          <h2 id="payment-title">{providerName}</h2>
          <p>No real payment connection is opened.</p>
        </div>
        <div className="payment-amount"><span>Demo total</span><strong>{peso(payment.amount)}</strong><small>{payment.reference}</small></div>
        {payment.method === 'CARD' && (
          <div className="hosted-frame">
            <strong>Demo payment only. Do not enter real card information.</strong>
            <label>Test card<input readOnly value="4242 •••• •••• 4242" /></label>
            <div><label>Expiry<input readOnly value="12 / 30" /></label><label>Test code<input readOnly value="123" /></label></div>
          </div>
        )}
        <div className="modal-actions">
          <button className="primary-button full" type="button" onClick={() => void settlePayment('success')}>
            <Check size={18} /> Simulate successful payment
          </button>
          <button className="secondary-button full" type="button" onClick={() => void settlePayment('fail')}>Simulate failed payment</button>
          <button className="text-button full" type="button" onClick={cancelPayment}>Cancel payment</button>
        </div>
        <p className="microcopy"><ShieldCheck size={14} /> Returning from this screen does not prove payment. The server checks the reference, amount, hold, and status.</p>
      </section>
    </div>
  );
}

function PaymentFailureCard() {
  const continueToPayment = useDemoStore((state) => state.continueToPayment);
  return (
    <ChoiceList label="Payment failed">
      <div className="failure-card">
        <div className="failure-icon"><CircleAlert /></div>
        <h3>Payment not completed</h3>
        <p>No charge was made and no appointment was confirmed.</p>
        <button className="primary-button full" type="button" onClick={continueToPayment}>Try another payment method</button>
      </div>
    </ChoiceList>
  );
}

function ConfirmationCard() {
  const appointment = useDemoStore((state) => state.appointment);
  if (!appointment) return null;
  return (
    <ChoiceList label="Appointment confirmation">
      <article className="confirmation-card">
        <div className="success-orbit"><CheckCircle2 size={34} /></div>
        <span className="eyebrow">Server verified · appointment confirmed</span>
        <h3>You’re booked for the demonstration</h3>
        <p className="appointment-code">{appointment.code}</p>
        <div className="mini-qr" aria-label="Demonstration appointment QR code"><QrCode size={68} strokeWidth={1.25} /></div>
        <dl className="summary-list">
          <div><dt>Office</dt><dd>{appointment.office.name}</dd></div>
          <div><dt>Date & time</dt><dd>{longDate(appointment.date)} · {timeLabel(appointment.time)}</dd></div>
          <div><dt>Service</dt><dd>{appointment.service === 'ADULT_RENEWAL' ? 'Adult ePassport renewal' : 'New adult passport'}</dd></div>
          <div><dt>Payment</dt><dd>{peso(appointment.amountPaid)} · Verified</dd></div>
        </dl>
        <div className="document-warning">{DOCUMENT_WARNING}</div>
        <div className="button-stack">
          <Link className="primary-button full" to={`/appointments/${appointment.id}`}>View appointment <ArrowRight size={18} /></Link>
          <Link className="secondary-button full" to={`/passport-journey/${appointment.applicationId}`}>Start Passport Journey demo</Link>
        </div>
      </article>
    </ChoiceList>
  );
}

function SlotWatchCard() {
  const { selectedOffice, dates, selectedDate, joinSlotWatch } = useDemoStore();
  const [preference, setPreference] = useState<'MORNING' | 'AFTERNOON' | 'ANY'>('MORNING');
  if (!selectedOffice) return null;
  return (
    <ChoiceList label="Slot Watch configuration">
      <article className="slot-watch-card">
        <div className="slot-watch-heading"><div><BellRing size={23} /></div><span><span className="eyebrow">First-come, first-served</span><h3>Watch this schedule</h3></span></div>
        <dl className="summary-list">
          <div><dt>Office</dt><dd>{selectedOffice.name}</dd></div>
          <div><dt>Date range</dt><dd>{dateLabel(selectedDate ?? dates[0]?.date ?? selectedOffice.earliestAvailableDate)} – {dateLabel(dates.at(-1)?.date ?? selectedOffice.earliestAvailableDate)}</dd></div>
        </dl>
        <fieldset>
          <legend>Preferred time</legend>
          <div className="segmented">
            {(['MORNING', 'AFTERNOON', 'ANY'] as const).map((option) => (
              <button key={option} className={preference === option ? 'selected' : ''} type="button" onClick={() => setPreference(option)}>{option === 'ANY' ? 'Any time' : option.charAt(0) + option.slice(1).toLowerCase()}</button>
            ))}
          </div>
        </fieldset>
        <button className="primary-button full" type="button" onClick={() => void joinSlotWatch(preference)}>Activate Slot Watch <BellRing size={18} /></button>
        <p className="microcopy">One new slot is offered only to the first eligible watcher. Offers expire automatically.</p>
      </article>
    </ChoiceList>
  );
}

function ActiveWatchCard() {
  const triggerSlotWatch = useDemoStore((state) => state.triggerSlotWatch);
  return (
    <ChoiceList label="Active Slot Watch">
      <article className="watch-active-card">
        <div className="pulse-bell"><BellRing size={22} /></div>
        <div><span className="eyebrow">MONITORING</span><h3>Slot Watch is active</h3><p>Use Demo Control Center to simulate a cancellation, or trigger it below during a presentation.</p></div>
        <button className="secondary-button full" type="button" onClick={() => void triggerSlotWatch()}>Simulate a cancellation</button>
      </article>
    </ChoiceList>
  );
}

function SlotOfferCard() {
  const { slotOffer, selectedOffice, respondSlotOffer } = useDemoStore();
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!slotOffer) return;
    const update = () => setSeconds(Math.max(0, Math.floor((new Date(slotOffer.expiresAt).getTime() - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [slotOffer]);
  if (!slotOffer) return null;
  return (
    <ChoiceList label="Slot Watch offer">
      <article className="slot-offer-card">
        <div className="offer-flare"><Sparkles size={24} /></div>
        <span className="eyebrow">MATCH FOUND · TEMPORARY OFFER</span>
        <h3>A schedule just opened</h3>
        <div className="offer-date"><CalendarDays size={21} /><span><strong>{longDate(slotOffer.slot.date)}</strong><small>{selectedOffice?.name} · {timeLabel(slotOffer.slot.time)}</small></span></div>
        <div className="offer-countdown"><Clock3 size={16} /> Offer expires in {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</div>
        <button className="primary-button full" disabled={seconds === 0} type="button" onClick={() => void respondSlotOffer('ACCEPTED')}>Reserve and continue <ArrowRight size={18} /></button>
        <button className="text-button full" type="button" onClick={() => void respondSlotOffer('DECLINED')}>Decline offer</button>
      </article>
    </ChoiceList>
  );
}

function CurrentInteraction() {
  const state = useDemoStore();
  switch (state.conversationState) {
    case 'IDLE':
      return (
        <div className="start-card">
          <div className="start-card-art"><Smartphone size={26} /><span /><span /></div>
          <span className="eyebrow">GUIDED CITIZEN JOURNEY</span>
          <h2>Ready when you are, Juan.</h2>
          <p>Ask naturally or use the guided action below. Personal appearance and biometrics remain required.</p>
          <button className="primary-button full" type="button" onClick={state.startBooking}>Book a DFA appointment <ArrowRight size={18} /></button>
        </div>
      );
    case 'SELECT_SERVICE':
      return (
        <ChoiceList label="Passport service choices">
          <div className="service-list">
            {serviceOptions.map((option) => (
              <button key={option.value} type="button" onClick={() => state.chooseService(option.value)}>
                <span className="choice-icon">{option.icon}</span><span>{option.label}</span><ChevronRight size={18} />
              </button>
            ))}
          </div>
        </ChoiceList>
      );
    case 'RENEWAL_PASSPORT_CONDITION':
      return (
        <ChoiceList label="Passport condition choices">
          <div className="chip-list">{conditionOptions.map((option) => <button key={option.value} type="button" onClick={() => state.chooseCondition(option.value)}>{option.label}</button>)}</div>
        </ChoiceList>
      );
    case 'RENEWAL_INFORMATION_CHANGE':
      return (
        <ChoiceList label="Information change choices">
          <div className="chip-list">{changeOptions.map((option) => <button key={option.value} type="button" onClick={() => state.chooseChange(option.value)}>{option.label}</button>)}</div>
        </ChoiceList>
      );
    case 'REQUEST_LOCATION':
      return (
        <ChoiceList label="Location choices">
          <div className="location-actions">
            <button className="primary-button full" type="button" onClick={() => void state.findOffices('location')}><LocateFixed size={18} /> Allow location</button>
            <div className="manual-cities"><span>Or choose a city</span>{['Quezon City', 'Manila', 'Antipolo', 'Pasig'].map((city) => <button key={city} type="button" onClick={() => void state.findOffices('manual', city)}>{city}</button>)}</div>
            <button className="text-button full" type="button" onClick={() => void state.findOffices('all')}><MapPin size={17} /> View all DFA locations</button>
          </div>
        </ChoiceList>
      );
    case 'FINDING_OFFICES':
      return <div className="loading-card"><LocateFixed size={22} /><span>Finding synthetic DFA offices…</span></div>;
    case 'SELECT_OFFICE':
      return <ChoiceList label="DFA offices"><div className="office-list">{state.offices.map((office) => <OfficeCard key={office.id} office={office} onSelect={() => void state.selectOffice(office)} />)}</div></ChoiceList>;
    case 'SELECT_DATE':
      return <ChoiceList label="Available dates"><div className="date-list">{state.dates.map((date) => <DateCard key={date.date} date={date} onSelect={() => void state.selectDate(date)} />)}</div></ChoiceList>;
    case 'SELECT_TIME':
      return <ChoiceList label="Available times"><TimeGrid times={state.times} onSelect={state.selectTime} /></ChoiceList>;
    case 'NO_SLOT_AVAILABLE':
    case 'CONFIGURE_SLOT_WATCH':
      return <SlotWatchCard />;
    case 'SLOT_WATCH_ACTIVE':
      return <ActiveWatchCard />;
    case 'SLOT_OFFER_AVAILABLE':
      return <SlotOfferCard />;
    case 'PREPARING_FORM':
      return <ConsentCard />;
    case 'REVIEW_FORM':
      return <ReviewFormCard />;
    case 'SELECT_PROCESSING_TYPE':
      return <ProcessingCards />;
    case 'REVIEW_APPOINTMENT':
      return <AppointmentReviewCard />;
    case 'HOLDING_SLOT':
      return <HoldCard />;
    case 'SELECT_PAYMENT_METHOD':
      return <PaymentMethodCards />;
    case 'PAYMENT_PENDING':
    case 'PAYMENT_VERIFYING':
      return <div className="loading-card"><ShieldCheck size={22} /><span>{state.conversationState === 'PAYMENT_VERIFYING' ? 'Verifying server-side…' : 'Awaiting provider simulation…'}</span></div>;
    case 'PAYMENT_FAILED':
      return <PaymentFailureCard />;
    case 'PAYMENT_SUCCESSFUL':
    case 'APPOINTMENT_CONFIRMED':
      return <ConfirmationCard />;
    default:
      return null;
  }
}

export function ChatPage() {
  const { messages, isTyping, aiMode, sendMessage } = useDemoStore();
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isTyping]);
  const statusLabel = useMemo(() => (aiMode === 'ai' ? 'AI assisted' : 'Guided mode'), [aiMode]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    void sendMessage(message);
    setMessage('');
  };

  return (
    <div className="chat-page">
      <div className="chat-statusbar">
        <div><span className={`status-dot ${aiMode}`} />{statusLabel}</div>
        <span>Synthetic data only</span>
      </div>
      <div className="chat-scroll" aria-live="polite" aria-label="Conversation with eGovAI">
        <div className="assistant-intro">
          <div className="assistant-hero-avatar"><Bot size={26} /></div>
          <div><strong>eGovAI</strong><span>Passport Concierge</span></div>
          <span className="secure-chip"><ShieldCheck size={13} /> Safe demo</span>
        </div>
        {messages.map((item) => <MessageBubble key={item.id} message={item} />)}
        {isTyping && <TypingIndicator />}
        {!isTyping && <CurrentInteraction />}
        <div ref={bottomRef} />
      </div>
      <form className="chat-composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="chat-message">Message eGovAI</label>
        <input id="chat-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask eGovAI…" autoComplete="off" />
        <button type="submit" aria-label="Send message" disabled={!message.trim() || isTyping}><Send size={19} /></button>
      </form>
      <PaymentModal />
    </div>
  );
}
