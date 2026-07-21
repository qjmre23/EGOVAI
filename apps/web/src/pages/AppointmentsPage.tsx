import { DOCUMENT_WARNING, type Appointment } from '@egovai/core';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  Download,
  MapPin,
  Plus,
  Printer,
  ReceiptText,
  Route,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useDemoStore } from '../store/useDemoStore';

const peso = (amount: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
const timeLabel = (time: string) =>
  new Date(`2026-01-01T${time}:00`).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
const serviceLabel = (appointment: Appointment) => {
  if (appointment.service === 'GROUP') return 'Group passport appointment';
  if (appointment.service === 'ADULT_RENEWAL') return 'Adult ePassport renewal';
  return 'New adult passport';
};

function AppointmentWalletCard({ appointment }: { appointment: Appointment }) {
  return (
    <article className="wallet-card">
      <div className="wallet-card-band">
        <span><BadgeCheck size={15} /> CONFIRMED</span>
        <small>DEMONSTRATION</small>
      </div>
      <div className="wallet-card-date">
        <span className="calendar-page large">
          <small>{format(parseISO(appointment.date), 'MMM').toUpperCase()}</small>
          <strong>{format(parseISO(appointment.date), 'd')}</strong>
        </span>
        <div>
          <h3>{appointment.office.name}</h3>
          <p><Clock3 size={15} /> {timeLabel(appointment.time)} · {appointment.processingType === 'REGULAR' ? 'Regular' : 'Expedited'}</p>
          <p><MapPin size={15} /> {appointment.office.city}</p>
        </div>
      </div>
      <div className="wallet-code"><span>Appointment code</span><strong>{appointment.code}</strong></div>
      {appointment.groupAppointmentCodes?.length ? (
        <div className="group-code-list compact">
          {appointment.groupAppointmentCodes.map((code, index) => (
            <span key={code}><strong>Applicant {index + 1}</strong>{code}</span>
          ))}
        </div>
      ) : null}
      <div className="wallet-card-actions">
        <Link className="primary-button" to={`/appointments/${appointment.id}`}>Open appointment <ArrowRight size={17} /></Link>
        <Link className="icon-button" to={`/passport-journey/${appointment.applicationId}`} aria-label="View Passport Journey"><Route size={19} /></Link>
      </div>
    </article>
  );
}

export function AppointmentsPage() {
  const { appointments, appointment, loadAppointments } = useDemoStore();
  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);
  const records = appointments.length ? appointments : appointment ? [appointment] : [];
  return (
    <div className="page padded-page appointments-page">
      <div className="page-title-row">
        <div><span className="eyebrow">APPOINTMENT WALLET</span><h2>Your passport visits</h2><p>Codes, packets, receipts, and journey status in one safe place.</p></div>
        <div className="page-title-icon"><WalletCards /></div>
      </div>
      {records.length ? (
        <>
          <section className="wallet-section"><h3>Upcoming</h3>{records.filter((item) => item.status === 'CONFIRMED').map((item) => <AppointmentWalletCard key={item.id} appointment={item} />)}</section>
          <section className="wallet-section muted-section"><h3>Past appointments</h3><div className="empty-inline">No past demonstration appointments.</div></section>
        </>
      ) : (
        <div className="empty-state">
          <div><CalendarDays size={31} /></div>
          <h3>No appointments yet</h3>
          <p>Complete a demonstration booking with eGovAI and it will appear here automatically.</p>
          <Link className="primary-button" to="/chat"><Plus size={18} /> Book a demo appointment</Link>
        </div>
      )}
    </div>
  );
}

