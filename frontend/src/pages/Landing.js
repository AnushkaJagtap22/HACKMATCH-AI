import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '⚡', title: 'Smart Matching', desc: 'AI analyzes your skills, experience, and working style to find compatible teammates.' },
  { icon: '🗂', title: 'Portfolio Showcase', desc: 'Display projects, tech stacks, and achievements in one professional profile.' },
  { icon: '🔍', title: 'Discover Talent', desc: 'Browse developers by skill, level, or availability. Find the perfect co-founder.' },
  { icon: '🔐', title: 'Secure & Private', desc: 'JWT auth, password hashing, and visibility controls keep your data safe.' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', overflowX: 'hidden' }}>
      {/* ── Minimal nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 2rem', position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(13,15,26,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.1rem' }}>
          Hack<span style={{ color: 'var(--amber)' }}>Match</span>
          <span style={{ color: 'var(--teal)', marginLeft: 4 }}>AI</span>
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '85vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '4rem 1.5rem',
        background: `
          radial-gradient(ellipse 60% 50% at 50% 0%, rgba(240,165,0,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(56,217,192,0.06) 0%, transparent 60%)
        `,
      }}>
        <div style={{ maxWidth: 780 }} className="animate-fade">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--amber-s)', border: '1px solid rgba(240,165,0,0.25)',
            borderRadius: 20, padding: '0.3rem 1rem', marginBottom: '2rem',
            fontSize: 13, color: 'var(--amber)',
          }}>
            <span>✦</span>
            AI-powered hackathon team formation
          </div>

          <h1 style={{ marginBottom: '1.5rem', color: 'var(--text)', lineHeight: 1.1 }}>
            Find your perfect<br />
            <span style={{ color: 'var(--amber)', fontStyle: 'italic' }}>hackathon team</span>
          </h1>

          <p style={{ fontSize: '1.15rem', maxWidth: 540, margin: '0 auto 2.5rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
            Build your developer portfolio, showcase your skills,
            and let AI match you with the right teammates for your next build sprint.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create your profile →
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Sign in
            </Link>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', gap: '3rem', justifyContent: 'center',
            marginTop: '4rem', flexWrap: 'wrap',
          }}>
            {[['500+', 'Developers'], ['120+', 'Hackathons'], ['94%', 'Match rate']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--amber)' }}>{n}</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.75rem', color: 'var(--text)' }}>
          Everything you need to get matched
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-2)', marginBottom: '3rem' }}>
          From portfolio to team in minutes.
        </p>
        <div className="grid-2">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <div key={title} className="card animate-fade" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--surface2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 20, marginBottom: '1rem',
              }}>{icon}</div>
              <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem', fontSize: '1.05rem' }}>{title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '5rem 1.5rem', textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, var(--ink-soft) 50%, transparent)',
      }}>
        <h2 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Ready to find your team?</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem' }}>Free forever. No credit card required.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Start building →</Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '1.5rem',
        textAlign: 'center', color: 'var(--text-3)', fontSize: 13,
      }}>
        © {new Date().getFullYear()} HackMatch AI. Built for hackers.
      </footer>
    </div>
  );
}
