import React, { useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExcelUpload from './pages/ExcelUpload';
import Contacts from './pages/Contacts';
import Invoices from './pages/Invoices';
import Automations from './pages/Automations';
import WhatsApp from './pages/WhatsApp';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function AuthCallback() {
  const { handleGoogleCallback, setUser } = useAuth();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const sessionIdMatch = hash.match(/session_id=([^&]+)/);
    
    if (sessionIdMatch) {
      const sessionId = sessionIdMatch[1];
      handleGoogleCallback(sessionId)
        .then((userData) => {
          // Clear the hash
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/dashboard', { state: { user: userData }, replace: true });
        })
        .catch((error) => {
          console.error('Google auth error:', error);
          navigate('/login', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [handleGoogleCallback, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Signing you in...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If user data was passed from AuthCallback, use it
  if (location.state?.user) {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id (Google OAuth callback)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/excel" element={
        <ProtectedRoute>
          <Layout>
            <ExcelUpload />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/contacts" element={
        <ProtectedRoute>
          <Layout>
            <Contacts />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/invoices" element={
        <ProtectedRoute>
          <Layout>
            <Invoices />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/automations" element={
        <ProtectedRoute>
          <Layout>
            <Automations />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/whatsapp" element={
        <ProtectedRoute>
          <Layout>
            <WhatsApp />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
