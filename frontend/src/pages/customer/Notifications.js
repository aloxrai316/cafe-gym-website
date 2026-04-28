import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';

const typeIcons = {
  order_confirmed: '🛒', order_preparing: '👨‍🍳', order_ready: '✅', order_delivered: '🚚',
  order_cancelled: '❌', reservation_confirmed: '📅', reservation_cancelled: '❌',
  membership_expiry: '⏰', membership_created: '💪', payment_received: '💳',
  payment_refund: '💰', low_stock: '📦', general: '📢'
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getMy({});
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      fetchNotifications();
    } catch (error) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      toast.success('All marked as read');
      fetchNotifications();
    } catch (error) {}
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="page-header flex-between">
        <div><h1><FiBell /> Notifications</h1><p>{unreadCount} unread</p></div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
            <FiCheckCircle /> Mark All Read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="empty-state"><h3>No notifications</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(n => (
            <div key={n._id} className="card" style={{ padding: '16px', background: n.isRead ? 'white' : '#fffbf0', borderLeft: n.isRead ? 'none' : '4px solid var(--yellow)', cursor: 'pointer' }}
              onClick={() => !n.isRead && handleMarkRead(n._id)}>
              <div className="flex-between">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>{typeIcons[n.type] || '📢'}</span>
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>{n.title}</h4>
                    <p className="text-sm text-light">{n.message}</p>
                    <p className="text-sm text-light mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!n.isRead && <span className="badge badge-warning">New</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
