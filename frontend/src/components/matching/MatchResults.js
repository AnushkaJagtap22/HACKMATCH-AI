import React, { useState } from 'react';
import { matchAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ROLE_COLORS = {
  'Frontend Developer': { bg: 'rgba(56,217,192,0.12)', text: 'var(--teal)', border: 'rgba(56,217,192,0.25)' },
  'Backend Developer': { bg: 'rgba(240,165,0,0.12)', text: 'var(--amber)', border: 'rgba(240,165,0,0.25)' },
  'ML/AI Engineer': { bg: 'rgba(240,92,122,0.12)', text: 'var(--rose)', border: 'rgba(240,92,122,0.25)' },
  'Data Engineer': { bg: 'rgba(124,106,247,0.12)', text: '#a897ff', border: 'rgba(124,106,247,0.25)' },
  'DevOps Engineer': { bg: 'rgba(240,165,0,0.1)', text: 'var(--amber)', border: 'rgba(240,165,0,0.2)' },
  'Fullstack Developer': { bg: 'rgba(56,217,192,0.1)', text: 'var(--teal)', border: 'rgba(56,217,192,0.2)' },
};

function ScoreBar({ label, value, color = 'var(--amber)' }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11 }}>
        <span style={{ color: 'var(--text-2)' }}>{label}</span>
        <span style={{ color, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, borderRadius: 3,
          background: color, transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}

function MemberCard({ member, isLeader, isRequester }) {
  const roleStyle = ROLE_COLORS[member.role] || ROLE_COLORS['Fullstack Developer'];
  const initials = member.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '0.875rem',
      position: 'relative',
      borderColor: isLeader ? 'rgba(240,165,0,0.3)' : 'var(--border)',
    }}>
      {isLeader && (
        <div style={{
          position: 'absolute', top: -10, left: 10,
          background: 'var(--amber)', color: '#1a1200',
          fontSize: 10, fontWeight: 700, padding: '1px 8px',
          borderRadius: 20, fontFamily: 'var(--font-mono)',
        }}>
          LEADER
        </div>
      )}
      {isRequester && (
        <div style={{
          position: 'absolute', top: -10, right: 10,
          background: 'var(--teal)', color: '#0a1f1a',
          fontSize: 10, fontWeight: 700, padding: '1px 8px',
          borderRadius: 20, fontFamily: 'var(--font-mono)',
        }}>
          YOU
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.625rem' }}>
        {member.avatar ? (
          <img src={`${API_BASE}${member.avatar}`} alt=""
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ambs), var(--teals))',
            border: '1px solid var(--border2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: 'var(--amber)',
          }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.2 }}>
            {member.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{member.experienceLevel}</div>
        </div>
      </div>
      <div style={{
        display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 6,
        background: roleStyle.bg, color: roleStyle.text,
        border: `1px solid ${roleStyle.border}`,
        fontWeight: 500, marginBottom: '0.5rem',
      }}>
        {member.role}
      </div>
      {member.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {member.skills.slice(0, 4).map(s => (
            <span key={s} style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 4,
              background: 'var(--surface)', color: 'var(--teal)',
              border: '1px solid rgba(56,217,192,0.2)',
              fontFamily: 'var(--font-mono)',
            }}>
              {s}
            </span>
          ))}
          {member.skills.length > 4 && (
            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>+{member.skills.length - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function MatchResults({ results, requester, onAccept, onReject, onRerun }) {
  const [activeTeam, setActiveTeam] = useState(0);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  if (!results?.teams?.length) return null;

  const team = results.teams[activeTeam];

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await matchAPI.accept(team.teamId);
      toast.success('Team accepted! Outreach messages ready.', { duration: 4000 });
      onAccept?.(team);
    } catch {
      toast.error('Failed to accept team');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await matchAPI.reject(team.teamId);
      toast('Match rejected. Run again for new suggestions.', { icon: '🔄' });
      onReject?.(team);
    } catch {
      toast.error('Failed to reject team');
    } finally {
      setRejecting(false);
    }
  };

  const SCORE_COLORS = [
    { color: 'var(--teal)', label: 'Skill Coverage', key: 'complementarity' },
    { color: 'var(--amber)', label: 'Experience Balance', key: 'experienceBalance' },
    { color: '#a897ff', label: 'Diversity', key: 'diversity' },
    { color: 'var(--rose)', label: 'Interest Alignment', key: 'interestAlignment' },
  ];

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.25rem' }}>
            AI-Generated Teams
          </h2>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            Matched from {results.candidatesPoolSize} real users · {new Date(results.generatedAt).toLocaleTimeString()}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onRerun}>
          ↻ Re-run matching
        </button>
      </div>

      {/* Team tabs */}
      {results.teams.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {results.teams.map((t, i) => (
            <button
              key={t.teamId}
              onClick={() => setActiveTeam(i)}
              style={{
                padding: '0.4rem 1rem', borderRadius: 8, fontSize: 13, fontWeight: 500,
                border: '1px solid',
                borderColor: activeTeam === i ? 'var(--amber)' : 'var(--border)',
                background: activeTeam === i ? 'var(--ambs)' : 'transparent',
                color: activeTeam === i ? 'var(--amber)' : 'var(--text-2)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              Option {i + 1} · {t.scorePercent}%
            </button>
          ))}
        </div>
      )}

      {/* Main team card */}
      <div className="card" style={{ borderColor: 'rgba(240,165,0,0.2)' }}>
        {/* Score header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 4 }}>
              TEAM COMPATIBILITY SCORE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '3rem',
                fontWeight: 300, color: 'var(--amber)', lineHeight: 1,
              }}>
                {team.scorePercent}
              </span>
              <span style={{ fontSize: '1.5rem', color: 'var(--text-2)' }}>%</span>
            </div>
          </div>

          {/* Leader badge */}
          {team.leader && (
            <div style={{
              background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)',
              borderRadius: 10, padding: '0.75rem 1rem',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>AI-Selected Leader</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--amber)' }}>
                👑 {team.leader.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                {team.leader.reason}
              </div>
            </div>
          )}
        </div>

        {/* Score breakdown */}
        <div style={{ marginBottom: '1.25rem' }}>
          {SCORE_COLORS.map(({ color, label, key }) => (
            <ScoreBar
              key={key}
              label={label}
              value={team.breakdown?.[key] || 0}
              color={color}
            />
          ))}
        </div>

        {/* Explanation */}
        <div style={{
          background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.15)',
          borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'var(--font-mono)', marginBottom: '0.375rem', letterSpacing: '0.05em' }}>
            WHY THIS TEAM WORKS
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {team.explanation}
          </div>
        </div>

        {/* Team members */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            TEAM MEMBERS ({(team.members?.length || 0) + 1} people)
          </div>

          {/* Requester */}
          {requester && (
            <div style={{ marginBottom: '0.625rem' }}>
              <MemberCard
                member={{
                  name: requester.fullName,
                  role: team.requesterRole || 'Team Member',
                  experienceLevel: requester.experienceLevel,
                  skills: requester.skills,
                  avatar: requester.avatar,
                  username: requester.username,
                }}
                isLeader={team.leader?.userId?.toString() === requester._id?.toString()}
                isRequester={true}
              />
            </div>
          )}

          <div className="grid-2">
            {team.members?.map(member => (
              <MemberCard
                key={member.userId}
                member={member}
                isLeader={team.leader?.userId?.toString() === member.userId?.toString()}
                isRequester={false}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? 'Accepting...' : '✓ Accept this team'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleReject}
            disabled={rejecting}
          >
            {rejecting ? '...' : 'Try another →'}
          </button>
        </div>
      </div>
    </div>
  );
}
