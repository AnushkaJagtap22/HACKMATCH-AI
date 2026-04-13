import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { matchAPI } from '../utils/api';
import CompletenessBar from '../components/ui/CompletenessBar';
import ProjectCard from '../components/profile/ProjectCard';
import AddProjectModal from '../components/profile/AddProjectModal';
import MatchResults from '../components/matching/MatchResults';
import ChatAssistant from '../components/chat/ChatAssistant';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading, fetchProfile } = useProfile();
  const [showAddProject, setShowAddProject] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [matchError, setMatchError] = useState(null);
  const [teamSize, setTeamSize] = useState(4);

  // Listen for real-time team match events
  useEffect(() => {
    const handler = (e) => {
      fetchProfile();
    };
    window.addEventListener('hm:team_matched', handler);
    return () => window.removeEventListener('hm:team_matched', handler);
  }, [fetchProfile]);

  const handleMatch = useCallback(async () => {
    if (!profile?.skills?.length) {
      toast.error('Add at least one skill before matching', { duration: 3000 });
      return;
    }
    setMatching(true);
    setMatchResults(null);
    setMatchError(null);
    try {
      const res = await matchAPI.run(teamSize);
      setMatchResults(res.data);
      toast.success(`Found ${res.data.teams.length} team option${res.data.teams.length > 1 ? 's' : ''}!`, { duration: 4000 });
      // Scroll to results
      setTimeout(() => {
        document.getElementById('match-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err) {
      const msg = err.response?.data?.error || 'Matching failed. Try again.';
      setMatchError(msg);
      toast.error(msg);
    } finally {
      setMatching(false);
    }
  }, [profile, teamSize]);

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const p = profile || user;
  const initials = p?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* ── Profile hero ── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--ink-soft) 0%, var(--ink) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {p?.avatar ? (
                <img src={`${API_BASE}${p.avatar}`} alt="" className="avatar"
                  style={{ width: 80, height: 80, border: '3px solid var(--border2)' }} />
              ) : (
                <div className="avatar-placeholder" style={{ width: 80, height: 80, fontSize: '1.5rem' }}>
                  {initials}
                </div>
              )}
              {p?.lookingForTeam && (
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--teal)', border: '2px solid var(--ink)',
                }} title="Open to team" />
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.75rem', color: 'var(--text)' }}>{p?.fullName}</h1>
                {p?.experienceLevel && (
                  <span className={`level-badge level-${p.experienceLevel}`}>{p.experienceLevel}</span>
                )}
                {p?.lookingForTeam && (
                  <span style={{ fontSize: 11, color: 'var(--teal)', background: 'var(--teal-s)', border: '1px solid rgba(56,217,192,0.25)', borderRadius: 20, padding: '2px 10px', fontFamily: 'var(--font-mono)' }}>
                    OPEN TO TEAM
                  </span>
                )}
              </div>
              {p?.username && (
                <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                  @{p.username}
                </div>
              )}
              {p?.bio && (
                <p style={{ fontSize: 14, maxWidth: 520, lineHeight: 1.6 }}>{p.bio}</p>
              )}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: 13, color: 'var(--text-3)', marginTop: '0.375rem' }}>
                {p?.location && <span>📍 {p.location}</span>}
                {p?.githubUsername && (
                  <a href={`https://github.com/${p.githubUsername}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-2)' }}>
                    ⬡ {p.githubUsername}
                  </a>
                )}
                {p?.website && (
                  <a href={p.website} target="_blank" rel="noreferrer" style={{ color: 'var(--text-2)' }}>🌐 Website</a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link to="/profile/edit" className="btn btn-secondary btn-sm">Edit profile</Link>
              {p?.resumeUrl && (
                <a href={`${API_BASE}${p.resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  Resume ↗
                </a>
              )}
            </div>
          </div>

          {/* Skills */}
          {p?.skills?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '1.25rem' }}>
              {p.skills.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Main column ── */}
          <div style={{ minWidth: 0 }}>

            {/* Match Me section */}
            <div className="card" style={{
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(240,165,0,0.04), rgba(56,217,192,0.04))',
              border: '1px solid rgba(240,165,0,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: 24 }}>🤖</span>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: 15 }}>AI Team Matching</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Multi-dimensional scoring across real users</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                    Our AI analyzes skill complementarity, experience balance, diversity, and interest alignment to form your optimal team.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Team size:</span>
                    <select
                      value={teamSize}
                      onChange={e => setTeamSize(Number(e.target.value))}
                      style={{
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '3px 8px', color: 'var(--text)',
                        fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      {[3, 4, 5].map(n => (
                        <option key={n} value={n}>{n} people</option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleMatch}
                    disabled={matching}
                    style={{ minWidth: 140 }}
                  >
                    {matching ? (
                      <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Matching...</>
                    ) : '⚡ Match Me'}
                  </button>
                </div>
              </div>

              {matchError && (
                <div style={{
                  marginTop: '0.875rem', padding: '0.625rem 0.875rem',
                  background: 'rgba(240,92,122,0.1)', border: '1px solid rgba(240,92,122,0.25)',
                  borderRadius: 8, fontSize: 13, color: 'var(--rose)',
                }}>
                  {matchError}
                </div>
              )}
            </div>

            {/* Match Results */}
            {matchResults && (
              <div id="match-results" style={{ marginBottom: '1.5rem' }}>
                <MatchResults
                  results={matchResults}
                  requester={p}
                  onAccept={() => {}}
                  onReject={() => setMatchResults(null)}
                  onRerun={handleMatch}
                />
              </div>
            )}

            {/* Projects */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text)' }}>
                  Projects <span style={{ color: 'var(--text-3)', fontWeight: 300 }}>({p?.projects?.length || 0})</span>
                </h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddProject(true)}>
                  + Add project
                </button>
              </div>

              {p?.projects?.length > 0 ? (
                <div className="grid-2">
                  {p.projects.map(proj => (
                    <ProjectCard key={proj._id} project={proj} editable
                      onUpdate={() => fetchProfile()} />
                  ))}
                </div>
              ) : (
                <div className="card empty">
                  <div className="empty-icon">🗂</div>
                  <p style={{ marginBottom: '1rem' }}>Add your first project to boost your match score</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddProject(true)}>
                    + Add project
                  </button>
                </div>
              )}
            </div>

            {/* Resume parsed data */}
            {p?.resumeParsedData?.extractedSkills?.length > 0 && (
              <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(56,217,192,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  <span style={{ fontSize: 18 }}>📄</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Resume Auto-Parsed</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {new Date(p.resumeParsedData.parsedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: '0.5rem' }}>Skills extracted:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {p.resumeParsedData.extractedSkills.map(s => (
                    <span key={s} className="tag" style={{ fontSize: 11 }}>{s}</span>
                  ))}
                </div>
                {p.resumeParsedData.extractedExperience && (
                  <div style={{ marginTop: '0.75rem', fontSize: 13, color: 'var(--text-2)' }}>
                    {p.resumeParsedData.extractedExperience}
                  </div>
                )}
              </div>
            )}

            {/* Chat assistant */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <ChatAssistant />
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Completeness */}
            <CompletenessBar user={p} />

            {/* Quick stats */}
            <div className="card">
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                PROFILE STATS
              </div>
              {[
                { label: 'Skills', value: p?.skills?.length || 0 },
                { label: 'Projects', value: p?.projects?.length || 0 },
                { label: 'Interests', value: p?.interests?.length || 0 },
                { label: 'Match history', value: p?.teamHistory?.filter(t => t.status === 'accepted').length || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
                  fontSize: 14,
                }}>
                  <span style={{ color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: 14 }}>
                <span style={{ color: 'var(--text-2)' }}>Visibility</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: p?.isPublic ? 'var(--teal)' : 'var(--rose)' }}>
                  {p?.isPublic ? '🟢 Public' : '🔴 Private'}
                </span>
              </div>
            </div>

            {/* Match history */}
            {p?.teamHistory?.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                  RECENT MATCHES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {p.teamHistory.slice(0, 3).map((t, i) => (
                    <div key={i} style={{
                      padding: '0.625rem 0.75rem', borderRadius: 8,
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
                          Team of {(t.members?.length || 0) + 1}
                        </span>
                        <span style={{
                          fontSize: 11, fontFamily: 'var(--font-mono)',
                          color: t.status === 'accepted' ? 'var(--teal)' : t.status === 'rejected' ? 'var(--rose)' : 'var(--amber)',
                        }}>
                          {Math.round((t.score || 0) * 100)}%
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        {t.members?.slice(0, 2).map(m => m.name).join(', ')}
                        {t.members?.length > 2 && ` +${t.members.length - 2}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="card">
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                QUICK ACTIONS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/discover" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                  🔍 Browse developers
                </Link>
                <Link to="/profile/edit" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                  ✎ Edit profile
                </Link>
                {p?.username && (
                  <Link to={`/u/${p.username}`} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                    ⊙ View public profile ↗
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          onAdd={() => { fetchProfile(); setShowAddProject(false); }}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
