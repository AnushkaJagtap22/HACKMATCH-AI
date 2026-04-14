import React, { useState, useEffect, useRef } from 'react';
import { teamChatAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function TeamChat({ teamId }) {
  const { user } = useAuth();
  const { connected, socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await teamChatAPI.getHistory(teamId);
      setMessages(res.data.messages || []);
    } catch (err) {
      toast.error('Failed to load team chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchHistory();
      
      if (connected && socket?.current) {
        socket.current.emit('join_team_room', { teamId });

        const handleNewMessage = (msg) => {
          setMessages(prev => {
            if (prev.find(m => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        };

        socket.current.on('team_message', handleNewMessage);

        return () => {
          socket.current?.off('team_message', handleNewMessage);
          socket.current?.emit('leave_team_room', { teamId });
        };
      }
    }
  }, [teamId, connected, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await teamChatAPI.send(teamId, inputText);
      setInputText('');
      setMessages(prev => {
        if (prev.find(m => m._id === res.data.message._id)) return prev;
        return [...prev, res.data.message];
      });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" /></div>;
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '400px', padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '1rem', borderBottom: '1px solid var(--border)',
        background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1.25rem' }}>💬</span>
        <div style={{ fontWeight: 500 }}>Team Chat</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', color: 'var(--text-3)', fontSize: '13px' }}>
            No messages yet. Say hi to your new team!
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === user?._id;
            return (
              <div key={msg._id} style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex', flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}>
                {!isMe && (
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '2px', marginLeft: '2px' }}>
                    {msg.senderName}
                  </div>
                )}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: isMe ? 'var(--teal)' : 'var(--surface2)',
                  color: isMe ? '#fff' : 'var(--text)',
                  borderBottomRightRadius: isMe ? 2 : 12,
                  borderBottomLeftRadius: isMe ? 12 : 2,
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '4px' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Message your team..."
          style={{
            flex: 1, padding: '1rem', border: 'none', background: 'transparent',
            outline: 'none', color: 'var(--text)', fontSize: '14px'
          }}
        />
        <button type="submit" disabled={!inputText.trim()} style={{
          background: 'transparent', border: 'none', padding: '0 1rem', cursor: inputText.trim() ? 'pointer' : 'not-allowed',
          opacity: inputText.trim() ? 1 : 0.5, fontSize: '1.25rem'
        }}>
          🚀
        </button>
      </form>
    </div>
  );
}
