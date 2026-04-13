import React, { useState } from 'react';
import { profileAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const INITIAL = { title: '', description: '', githubUrl: '', liveUrl: '', techStack: '', featured: false };

export default function AddProjectModal({ onClose, onAdd }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.githubUrl && !/^https?:\/\/.+/.test(form.githubUrl)) e.githubUrl = 'Invalid URL';
    if (form.liveUrl && !/^https?:\/\/.+/.test(form.liveUrl)) e.liveUrl = 'Invalid URL';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const techStack = form.techStack
        .split(',').map(s => s.trim()).filter(Boolean);
      const res = await profileAPI.addProject({ ...form, techStack });
      toast.success('Project added!');
      onAdd(res.data.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card animate-scale" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text)' }}>Add project</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ fontSize: 18 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project title *</label>
            <input className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="My Awesome Project" value={form.title} onChange={set('title')} />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea"
              placeholder="What does this project do? What problem does it solve?"
              value={form.description} onChange={set('description')} style={{ minHeight: 80 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Tech stack (comma-separated)</label>
            <input className="form-input" placeholder="React, Node.js, MongoDB, AWS"
              value={form.techStack} onChange={set('techStack')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input className={`form-input ${errors.githubUrl ? 'error' : ''}`}
                placeholder="https://github.com/..." value={form.githubUrl} onChange={set('githubUrl')} />
              {errors.githubUrl && <span className="form-error">{errors.githubUrl}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Live URL</label>
              <input className={`form-input ${errors.liveUrl ? 'error' : ''}`}
                placeholder="https://..." value={form.liveUrl} onChange={set('liveUrl')} />
              {errors.liveUrl && <span className="form-error">{errors.liveUrl}</span>}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', marginBottom: '1.5rem', fontSize: 14, color: 'var(--text-2)' }}>
            <input type="checkbox" checked={form.featured} onChange={set('featured')}
              style={{ width: 16, height: 16, accentColor: 'var(--amber)' }} />
            Featured project
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
