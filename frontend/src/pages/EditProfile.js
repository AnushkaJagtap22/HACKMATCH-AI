import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { profileAPI } from '../utils/api';
import SkillInput from '../components/ui/SkillInput';
import CompletenessBar from '../components/ui/CompletenessBar';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const PREFERRED_ROLES = ['Frontend','Backend','Fullstack','ML/AI','DevOps','Design','Mobile','Data','Other'];

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, loading, fetchProfile } = useProfile();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const avatarRef = useRef(null);
  const resumeRef = useRef(null);

  useEffect(() => {
    if (profile && !form) {
      setForm({
        fullName: profile.fullName || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        githubUsername: profile.githubUsername || '',
        linkedinUrl: profile.linkedinUrl || '',
        twitterHandle: profile.twitterHandle || '',
        skills: profile.skills || [],
        experienceLevel: profile.experienceLevel || 'Beginner',
        preferredRoles: profile.preferredRoles || [],
        isPublic: profile.isPublic !== false,
        lookingForTeam: profile.lookingForTeam || false,
      });
    }
  }, [profile]);

  if (loading || !form) return (
    <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
  );

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
  };

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      preferredRoles: f.preferredRoles.includes(role)
        ? f.preferredRoles.filter(r => r !== role)
        : [...f.preferredRoles, role],
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const res = await profileAPI.uploadAvatar(file);
      await fetchProfile();
      toast.success('Photo updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload photo');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      await profileAPI.uploadResume(file);
      await fetchProfile();
      toast.success('Resume uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error('Full name is required'); return; }
    setSaving(true);
    try {
      await profileAPI.update(form);
      await fetchProfile();
      toast.success('Profile saved!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = avatarPreview || (profile?.avatar ? `${API_BASE}${profile.avatar}` : null);
  const initials = form.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: 860, paddingTop: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text)', marginBottom: '0.375rem' }}>Edit profile</h1>
          <p>Keep your portfolio up to date to improve your match quality.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
          <form onSubmit={handleSave}>

            {/* ── Photo & basic ── */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 500, marginBottom: '1.25rem', color: 'var(--text)', fontSize: 15 }}>
                Basic info
              </div>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="" className="avatar"
                      style={{ width: 72, height: 72, border: '2px solid var(--border2)', opacity: uploadingAvatar ? 0.5 : 1 }} />
                  ) : (
                    <div className="avatar-placeholder" style={{ width: 72, height: 72, fontSize: '1.25rem', opacity: uploadingAvatar ? 0.5 : 1 }}>
                      {initials}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spinner" style={{ width: 20, height: 20 }} />
                    </div>
                  )}
                </div>
                <div>
                  <button type="button" className="btn btn-secondary btn-sm"
                    onClick={() => avatarRef.current?.click()} disabled={uploadingAvatar}>
                    {uploadingAvatar ? 'Uploading...' : 'Change photo'}
                  </button>
                  <div className="form-hint" style={{ marginTop: '0.25rem' }}>JPEG, PNG or WebP · max 5MB</div>
                </div>
                <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange} style={{ display: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full name *</label>
                  <input className="form-input" value={form.fullName} onChange={set('fullName')} placeholder="Your full name" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Username</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-3)', fontSize: 13,
                    }}>@</span>
                    <input className="form-input" value={form.username} onChange={set('username')}
                      placeholder="yourhandle" style={{ paddingLeft: '1.5rem' }} />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.875rem' }}>
                <label className="form-label">Bio</label>
                <textarea className="form-input form-textarea" value={form.bio} onChange={set('bio')}
                  placeholder="Tell the world about yourself — your passions, what you're building, what kind of team you're looking for..."
                  style={{ minHeight: 90 }} />
                <span className="form-hint">{form.bio.length}/500</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location</label>
                  <input className="form-input" value={form.location} onChange={set('location')} placeholder="San Francisco, CA" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Experience level</label>
                  <select className="form-input" value={form.experienceLevel} onChange={set('experienceLevel')}>
                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Skills ── */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text)', fontSize: 15 }}>Skills</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: '1rem' }}>
                Add technologies you're proficient in. These power your team matching.
              </div>
              <SkillInput skills={form.skills} onChange={skills => setForm(f => ({ ...f, skills }))} />
            </div>

            {/* ── Preferred roles ── */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 500, marginBottom: '0.75rem', color: 'var(--text)', fontSize: 15 }}>Preferred roles</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {PREFERRED_ROLES.map(role => (
                  <button key={role} type="button"
                    onClick={() => toggleRole(role)}
                    style={{
                      padding: '0.375rem 0.875rem', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                      border: '1px solid',
                      borderColor: form.preferredRoles.includes(role) ? 'var(--teal)' : 'var(--border)',
                      background: form.preferredRoles.includes(role) ? 'var(--teal-s)' : 'var(--surface2)',
                      color: form.preferredRoles.includes(role) ? 'var(--teal)' : 'var(--text-2)',
                      transition: 'all 0.15s',
                    }}>
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Links ── */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 500, marginBottom: '1rem', color: 'var(--text)', fontSize: 15 }}>Links</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {[
                  { field: 'githubUsername', label: 'GitHub username', placeholder: 'yourhandle' },
                  { field: 'website', label: 'Website', placeholder: 'https://yoursite.com' },
                  { field: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                  { field: 'twitterHandle', label: 'Twitter handle', placeholder: '@handle' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" value={form[field]} onChange={set(field)} placeholder={placeholder} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Resume ── */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: 15, marginBottom: '0.25rem' }}>Resume</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: '1rem' }}>PDF only · max 5MB</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <button type="button" className="btn btn-secondary btn-sm"
                  onClick={() => resumeRef.current?.click()} disabled={uploadingResume}>
                  {uploadingResume ? 'Uploading...' : profile?.resumeUrl ? 'Replace resume' : 'Upload resume'}
                </button>
                {profile?.resumeUrl && (
                  <a href={`${API_BASE}${profile.resumeUrl}`} target="_blank" rel="noreferrer"
                    className="btn btn-ghost btn-sm">View current ↗</a>
                )}
              </div>
              <input ref={resumeRef} type="file" accept="application/pdf"
                onChange={handleResumeChange} style={{ display: 'none' }} />
            </div>

            {/* ── Visibility settings ── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: 15, marginBottom: '1rem' }}>Settings</div>
              {[
                { field: 'isPublic', label: 'Public profile', desc: 'Allow others to view your profile and find you in discovery' },
                { field: 'lookingForTeam', label: 'Open to team', desc: 'Show others you\'re actively looking for a hackathon team' },
              ].map(({ field, label, desc }) => (
                <label key={field} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                  padding: '0.875rem 0', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                }}>
                  <div style={{ paddingTop: 2 }}>
                    <input type="checkbox" checked={form[field]} onChange={set(field)}
                      style={{ width: 16, height: 16, accentColor: 'var(--teal)', marginTop: 1 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                {saving ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</> : 'Save profile'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
            </div>
          </form>

          {/* Sidebar - live preview */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              LIVE PREVIEW
            </div>
            <div className="card" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div className="avatar-placeholder" style={{ width: 56, height: 56, fontSize: '1.1rem', margin: '0 auto 0.75rem' }}>
                {initials}
              </div>
              <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '0.25rem' }}>{form.fullName || 'Your Name'}</div>
              {form.username && <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>@{form.username}</div>}
              {form.experienceLevel && <span className={`level-badge level-${form.experienceLevel}`}>{form.experienceLevel}</span>}
              {form.bio && <p style={{ fontSize: 12, marginTop: '0.625rem', lineHeight: 1.5 }}>{form.bio.slice(0, 100)}{form.bio.length > 100 ? '...' : ''}</p>}
              {form.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                  {form.skills.slice(0, 6).map(s => <span key={s} className="tag" style={{ fontSize: 10 }}>{s}</span>)}
                  {form.skills.length > 6 && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>+{form.skills.length - 6}</span>}
                </div>
              )}
            </div>
            <CompletenessBar user={{ ...profile, ...form }} compact />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .edit-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
