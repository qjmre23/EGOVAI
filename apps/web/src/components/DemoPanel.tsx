import type { PassportJourneyStatus } from '@egovai/core';
import {
  BellRing,
  Check,
  CircleOff,
  Clock3,
  CreditCard,
  FastForward,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoStore } from '../store/useDemoStore';

const journeyActions: Array<{ label: string; status: PassportJourneyStatus }> = [
  { label: 'Appointment completed', status: 'APPOINTMENT_COMPLETED' },
  { label: 'Biometrics captured', status: 'BIOMETRICS_CAPTURED' },
  { label: 'Under review', status: 'UNDER_REVIEW' },
  { label: 'Additional requirement', status: 'ADDITIONAL_REQUIREMENT' },
  { label: 'Application approved', status: 'APPROVED' },
  { label: 'In production', status: 'IN_PRODUCTION' },
  { label: 'Dispatched', status: 'DISPATCHED' },
  { label: 'Ready for pickup', status: 'READY_FOR_PICKUP' },
  { label: 'Claimed', status: 'CLAIMED' },
];

export function DemoPanel({ embedded = false }: { embedded?: boolean }) {
  const state = useDemoStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const runPreset = async (preset: 'new' | 'renewal' | 'married' | 'no-slots') => {
    setBusy(true);
    await state.resetDemo();
    const store = useDemoStore.getState();
    store.startBooking();
    if (preset === 'new') store.chooseService('NEW_ADULT');
    else {
      store.chooseService('ADULT_RENEWAL');
      store.chooseCondition('INTACT');
      store.chooseChange(preset === 'married' ? 'MARRIED_SURNAME' : 'NO_CHANGE');
    }
    if (preset === 'no-slots') await useDemoStore.getState().setDemoSetting('forcedNoSlots', true);
    navigate('/chat');
    setBusy(false);
  };

  return (
    <div className={`demo-panel ${embedded ? 'embedded' : ''}`}>
      <div className="demo-panel-header">
        <div className="demo-icon"><FlaskConical size={20} /></div>
        <div>
          <span className="eyebrow">Presentation tools</span>
          <h2>Demo Control Center</h2>
        </div>
      </div>

      <div className="demo-event" aria-live="polite">
        <span>Last event</span>
        <strong>{state.lastEvent}</strong>
      </div>

      <section className="control-section">
        <h3>Scenario presets</h3>
        <div className="control-grid">
          <button type="button" disabled={busy} onClick={() => void runPreset('new')}>
            New passport
          </button>
          <button type="button" disabled={busy} onClick={() => void runPreset('renewal')}>
            Adult renewal
          </button>
          <button type="button" disabled={busy} onClick={() => void runPreset('married')}>
            Married surname
          </button>
          <button type="button" disabled={busy} onClick={() => void runPreset('no-slots')}>
            No slots
          </button>
        </div>
      </section>

      <section className="control-section">
        <h3>Live events</h3>
        <div className="control-stack">
          <button className="control-action" type="button" onClick={() => void state.triggerSlotWatch()}>
            <BellRing size={17} /> Trigger Slot Watch
          </button>
          <button
            className="control-action"
            type="button"
            disabled={!state.payment || state.payment.status !== 'PENDING'}
            onClick={() => void state.settlePayment('success')}
          >
            <Check size={17} /> Mark payment successful
          </button>
          <button
            className="control-action"
            type="button"
            disabled={!state.payment || state.payment.status !== 'PENDING'}
            onClick={() => void state.settlePayment('fail')}
          >
            <CreditCard size={17} /> Mark payment failed
          </button>
          <button className="control-action" type="button" disabled={!state.hold} onClick={() => void state.expireHold()}>
            <Clock3 size={17} /> Expire slot hold
          </button>
        </div>
      </section>

      <section className="control-section">
        <h3>Passport Journey</h3>
        <select
          aria-label="Set next Passport Journey status"
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) void state.advanceJourney(event.target.value as PassportJourneyStatus);
            event.target.value = '';
          }}
        >
          <option value="">Choose next event…</option>
          {journeyActions.map((action) => (
            <option key={action.status} value={action.status}>{action.label}</option>
          ))}
        </select>
      </section>

      <section className="control-section">
        <h3>Environment</h3>
        <label className="toggle-row">
          <span><Sparkles size={16} /> AI API</span>
          <input
            type="checkbox"
            checked={state.aiEnabled}
            onChange={(event) => void state.setDemoSetting('aiEnabled', event.target.checked)}
          />
        </label>
        <label className="toggle-row">
          <span><CircleOff size={16} /> No-slot mode</span>
          <input
            type="checkbox"
            checked={state.forcedNoSlots}
            onChange={(event) => void state.setDemoSetting('forcedNoSlots', event.target.checked)}
          />
        </label>
        <label className="toggle-row">
          <span><FastForward size={16} /> Accelerate timers</span>
          <input
            type="checkbox"
            checked={state.acceleratedTimers}
            onChange={(event) => void state.setDemoSetting('acceleratedTimers', event.target.checked)}
          />
        </label>
      </section>

      <section className="control-section control-footer">
        <button className="control-action" type="button" onClick={state.clearChat}>
          <Trash2 size={17} /> Clear chat
        </button>
        <button className="control-action danger" type="button" onClick={() => void state.resetDemo()}>
          <RotateCcw size={17} /> Reset demo
        </button>
      </section>
    </div>
  );
}
