import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from './Login';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      e.fullName = 'Full name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Valid email is required';
    if (!form.password || form.password.length < 8)
      e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Must contain uppercase, lowercase, and a number';
    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.fullName.trim(), form.email, form.password);
      toast.success('Account created! Welcome to HackMatch 🎉');
      navigate('/profile/edit');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getStrength = (p) => {
    if (!p) return { score: 0, label: '', color: 'var(--border)' };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['var(--border)', 'var(--rose)', 'var(--amber)', 'var(--teal)', 'var(--teal)'];
    return { score: s, label: labels[s], color: colors[s] };
  };
  const strength = getStrength(form.password);

  return (
    <AuthLayout title="Create your account" subtitle="Join the HackMatch community">
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label">Full name</label>
          <input type="text" className={`form-input ${errors.fullName ? 'error' : ''}`}
            placeholder="Aarav Shah" value={form.fullName} onChange={set('fullName')}
            autoComplete="name" />
          {errors.fullName && <span className="form-error">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="you@example.com" value={form.email} onChange={set('email')}
            autoComplete="email" />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Min 8 chars" value={form.password} onChange={set('password')}
              autoComplete="new-password" style={{ paddingRight: '2.75rem' }} />
            <button type="button" onClick={() => setShowPass(v => !v)}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16 }}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          {form.password && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= strength.score ? strength.color : 'var(--border)',
                    transition: 'background 0.25s',
                  }} />
                ))}
              </div>
              {strength.label && (
                <span style={{ fontSize: 11, color: strength.color }}>{strength.label} password</span>
              )}
            </div>
          )}
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm password</label>
          <input type="password" className={`form-input ${errors.confirm ? 'error' : ''}`}
            placeholder="••••••••" value={form.confirm} onChange={set('confirm')}
            autoComplete="new-password" />
          {errors.confirm && <span className="form-error">{errors.confirm}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}
          style={{ marginTop: '0.25rem' }}>
          {loading
            ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</>
            : 'Create account →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: '1rem' }}>
          By signing up you agree to our Terms & Privacy Policy.
        </p>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--text-2)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--amber)', fontWeight: 500 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
