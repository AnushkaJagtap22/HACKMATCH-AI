import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ink)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }} className="animate-fade">
        {/* Glitchy 404 */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(5rem, 20vw, 9rem)',
          fontWeight: 300,
          lineHeight: 1,
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, var(--amber), var(--teal))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          404
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--text)',
          fontWeight: 300,
          marginBottom: '0.75rem',
        }}>
          Page not found
        </h2>

        <p style={{
          color: 'var(--text-2)',
          marginBottom: '2.5rem',
          lineHeight: 1.7,
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
          >
            ← Go back
          </button>
          <Link
            to={user ? '/dashboard' : '/'}
            className="btn btn-primary"
          >
            {user ? 'Dashboard' : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
