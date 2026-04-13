import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './index.css';

import Landing       from './pages/Landing';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import EditProfile   from './pages/EditProfile';
import Discover      from './pages/Discover';
import PublicProfile from './pages/PublicProfile';
import NotFound      from './pages/NotFound';
import Navbar        from './components/ui/Navbar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppShell = () => {
  const { user } = useAuth();
  return (
    <SocketProvider>
      {user && <Navbar />}
      <ErrorBoundary>
        <Routes>
          <Route path="/"            element={<GuestRoute><Landing /></GuestRoute>} />
          <Route path="/login"       element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register"    element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/u/:username" element={<PublicProfile />} />
          <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/discover"     element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </SocketProvider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#242840', color: '#e8eaf5',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '14px', borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#38d9c0', secondary: '#1c1f33' } },
            error: { iconTheme: { primary: '#f05c7a', secondary: '#1c1f33' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
