import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../utils/api';
import UserCard from '../components/dashboard/UserCard';

const LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced'];
const POPULAR_SKILLS = ['React','Python','Node.js','TypeScript','AWS','Docker','ML/AI','Go','Rust','Flutter'];

export default function Discover() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ skills: [], level: '', lookingForTeam: false, search: '', page: 1 });
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async (params) => {
    setLoading(true);
    try {
      const query = {
        page: params.page || 1,
        limit: 12,
        ...(params.level && { level: params.level }),
        ...(params.lookingForTeam && { lookingForTeam: 'true' }),
        ...(params.skills?.length && { skills: params.skills.join(',') }),
        ...(params.search && { search: params.search }),
      };
      const res = await usersAPI.discover(query);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(filters); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, search, page: 1 }));
  };

  const toggleSkill = (skill) => {
    setFilters(f => ({
      ...f,
      page: 1,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }));
  };

  const setLevel = (level) => setFilters(f => ({ ...f, level, page: 1 }));
  const toggleTeam = () => setFilters(f => ({ ...f, lookingForTeam: !f.lookingForTeam, page: 1 }));
  const clearAll = () => { setFilters({ skills: [], level: '', lookingForTeam: false, search: '', page: 1 }); setSearch(''); };
  const hasFilters = filters.skills.length || filters.level || filters.lookingForTeam || filters.search;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, var(--ink-soft) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem 0 1.5rem',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text)', marginBottom: '0.375rem' }}>Discover developers</h1>
          <p>Find your next hackathon teammate by skill, experience, or availability.</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Filters sidebar ── */}
          <div style={{ position: 'sticky', top: 76 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.05em' }}>
                FILTERS
              </div>
              {hasFilters && (
                <button onClick={clearAll} style={{ fontSize: 12, color: 'var(--amber)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Clear all
                </button>
              )}
            </div>

            {/* Team toggle */}
            <div className="card" style={{ marginBottom: '0.875rem', padding: '0.875rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: 14, color: 'var(--text-2)' }}>Open to team</span>
                <div style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: filters.lookingForTeam ? 'var(--teal)' : 'var(--surface2)',
                  border: '1px solid var(--border2)',
                  position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                }} onClick={toggleTeam}>
                  <div style={{
                    position: 'absolute', top: 2, left: filters.lookingForTeam ? 18 : 2,
                    width: 14, height: 14, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                  }} />
                </div>
              </label>
            </div>

            {/* Level filter */}
            <div className="card" style={{ marginBottom: '0.875rem', padding: '0.875rem' }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                EXPERIENCE
              </div>
              {LEVELS.filter(Boolean).map(level => (
                <button key={level} onClick={() => setLevel(filters.level === level ? '' : level)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '0.4rem 0.5rem', borderRadius: 6, marginBottom: 2,
                    background: filters.level === level ? 'var(--surface2)' : 'transparent',
                    border: 'none', cursor: 'pointer', fontSize: 13,
                    color: filters.level === level ? 'var(--text)' : 'var(--text-2)',
                    transition: 'all 0.12s',
                  }}>
                  {level}
                  {filters.level === level && <span style={{ color: 'var(--amber)', fontSize: 16 }}>✓</span>}
                </button>
              ))}
            </div>

            {/* Skill filter */}
            <div className="card" style={{ padding: '0.875rem' }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                SKILLS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {POPULAR_SKILLS.map(skill => {
                  const active = filters.skills.includes(skill);
                  return (
                    <button key={skill} onClick={() => toggleSkill(skill)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.35rem 0.5rem', borderRadius: 6, border: 'none',
                        background: active ? 'var(--teal-s)' : 'transparent',
                        cursor: 'pointer', fontSize: 13,
                        color: active ? 'var(--teal)' : 'var(--text-2)',
                        transition: 'all 0.12s', textAlign: 'left', width: '100%',
                      }}>
                      <span style={{
                        width: 12, height: 12, borderRadius: 3, border: '1px solid',
                        borderColor: active ? 'var(--teal)' : 'var(--border2)',
                        background: active ? 'var(--teal)' : 'transparent',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: active ? '#fff' : 'transparent',
                      }}>✓</span>
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Results ── */}
          <div>
            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.625rem' }}>
              <input
                className="form-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, bio, or username..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {/* Active filter chips */}
            {hasFilters && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                {filters.level && (
                  <span className="tag tag-amber">{filters.level} ✕</span>
                )}
                {filters.lookingForTeam && (
                  <span className="tag">Open to team ✕</span>
                )}
                {filters.skills.map(s => (
                  <span key={s} className="tag" onClick={() => toggleSkill(s)} style={{ cursor: 'pointer' }}>
                    {s} ✕
                  </span>
                ))}
              </div>
            )}

            {/* Count */}
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: '1rem' }}>
              {loading ? 'Searching...' : `${pagination?.total || 0} developers found`}
            </div>

            {/* Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1rem' }}>
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="card" style={{ height: 200 }}>
                    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: '0.75rem' }} />
                    <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: '0.75rem' }} />
                    <div className="skeleton" style={{ height: 48, marginBottom: '0.75rem' }} />
                  </div>
                ))}
              </div>
            ) : users.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1rem' }}>
                  {users.map((u, i) => (
                    <div key={u._id} className="animate-fade" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                      <UserCard user={u} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination?.pages > 1 && (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
                    <button className="btn btn-ghost btn-sm"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                      ← Prev
                    </button>
                    <span style={{ padding: '0.4rem 1rem', fontSize: 13, color: 'var(--text-2)' }}>
                      {filters.page} / {pagination.pages}
                    </span>
                    <button className="btn btn-ghost btn-sm"
                      disabled={filters.page >= pagination.pages}
                      onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty card" style={{ padding: '3.5rem' }}>
                <div className="empty-icon">🔍</div>
                <p style={{ marginBottom: '1rem' }}>No developers match your filters</p>
                <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .discover-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
