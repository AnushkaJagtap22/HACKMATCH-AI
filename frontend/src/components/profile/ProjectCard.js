import React, { useState } from 'react';
import { profileAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProjectCard({ project, editable = false, onUpdate }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this project?')) return;
    setDeleting(true);
    try {
      const res = await profileAPI.deleteProject(project._id);
      toast.success('Project deleted');
      onUpdate?.(res.data.user);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card" style={{ position: 'relative', transition: 'transform 0.15s, border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      {project.featured && (
        <div style={{
          position: 'absolute', top: -1, right: 16,
          background: 'var(--amber)', color: '#1a1200',
          fontSize: 10, fontWeight: 600, padding: '2px 10px',
          borderRadius: '0 0 8px 8px', letterSpacing: '0.05em',
        }}>
          FEATURED
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.375rem', lineHeight: 1.3 }}>
            {project.title}
          </h3>
          {project.description && (
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: '0.75rem', color: 'var(--text-2)' }}>
              {project.description}
            </p>
          )}
        </div>
      </div>

      {project.techStack?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
          {project.techStack.map(t => (
            <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <GithubIcon /> GitHub
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            ↗ Live demo
          </a>
        )}
        {editable && (
          <button onClick={handleDelete} disabled={deleting}
            className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>
            {deleting ? '...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
  </svg>
);
