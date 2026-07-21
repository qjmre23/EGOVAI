import { passportJourneyStatuses, type PassportJourneyStatus } from '@egovai/core';
import { format } from 'date-fns';
import {
  BellRing,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  MapPin,
  Navigation,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useDemoStore } from '../store/useDemoStore';

const statusLabels: Record<PassportJourneyStatus, string> = {
  APPOINTMENT_CONFIRMED: 'Appointment confirmed',
  APPOINTMENT_COMPLETED: 'Appointment completed',
  BIOMETRICS_CAPTURED: 'Biometrics captured',
  UNDER_REVIEW: 'Under DFA verification',
  ADDITIONAL_REQUIREMENT: 'Additional requirement (if requested)',
  APPROVED: 'Application approved',
  IN_PRODUCTION: 'Passport production',
  DISPATCHED: 'Dispatched to release location',
  READY_FOR_PICKUP: 'Ready for pickup',
  CLAIMED: 'Passport claimed',
};

export function PassportJourneyPage() {
  const { applicationId } = useParams();
  const { journey, loadJourney, addToast } = useDemoStore();
  useEffect(() => {
    if (applicationId && journey?.applicationId !== applicationId) void loadJourney(applicationId).catch(() => addToast('Passport Journey not found.', 'error'));
  }, [applicationId, journey?.applicationId, loadJourney, addToast]);
  if (!journey || journey.applicationId !== applicationId) {
    return <div className="page padded-page"><div className="loading-card"><Navigation /><span>Loading Passport Journey…</span></div></div>;
  }
  const currentIndex = passportJourneyStatuses.indexOf(journey.currentStatus);
  const eventByStatus = new Map(journey.events.map((event) => [event.status, event]));
  const ready = journey.currentStatus === 'READY_FOR_PICKUP' || journey.currentStatus === 'CLAIMED';
  return (
    <div className="page padded-page journey-page">
      <div className="page-title-row journey-heading">
        <div><span className="eyebrow">APPLICATION STATUS TRACKING</span><h2>Passport Journey</h2><p>{journey.maskedReference}</p></div>
        <div className="journey-progress"><strong>{currentIndex + 1}</strong><span>of {passportJourneyStatuses.length}</span></div>
      </div>
      <div className="source-chip"><ShieldCheck size={14} /> Simulated DFA Status Service</div>

      {ready && (
        <article className="pickup-card">
          <div className="pickup-celebration"><PackageCheck size={30} /></div>
          <span className="eyebrow">HIGH-PRIORITY UPDATE</span>
          <h3>Good news! Your demo passport is ready.</h3>
          <p>DFA has confirmed that the demonstration passport is ready for pickup.</p>
          <div className="pickup-location"><MapPin size={19} /><span><strong>{journey.releaseOffice}</strong><small>Demo releasing hours · Mon–Fri, 9:00 AM–4:00 PM</small></span></div>
          <div className="claim-row"><div><QRCodeSVG value={`DEMO-CLAIM:${journey.applicationId}`} size={86} /><small>CLAIM QR</small></div><ul><li><Check /> Current passport or claim stub</li><li><Check /> Accepted demonstration ID</li><li><Check /> Personal appearance</li></ul></div>
          <div className="button-stack"><button className="primary-button full" type="button" onClick={() => addToast('Pickup reminder set for tomorrow.', 'success')}><BellRing size={17} /> Remind me tomorrow</button><button className="secondary-button full" type="button" onClick={() => addToast('Demo office hours: Monday–Friday, 9:00 AM–4:00 PM.')}>View office hours</button></div>
        </article>
      )}

      <section className="journey-timeline" aria-label="Passport Journey timeline">
        {passportJourneyStatuses.map((status, index) => {
          const event = eventByStatus.get(status);
          const current = index === currentIndex;
          const complete = Boolean(event) && !current;
          return (
            <article key={status} className={`timeline-item ${complete ? 'complete' : current ? 'current' : 'pending'}`}>
              <div className="timeline-rail"><span>{complete ? <Check size={15} /> : current ? <Circle size={13} fill="currentColor" /> : <Circle size={12} />}</span><i /></div>
              <div className="timeline-copy"><div><h3>{statusLabels[status]}</h3>{current && <span className="current-pill">CURRENT</span>}</div>{event ? <><p>{event.explanation}</p><small><Clock3 size={13} /> {format(new Date(event.timestamp), 'MMM d, yyyy · h:mm a')}</small><small><ShieldCheck size={13} /> {event.source}</small></> : <p>Pending a simulated DFA status event.</p>}</div>
            </article>
          );
        })}
      </section>
      <Link className="secondary-button full" to="/appointments">Back to Appointment Wallet <ChevronRight size={17} /></Link>
    </div>
  );
}
