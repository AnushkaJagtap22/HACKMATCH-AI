import React from 'react';

const CHECKS = [
  { key: 'bio', label: 'Bio', pts: 15, test: u => !!u.bio },
  { key: 'avatar', label: 'Photo', pts: 10, test: u => !!u.avatar },
  { key: 'skills', label: 'Skills', pts: 20, test: u => u.skills?.length > 0 },
  { key: 'projects', label: 'Projects', pts: 20, test: u => u.projects?.length > 0 },
  { key: 'github', label: 'GitHub', pts: 10, test: u => !!u.githubUsername },
  { key: 'location', label: 'Location', pts: 5, test: u => !!u.location },
  { key: 'resume', label: 'Resume', pts: 5, test: u => !!u.resumeUrl },
];

export default function CompletenessBar({ user, compact = false }) {
  if (!user) return null;

  const score = user.profileCompleteness ?? (() => {
    let s = 10; // base for fullName
    CHECKS.forEach(c => { if (c.test(user)) s += c.pts; });
    return Math.min(s, 100);
  })();

  const missing = CHECKS.filter(c => !c.test(user));
  const color = score >= 80 ? 'var(--teal)' : score >= 50 ? 'var(--amber)' : 'var(--rose)';

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{ flex: 1 }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: 'var(--font-mono)', minWidth: 34 }}>
          {score}%
        </span>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontWeight: 500, marginBottom: 2 }}>Profile completeness</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {score === 100 ? 'Your profile is complete! 🎉' : `${missing.length} item${missing.length !== 1 ? 's' : ''} left to boost visibility`}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300,
          color, lineHeight: 1,
        }}>
          {score}
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: '1rem', height: 8 }}>
        <div className="progress-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}, var(--amber))` }} />
      </div>

      {missing.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: '0.5rem' }}>Add to complete:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {missing.map(c => (
              <span key={c.key} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                background: 'var(--surface2)', color: 'var(--text-3)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
              }}>
                +{c.pts} {c.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
