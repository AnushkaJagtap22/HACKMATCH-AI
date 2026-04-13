import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileAPI } from '../utils/api';
import ProjectCard from '../components/profile/ProjectCard';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    profileAPI.getPublic(username)
      .then(res => setUser(res.data.user))
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  if (notFound || !user) return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>Profile not found</h2>
        <p style={{ marginBottom: '1.5rem' }}>This profile is private or doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </div>
  );

  const initials = user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink)', paddingBottom: '4rem',
    }}>
      {/* Minimal nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1rem', textDecoration: 'none', color: 'var(--text)' }}>
          Hack<span style={{ color: 'var(--amber)' }}>Match</span> AI
        </Link>
        <Link to="/login" className="btn btn-primary btn-sm">Sign in to match</Link>
      </nav>

      {/* Hero banner */}
      <div style={{
        background: `
          linear-gradient(180deg, var(--ink-soft) 0%, var(--ink) 100%),
          radial-gradient(ellipse 60% 80% at 70% 0%, rgba(56,217,192,0.07) 0%, transparent 60%)
        `,
        borderBottom: '1px solid var(--border)',
        padding: '3rem 0 2rem',
      }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {user.avatar ? (
              <img src={`${API_BASE}${user.avatar}`} alt="" className="avatar"
                style={{ width: 96, height: 96, border: '3px solid var(--border2)' }} />
            ) : (
              <div className="avatar-placeholder" style={{ width: 96, height: 96, fontSize: '1.75rem' }}>
                {initials}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--text)' }}>{user.fullName}</h1>
                {user.experienceLevel && (
                  <span className={`level-badge level-${user.experienceLevel}`}>{user.experienceLevel}</span>
                )}
                {user.lookingForTeam && (
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: 'var(--teal)', background: 'var(--teal-s)',
                    border: '1px solid rgba(56,217,192,0.25)', borderRadius: 20, padding: '2px 10px',
                  }}>Open to team</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
                @{user.username}
              </div>
              {user.bio && (
                <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 540, marginBottom: '0.875rem' }}>
                  {user.bio}
                </p>
              )}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: 13, color: 'var(--text-3)' }}>
                {user.location && <span>📍 {user.location}</span>}
                {user.githubUsername && (
                  <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--text-2)' }}>⬡ GitHub</a>
                )}
                {user.website && (
                  <a href={user.website} target="_blank" rel="noreferrer" style={{ color: 'var(--text-2)' }}>🌐 Website</a>
                )}
                {user.linkedinUrl && (
                  <a href={user.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-2)' }}>in LinkedIn</a>
                )}
              </div>
            </div>

            {user.resumeUrl && (
              <a href={`${API_BASE}${user.resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                View resume ↗
              </a>
            )}
          </div>

          {/* Skills */}
          {user.skills?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '1.5rem' }}>
              {user.skills.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ maxWidth: 860, marginTop: '2rem' }}>
        {user.projects?.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text)', marginBottom: '1rem' }}>
              Projects <span style={{ color: 'var(--text-3)', fontWeight: 300 }}>({user.projects.length})</span>
            </h2>
            <div className="grid-2">
              {user.projects.map(p => (
                <ProjectCard key={p._id} project={p} editable={false} />
              ))}
            </div>
          </>
        )}

        {!user.projects?.length && (
          <div className="empty card" style={{ padding: '3rem' }}>
            <div className="empty-icon">🗂</div>
            No public projects yet.
          </div>
        )}

        {/* CTA */}
        <div className="card" style={{
          marginTop: '2rem', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(240,165,0,0.05), rgba(56,217,192,0.05))',
          border: '1px solid rgba(240,165,0,0.12)',
        }}>
          <p style={{ marginBottom: '1rem' }}>
            Want to team up with <strong style={{ color: 'var(--text)' }}>{user.fullName}</strong>?
          </p>
          <Link to="/register" className="btn btn-primary">Create your HackMatch profile →</Link>
        </div>
      </div>
    </div>
  );
}
