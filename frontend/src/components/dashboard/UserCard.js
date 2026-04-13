import React from 'react';
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function UserCard({ user }) {
  const initials = user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <Link
      to={user.username ? `/u/${user.username}` : '#'}
      style={{ textDecoration: 'none' }}
    >
      <div className="card" style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        transition: 'transform 0.18s, border-color 0.18s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = 'rgba(240,165,0,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
          {user.avatar ? (
            <img src={`${API_BASE}${user.avatar}`} alt="" className="avatar"
              style={{ width: 48, height: 48, border: '1px solid rgba(255,255,255,0.08)' }} />
          ) : (
            <div className="avatar-placeholder" style={{ width: 48, height: 48, fontSize: '1rem' }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: 15, lineHeight: 1.2 }}>
                {user.fullName}
              </div>
              {user.lookingForTeam && (
                <span style={{
                  fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600,
                  color: 'var(--teal)', background: 'var(--teal-s)',
                  border: '1px solid rgba(56,217,192,0.25)', borderRadius: 4,
                  padding: '1px 6px', letterSpacing: '0.04em',
                }}>
                  OPEN
                </span>
              )}
            </div>
            {user.username && (
              <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                @{user.username}
              </div>
            )}
          </div>
          {user.experienceLevel && (
            <span className={`level-badge level-${user.experienceLevel}`}>
              {user.experienceLevel}
            </span>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p style={{
            fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6,
            marginBottom: '0.875rem', flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {user.bio}
          </p>
        )}

        {/* Skills */}
        {user.skills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.875rem' }}>
            {user.skills.slice(0, 5).map(s => (
              <span key={s} className="tag" style={{ fontSize: 11 }}>{s}</span>
            ))}
            {user.skills.length > 5 && (
              <span style={{ fontSize: 11, color: 'var(--text-3)', alignSelf: 'center' }}>
                +{user.skills.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '0.75rem', borderTop: '1px solid var(--border)',
          marginTop: 'auto',
        }}>
          {user.location ? (
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>📍 {user.location}</span>
          ) : <span />}
          <span style={{
            fontSize: 12, color: 'var(--amber)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            View profile →
          </span>
        </div>
      </div>
    </Link>
  );
}
