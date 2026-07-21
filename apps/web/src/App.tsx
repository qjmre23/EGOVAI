import { PROTOTYPE_DISCLAIMER } from '@egovai/core';
import {
  Bell,
  Bot,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  FlaskConical,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DemoPanel } from './components/DemoPanel';
import { ToastRegion } from './components/ToastRegion';
import { AboutPage, PrivacyPage, ProfilePage } from './pages/InfoPages';
import { AppointmentDetailPage, AppointmentsPage } from './pages/AppointmentsPage';
import { ChatPage } from './pages/ChatPage';
import { DemoControlPage } from './pages/DemoControlPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PassportJourneyPage } from './pages/PassportJourneyPage';
import { useDemoStore } from './store/useDemoStore';

const navItems = [
  { to: '/chat', label: 'eGovAI', icon: Bot },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: CircleUserRound },
];

function BottomNav() {
  const unread = useDemoStore((state) => state.notifications.filter((item) => !item.read).length);
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon-wrap">
            <Icon size={20} aria-hidden="true" />
            {label === 'Notifications' && unread > 0 && (
              <span className="nav-badge" aria-label={`${unread} unread notifications`}>
                {Math.min(unread, 9)}
              </span>
            )}
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function AppHeader() {
  const location = useLocation();
  const title = location.pathname.startsWith('/appointments')
    ? 'Appointments'
    : location.pathname.startsWith('/passport-journey')
      ? 'Passport Journey'
      : location.pathname === '/notifications'
        ? 'Notifications'
        : location.pathname === '/profile'
          ? 'Profile'
          : location.pathname === '/demo-control'
            ? 'Demo Control'
            : location.pathname === '/privacy'
              ? 'Privacy'
              : location.pathname === '/about'
                ? 'About'
                : 'Passport Concierge';

  return (
    <header className="app-header">
      <div className="brand-mark" aria-hidden="true">
        <ShieldCheck size={22} />
      </div>
      <div className="app-header-copy">
        <span className="eyebrow">eGovAI · Prototype</span>
        <strong>{title}</strong>
      </div>
      <NavLink className="header-action mobile-demo-link" to="/demo-control" aria-label="Open demo controls">
        <Menu size={22} />
      </NavLink>
    </header>
  );
}

function App() {
  const loadNotifications = useDemoStore((state) => state.loadNotifications);
  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  return (
    <div className="site-shell">
      <div className="presentation-heading">
        <div>
          <span className="prototype-pill"><FlaskConical size={14} /> HACKATHON PROTOTYPE</span>
          <h1>eGovAI Passport Concierge</h1>
          <p>Ask. Book. Pay. Track.</p>
        </div>
        <a className="presentation-link" href="/about">
          Demo overview <ChevronRight size={16} />
        </a>
      </div>

      <main className="presentation-grid">
        <section className="device-frame" aria-label="eGovAI Passport Concierge mobile demonstration">
          <AppHeader />
          <div className="prototype-banner">
            <FlaskConical size={14} aria-hidden="true" />
            <span>HACKATHON PROTOTYPE</span>
          </div>
          <div className="route-content">
            <Routes>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/appointments/:appointmentId" element={<AppointmentDetailPage />} />
              <Route path="/passport-journey/:applicationId" element={<PassportJourneyPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/demo-control" element={<DemoControlPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          </div>
          <div className="persistent-disclaimer">
            <ShieldCheck size={13} aria-hidden="true" />
            <span>{PROTOTYPE_DISCLAIMER}</span>
          </div>
          <BottomNav />
        </section>

        <aside className="desktop-control" aria-label="Demo Control Center">
          <DemoPanel />
        </aside>
      </main>
      <ToastRegion />
      <div className="sr-only" aria-live="polite" id="app-live-region" />
    </div>
  );
}

export default App;