function downloadCalendar(appointment: Appointment) {
  const compactDate = appointment.date.replaceAll('-', '');
  const compactTime = appointment.time.replace(':', '');
  const contents = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//eGovAI Hackathon Prototype//EN',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@demo.egovai.local`,
    `DTSTART:${compactDate}T${compactTime}00`,
    `SUMMARY:DEMO DFA passport appointment`,
    `LOCATION:${appointment.office.name}`,
    `DESCRIPTION:${DOCUMENT_WARNING} - ${appointment.code}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/calendar' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${appointment.code}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AppointmentDetailPage() {
  const { appointmentId } = useParams();
  const { appointment, loadAppointment, addToast } = useDemoStore();
  useEffect(() => {
    if (appointmentId && appointment?.id !== appointmentId) void loadAppointment(appointmentId).catch(() => addToast('Appointment not found.', 'error'));
  }, [appointmentId, appointment?.id, loadAppointment, addToast]);
  if (!appointment || appointment.id !== appointmentId) {
    return <div className="page padded-page"><div className="loading-card"><CalendarDays /><span>Loading appointment packet…</span></div></div>;
  }

  const qrValue = JSON.stringify({ prototype: true, appointmentCode: appointment.code, id: appointment.id });
  return (
    <div className="page appointment-detail-page">
      <div className="detail-back-row no-print"><Link to="/appointments"><ArrowLeft size={18} /> Appointment Wallet</Link><span className="verified-status"><BadgeCheck size={15} /> Confirmed</span></div>
      <article className="print-packet">
        <div className="document-watermark">DEMONSTRATION ONLY</div>
        <header className="packet-header">
          <div className="packet-brand"><div><ShieldCheck /></div><span><strong>eGovAI Passport Concierge</strong><small>Ask. Book. Pay. Track.</small></span></div>
          <span className="demo-stamp">HACKATHON<br />PROTOTYPE</span>
        </header>
        <div className="packet-title"><span className="eyebrow">APPOINTMENT PACKET</span><h1>Passport appointment</h1><p>{appointment.code}</p></div>
        <section className="packet-hero">
          <div className="packet-date"><small>{format(parseISO(appointment.date), 'MMMM').toUpperCase()}</small><strong>{format(parseISO(appointment.date), 'd')}</strong><span>{format(parseISO(appointment.date), 'yyyy')}</span></div>
          <div className="packet-location"><span className="eyebrow">SCHEDULE</span><h2>{format(parseISO(appointment.date), 'EEEE')} · {timeLabel(appointment.time)}</h2><p><MapPin size={16} /> {appointment.office.name}</p><small>{appointment.office.address}</small></div>
          <div className="packet-qr"><QRCodeSVG value={qrValue} size={108} level="M" /><span>DEMO QR</span></div>
        </section>
        <section className="packet-grid">
          <div><span className="review-label">Service</span><strong>{serviceLabel(appointment)}</strong><p>{appointment.processingType === 'REGULAR' ? 'Regular' : 'Expedited'} processing</p></div>
          <div><span className="review-label">Payment</span><strong>{peso(appointment.amountPaid)} · Verified</strong><p>{appointment.paymentReference}</p></div>
          <div><span className="review-label">Application</span><strong>{appointment.applicationId.slice(0, 12)}••••</strong><p>Synthetic reference</p></div>
          <div><span className="review-label">Generated</span><strong>{format(new Date(appointment.createdAt), 'MMM d, yyyy')}</strong><p>{format(new Date(appointment.createdAt), 'h:mm a')}</p></div>
        </section>
        {appointment.groupAppointmentCodes?.length ? (
          <section className="packet-requirements">
            <h3>Applicant codes</h3>
            {appointment.groupAppointmentCodes.map((code, index) => <div key={code}><span><Check size={15} /></span>Applicant {index + 1}: {code}</div>)}
          </section>
        ) : null}
        <section className="packet-requirements">
          <h3>Bring on appointment day</h3>
          {appointment.requirements.map((requirement) => <div key={requirement}><span><Check size={15} /></span>{requirement}</div>)}
        </section>
        <div className="document-warning large-warning">{DOCUMENT_WARNING}</div>
        <p className="packet-note">This synthetic packet does not reserve a real government appointment and contains no real DFA security features. Personal appearance and biometrics remain required in an actual process.</p>
      </article>
      <div className="packet-actions no-print">
        <button className="primary-button" type="button" onClick={() => window.print()}><Printer size={18} /> Print packet</button>
        <button className="secondary-button" type="button" onClick={() => window.print()}><Download size={18} /> Save as PDF</button>
        <button className="secondary-button" type="button" onClick={() => downloadCalendar(appointment)}><CalendarDays size={18} /> Add to calendar</button>
        <Link className="secondary-button" to={`/passport-journey/${appointment.applicationId}`}><Route size={18} /> Passport Journey</Link>
      </div>
      <section className="receipt-card no-print">
        <div><ReceiptText size={21} /><span><strong>Demonstration receipt</strong><small>{appointment.paymentReference}</small></span></div>
        <strong>{peso(appointment.amountPaid)}</strong>
      </section>
      <div className="document-warning no-print">{DOCUMENT_WARNING}</div>
    </div>
  );
}
