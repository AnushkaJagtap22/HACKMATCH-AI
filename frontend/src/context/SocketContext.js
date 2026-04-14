import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect?.();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('hm_token');
    if (!token) return;

    // Dynamic import to avoid SSR issues
    import('socket.io-client').then(({ io }) => {
      const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
        .replace('/api', '');

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socket.on('connect', () => {
        setConnected(true);
        console.log('🔌 Real-time connected');
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket connect error:', err.message);
        setConnected(false);
      });

      // ── Real-time events ──
      socket.on('team_matched', (data) => {
        toast.success(data.message || 'Team match found!', { duration: 6000, icon: '🤖' });
        // Dispatch custom event so Dashboard can refresh
        window.dispatchEvent(new CustomEvent('hm:team_matched', { detail: data }));
      });

      socket.on('team_updated', (data) => {
        toast(data.message || 'Your team was updated', { icon: '🔄' });
        window.dispatchEvent(new CustomEvent('hm:team_updated', { detail: data }));
      });

      socket.on('notification', (data) => {
        toast(data.title ? `${data.title}: ${data.message}` : data.message || 'New notification received!', { icon: '🔔' });
        window.dispatchEvent(new CustomEvent('hm:notification', { detail: data }));
      });

      socket.on('online_count', ({ count }) => {
        setOnlineCount(count);
      });

      socket.on('pong', () => {});

      socketRef.current = socket;
    }).catch(err => {
      console.warn('Socket.io not available:', err.message);
    });

    return () => {
      socketRef.current?.disconnect?.();
      socketRef.current = null;
    };
  }, [user]);

  const emit = (event, data) => socketRef.current?.emit(event, data);

  return (
    <SocketContext.Provider value={{ connected, onlineCount, emit, socket: socketRef }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
