import { DEMO_PROFILE, PROTOTYPE_DISCLAIMER } from '@egovai/core';
import { BadgeCheck, BellRing, Bot, ChevronRight, CircleHelp, FileLock2, Fingerprint, FlaskConical, Info, Languages, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDemoStore } from '../store/useDemoStore';

export function ProfilePage() {
  const addToast = useDemoStore((state) => state.addToast);
  return (
    <div className="page padded-page profile-page">
      <div className="profile-hero"><div className="profile-avatar">JD<span><BadgeCheck size={16} /></span></div><div><span className="eyebrow">SYNTHETIC EGOVPH PROFILE</span><h2>Juan Dela Cruz</h2><p>Verified demonstration citizen</p></div></div>
      <section className="profile-card"><div className="profile-card-heading"><Fingerprint size={20} /><span><strong>Verified profile data</strong><small>Demonstration source</small></span><span className="verified-status"><BadgeCheck size={14} /> Verified</span></div><dl className="profile-data"><div><dt>Legal name</dt><dd>{DEMO_PROFILE.fullName}</dd></div><div><dt>Mobile</dt><dd>{DEMO_PROFILE.mobile}</dd></div><div><dt>Email</dt><dd>{DEMO_PROFILE.email}</dd></div><div><dt>Address</dt><dd>{DEMO_PROFILE.address}</dd></div></dl><button className="text-button" type="button" onClick={() => addToast('Verified source data uses a separate correction process.', 'warning')}>Report incorrect government record</button></section>
      <section className="settings-list"><h3>Preferences</h3><button type="button" onClick={() => addToast('Language preference is English for this demo.')}><Languages /><span><strong>Language</strong><small>English · Taglish supported in chat</small></span><ChevronRight /></button><button type="button" onClick={() => addToast('Notification controls are available in Demo Control Center.')}><BellRing /><span><strong>Notifications</strong><small>In-app and browser demo alerts</small></span><ChevronRight /></button><Link to="/privacy"><FileLock2 /><span><strong>Privacy & safety</strong><small>How synthetic information is handled</small></span><ChevronRight /></Link><Link to="/about"><CircleHelp /><span><strong>About this prototype</strong><small>Hackathon scope and limitations</small></span><ChevronRight /></Link></section>
      <div className="profile-warning"><FlaskConical size={17} /><span>{PROTOTYPE_DISCLAIMER}</span></div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="page padded-page info-page">
      <div className="info-hero"><div><LockKeyhole /></div><span className="eyebrow">PRIVACY BY DESIGN</span><h2>Safe for a live demo</h2><p>No real citizen, passport, National ID, card, OTP, or wallet credentials are needed.</p></div>
      <section><h3><ShieldCheck /> What stays protected</h3><ul><li>The AI credential remains on the local server.</li><li>Only masked and synthetic profile fields enter conversational context.</li><li>Payments are fixed simulations with server-side status verification.</li><li>Browser notifications use lock-screen-safe wording.</li></ul></section>
      <section><h3><Info /> Never enter in chat</h3><div className="do-not-enter"><span>Card number or CVV</span><span>OTP or wallet PIN</span><span>Full passport number</span><span>National ID number</span><span>Password</span></div></section>
      <Link className="primary-button full" to="/chat">Return to eGovAI</Link>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="page padded-page info-page about-page">
      <div className="info-hero brand"><div><Bot /></div><span className="eyebrow">HACKATHON CONCEPT</span><h2>Ask. Book. Pay. Track.</h2><p>A citizen-friendly vision for a future eGovAI passport journey.</p></div>
      <section className="about-steps"><div><span>1</span><Bot /><strong>Ask naturally</strong><p>English, Filipino, or Taglish guidance.</p></div><div><span>2</span><MapPin /><strong>Find a schedule</strong><p>Nearby synthetic offices and Slot Watch.</p></div><div><span>3</span><ShieldCheck /><strong>Pay safely</strong><p>Deterministic server-verified simulations.</p></div><div><span>4</span><BellRing /><strong>Track updates</strong><p>Proactive Passport Journey messages.</p></div></section>
      <div className="official-warning"><FlaskConical /><div><strong>Unofficial demonstration</strong><p>{PROTOTYPE_DISCLAIMER}</p></div></div>
      <Link className="primary-button full" to="/chat">Explore the prototype</Link>
    </div>
  );
}
