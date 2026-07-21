import type { Notification } from '@egovai/core';
import { formatDistanceToNow } from 'date-fns';
import { Bell, BellRing, CalendarDays, CheckCheck, CreditCard, Info, PackageCheck, Radar } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoStore } from '../store/useDemoStore';

const categoryIcon: Record<Notification['category'], typeof Bell> = {
  APPOINTMENT: CalendarDays,
  SLOT_WATCH: Radar,
  PAYMENT: CreditCard,
  PASSPORT_STATUS: PackageCheck,
  PICKUP: BellRing,
  SYSTEM: Info,
};

export function NotificationsPage() {
  const { notifications, loadNotifications, readNotification } = useDemoStore();
  const navigate = useNavigate();
  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);
  const open = async (notification: Notification) => {
    if (!notification.read) await readNotification(notification.id);
    if (notification.relatedType === 'APPOINTMENT') navigate(`/appointments/${notification.relatedId}`);
    else if (notification.relatedType === 'PASSPORT_JOURNEY') navigate(`/passport-journey/${notification.relatedId}`);
    else navigate('/chat');
  };
  return (
    <div className="page padded-page notifications-page">
      <div className="page-title-row"><div><span className="eyebrow">SAFE PREVIEWS</span><h2>Notifications</h2><p>Status updates never show sensitive identity details on the lock screen.</p></div><div className="page-title-icon"><Bell /></div></div>
      <div className="notification-list">
        {notifications.length ? notifications.map((notification) => {
          const Icon = categoryIcon[notification.category];
          return (
            <button key={notification.id} className={`notification-card ${notification.read ? 'read' : 'unread'} priority-${notification.priority.toLowerCase()}`} type="button" onClick={() => void open(notification)}>
              <span className="notification-icon"><Icon size={20} /></span>
              <span className="notification-copy"><span className="notification-meta"><small>{notification.category.replace('_', ' ')}</small><time>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</time></span><strong>{notification.title}</strong><p>{notification.preview}</p></span>
              {!notification.read && <i aria-label="Unread" />}
            </button>
          );
        }) : <div className="empty-state compact"><div><CheckCheck /></div><h3>You’re all caught up</h3><p>New demo booking and passport updates will appear here.</p></div>}
      </div>
    </div>
  );
}
