import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../../utils/api';

const QUICK_PROMPTS = [
  'What role should I take?',
  'How to improve my profile?',
  'What skills should I learn next?',
  'How does team matching work?',
];

export default function ChatAssistant({ defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm your HackMatch AI assistant. I can help you improve your profile, suggest skills, or explain team matching. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatAPI.send(msg);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
        source: res.data.source,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again in a moment.",
        timestamp: new Date(),
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  const timeLabel = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1rem', borderRadius: 10,
          background: open ? 'var(--amber)' : 'var(--surface2)',
          color: open ? '#1a1200' : 'var(--text)',
          border: '1px solid',
          borderColor: open ? 'var(--amber)' : 'var(--border2)',
          cursor: 'pointer', fontSize: 13, fontWeight: 500,
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 16 }}>🤖</span>
        AI Assistant
        {!open && (
          <span style={{
            fontSize: 10, fontFamily: 'var(--font-mono)',
            color: 'var(--teal)', background: 'var(--teal-s)',
            border: '1px solid rgba(56,217,192,0.25)',
            borderRadius: 20, padding: '1px 6px', marginLeft: 4,
          }}>
            LIVE
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', right: 0,
          width: 360, background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 14,
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'scaleIn 0.2s ease',
          zIndex: 200,
          maxHeight: 480,
        }}>
          {/* Header */}
          <div style={{
            padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '0.625rem',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--ambs), var(--teals))',
              border: '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>🤖</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>HackMatch Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 11, color: 'var(--teal)' }}>Online</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1,
              }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '0.875rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            minHeight: 200, maxHeight: 300,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: '0.5rem', alignItems: 'flex-end',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--ambs)', border: '1px solid var(--border2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12,
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  background: msg.role === 'user' ? 'var(--amber)' : 'var(--surface2)',
                  color: msg.role === 'user' ? '#1a1200' : 'var(--text)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  fontSize: 13, lineHeight: 1.6,
                  border: '1px solid',
                  borderColor: msg.role === 'user' ? 'transparent' : 'var(--border)',
                }}
                  dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--ambs)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🤖</div>
                <div style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '12px 12px 12px 4px', padding: '0.625rem 0.875rem',
                  display: 'flex', gap: 4,
                }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)',
                      animation: `bounce 1.2s ${d}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 0.875rem 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 20,
                    background: 'var(--surface2)', color: 'var(--text-2)',
                    border: '1px solid var(--border)', cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '0.625rem 0.875rem', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              style={{
                flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)',
                fontFamily: 'var(--font-body)', fontSize: 13, resize: 'none',
                outline: 'none', maxHeight: 80, lineHeight: 1.5,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--amber)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                padding: '0.5rem 0.875rem', borderRadius: 8, border: 'none',
                background: input.trim() && !loading ? 'var(--amber)' : 'var(--surface2)',
                color: input.trim() && !loading ? '#1a1200' : 'var(--text-3)',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                fontFamily: 'var(--font-body)',
              }}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
