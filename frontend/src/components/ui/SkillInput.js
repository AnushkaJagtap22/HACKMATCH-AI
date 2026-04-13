import React, { useState, useRef } from 'react';

const SUGGESTED = [
  'JavaScript','TypeScript','Python','React','Next.js','Node.js','Express',
  'FastAPI','Django','Go','Rust','Java','C++','PostgreSQL','MongoDB','Redis',
  'Docker','Kubernetes','AWS','GCP','Azure','GraphQL','REST API','TensorFlow',
  'PyTorch','LangChain','React Native','Flutter','Swift','Kotlin','Figma',
  'Tailwind CSS','Solidity','Web3','Spark','dbt','Kafka',
];

export default function SkillInput({ skills = [], onChange, maxSkills = 20 }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed) || skills.length >= maxSkills) return;
    onChange([...skills, trimmed]);
    setInput('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeSkill = (skill) => onChange(skills.filter(s => s !== skill));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === 'Backspace' && !input && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.length > 0) {
      setSuggestions(
        SUGGESTED.filter(s =>
          s.toLowerCase().includes(val.toLowerCase()) && !skills.includes(s)
        ).slice(0, 6)
      );
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div>
      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem',
        display: 'flex', flexWrap: 'wrap', gap: '0.375rem', minHeight: 44,
        cursor: 'text', transition: 'border-color 0.18s',
      }}
        onClick={() => inputRef.current?.focus()}
        onFocus={() => {}}
        style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem',
          display: 'flex', flexWrap: 'wrap', gap: '0.375rem', minHeight: 44,
          cursor: 'text',
        }}
      >
        {skills.map(skill => (
          <span key={skill} className="tag" style={{ gap: '0.375rem', paddingRight: '0.375rem' }}>
            {skill}
            <button type="button"
              onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--teal)', fontSize: 14, lineHeight: 1, padding: 0,
                display: 'flex', alignItems: 'center',
              }}>✕</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : ''}
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-body)',
            minWidth: 120, flex: 1,
          }}
          disabled={skills.length >= maxSkills}
        />
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '0.375rem',
          marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '0.375rem',
          boxShadow: 'var(--shadow)',
        }}>
          {suggestions.map(s => (
            <button key={s} type="button"
              onMouseDown={() => addSkill(s)}
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
                fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-mono)',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = 'var(--teal)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: '0.375rem', fontSize: 12, color: 'var(--text-3)' }}>
        {skills.length}/{maxSkills} skills · Press Enter or comma to add
      </div>
    </div>
  );
}
