import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your HackMatch account">
      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div style={errorBanner}>{errors.general}</div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors({}); }}
            autoComplete="email"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors({}); }}
              autoComplete="current-password"
              style={{ paddingRight: '2.75rem' }}
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16 }}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}
          style={{ marginTop: '0.5rem' }}>
          {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</> : 'Sign in →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 14, color: 'var(--text-2)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--amber)', fontWeight: 500 }}>Create one free</Link>
      </p>

      {/* Demo credentials */}
      <div style={{
        marginTop: '2rem', padding: '0.875rem 1rem',
        background: 'var(--surface2)', borderRadius: 10,
        border: '1px solid var(--border)', fontSize: 13,
      }}>
        <div style={{ color: 'var(--text-3)', marginBottom: '0.25rem', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>DEMO CREDENTIALS</div>
        <code style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          demo@hackmatch.dev / Demo1234
        </code>
      </div>
    </AuthLayout>
  );
}

// ── Shared Auth layout wrapper ────────────────────────────────
export function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      background: `
        radial-gradient(ellipse 50% 60% at 20% 50%, rgba(56,217,192,0.05) 0%, transparent 60%),
        radial-gradient(ellipse 50% 60% at 80% 50%, rgba(240,165,0,0.05) 0%, transparent 60%)
      `,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.4rem',
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: 10, fontSize: 18,
                background: 'linear-gradient(135deg, #f0a500, #38d9c0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#0d0f1a',
              }}>H</span>
              <span style={{ color: 'var(--text)' }}>Hack<span style={{ color: 'var(--amber)' }}>Match</span></span>
            </div>
          </Link>
          <h2 style={{ marginTop: '1.25rem', fontSize: '1.5rem', color: 'var(--text)' }}>{title}</h2>
          {subtitle && <p style={{ marginTop: '0.375rem', fontSize: 14 }}>{subtitle}</p>}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const errorBanner = {
  background: 'rgba(240,92,122,0.1)',
  border: '1px solid rgba(240,92,122,0.3)',
  borderRadius: 8, padding: '0.625rem 1rem',
  color: 'var(--rose)', fontSize: 13, marginBottom: '1.25rem',
};
