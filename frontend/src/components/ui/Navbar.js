import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import NotificationsPanel from '../notifications/NotificationsPanel';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/discover', label: 'Discover' },
  ];

  return (
    <nav style={{
      background: 'rgba(13,15,26,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 60, gap: '1.5rem' }}>
        {/* Logo */}
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #f0a500, #38d9c0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#0d0f1a',
          }}>H</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.05rem', color: 'var(--text)' }}>
            Hack<span style={{ color: 'var(--amber)' }}>Match</span>
          </span>
          {/* Real-time indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontFamily: 'var(--font-mono)',
            color: connected ? 'var(--teal)' : 'var(--text-3)',
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: connected ? 'var(--teal)' : 'var(--text-3)',
              animation: connected ? 'pulse 2s infinite' : 'none',
            }} />
            {connected ? 'live' : 'offline'}
          </div>
        </NavLink>

        {/* Desktop nav */}
        <div className="hide-mobile" style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              padding: '0.375rem 0.875rem', borderRadius: 8, fontSize: 14, fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? 'var(--amber)' : 'var(--text-2)',
              background: isActive ? 'var(--ambs)' : 'transparent',
              transition: 'all 0.15s',
            })}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hide-mobile">
          {/* Notifications */}
          <NotificationsPanel />

          {/* User dropdown */}
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 40, padding: '0.3rem 0.75rem 0.3rem 0.3rem',
                cursor: 'pointer', color: 'var(--text)', transition: 'border-color 0.15s',
              }}
            >
              {user?.avatar ? (
                <img src={`${API_BASE}${user.avatar}`} alt="" className="avatar" style={{ width: 28, height: 28 }} />
              ) : (
                <div className="avatar-placeholder" style={{ width: 28, height: 28, fontSize: 11 }}>{initials}</div>
              )}
              <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName?.split(' ')[0]}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ color: 'var(--text-3)', transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '0.5rem', minWidth: 180,
                boxShadow: 'var(--shadow)', zIndex: 200,
                animation: 'scaleIn 0.15s ease',
              }}>
                {[
                  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
                  { to: '/profile/edit', label: 'Edit Profile', icon: '✎' },
                  ...(user?.username ? [{ to: `/u/${user.username}`, label: 'Public Profile', icon: '⊙' }] : []),
                ].map(({ to, label, icon }) => (
                  <NavLink key={to} to={to} onClick={() => setDropOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5rem 0.75rem', borderRadius: 8,
                    fontSize: 13, color: 'var(--text-2)', textDecoration: 'none',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
                  >
                    <span style={{ fontSize: 15 }}>{icon}</span> {label}
                  </NavLink>
                ))}
                <div style={{ height: 1, background: 'var(--border)', margin: '0.375rem 0' }} />
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem', borderRadius: 8, width: '100%',
                  fontSize: 13, color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,92,122,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 15 }}>⏻</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(v => !v)}
          style={{ display: 'none', marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '0.5rem', fontSize: 18 }}
          className="mobile-menu-btn">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[...navLinks, { to: '/profile/edit', label: 'Edit Profile' }].map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              padding: '0.625rem 0.875rem', borderRadius: 8, fontSize: 15,
              textDecoration: 'none',
              color: isActive ? 'var(--amber)' : 'var(--text-2)',
              background: isActive ? 'var(--ambs)' : 'transparent',
            })}>
              {label}
            </NavLink>
          ))}
          <button onClick={handleLogout} style={{ padding: '0.625rem 0.875rem', borderRadius: 8, fontSize: 15, color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .mobile-menu-btn { display: block !important; } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
      `}</style>
    </nav>
  );
}
