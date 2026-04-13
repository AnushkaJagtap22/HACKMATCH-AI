import React, { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ICONS = {
  team_match: '🤖',
  invitation: '✉️',
  team_updated: '🔄',
  profile_tip: '💡',
  system: '🔔',
};

export default function NotificationsPanel({ onCountChange }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.get();
      setNotifications(res.data.notifications || []);
      const count = res.data.unreadCount || 0;
      setUnreadCount(count);
      onCountChange?.(count);
    } catch (_) {}
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);

    // Listen for real-time notification events
    const handler = () => fetchNotifications();
    window.addEventListener('hm:notification', handler);
    window.addEventListener('hm:team_matched', handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('hm:notification', handler);
      window.removeEventListener('hm:team_matched', handler);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      onCountChange?.(0);
    } catch (_) {}
  };

  const handleClearAll = async () => {
    try {
      await notificationsAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      onCountChange?.(0);
      toast.success('Notifications cleared');
    } catch (_) {}
  };

  const handleReadOne = async (id) => {
    try {
      await notificationsAPI.readOne(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (_) {}
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(v => !v); if (!open) fetchNotifications(); }}
        style={{
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer',
          color: 'var(--text-2)', display: 'flex', alignItems: 'center',
          gap: '0.375rem', transition: 'all 0.15s', position: 'relative',
          fontSize: 16,
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: 'var(--rose)', color: '#fff',
            fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
            width: 18, height: 18, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--ink)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, width: 340, maxHeight: 480,
          overflowY: 'auto', zIndex: 300,
          boxShadow: 'var(--shadow-lg)',
          animation: 'scaleIn 0.15s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)',
            position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 8, fontSize: 11, color: 'var(--rose)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {unreadCount} new
                </span>
              )}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} style={{
                  fontSize: 11, color: 'var(--teal)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: '2px 6px',
                }}>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={handleClearAll} style={{
                  fontSize: 11, color: 'var(--text-3)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: '2px 6px',
                }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              <div style={{ fontSize: 24, marginBottom: '0.5rem' }}>🔔</div>
              No notifications yet
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => !n.read && handleReadOne(n._id)}
                style={{
                  display: 'flex', gap: '0.75rem', padding: '0.875rem 1rem',
                  borderBottom: '1px solid var(--border)',
                  background: n.read ? 'transparent' : 'rgba(240,165,0,0.04)',
                  cursor: n.read ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!n.read) e.currentTarget.style.background = 'rgba(240,165,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(240,165,0,0.04)'; }}
              >
                <div style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>
                  {ICONS[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: n.read ? 400 : 500,
                    color: 'var(--text)', marginBottom: 2, lineHeight: 1.3,
                  }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4, marginBottom: 4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
                {!n.read && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--amber)', flexShrink: 0, marginTop: 6,
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
