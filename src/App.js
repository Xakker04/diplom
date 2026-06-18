import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthProvider } from './context/AuthContext';
import { Main, Login, Register, Navbar, Game, Dashboard, TestCreate, QuizGame, Learn, InteractiveCreate, HostLive } from './pages';
import { useAuth } from './context/AuthContext';
import { auth } from './firebase';
import Chatbot from './components/chatbot/Chatbot';

// Login qilinmagan bo'lsa /login ga yo'naltiradi
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Login qilingan bo'lsa /dashboard ga yo'naltiradi
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  // Anonim kirish tayyor bo'lguncha kutamiz (Firestore qoidalari uchun)
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => { if (user) setReady(true); });
    const t = setTimeout(() => setReady(true), 5000);   // zaxira: 5s dan keyin baribir ochiladi
    return () => { unsub(); clearTimeout(t); };
  }, []);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <AuthProvider>
      <Navbar />
      <Chatbot />
      <Routes>
        <Route path="/"         element={<PublicRoute><Main /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/game"           element={<Game />} />
        <Route path="/learn"          element={<Learn />} />
        <Route path="/play/:testId"   element={<QuizGame />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/create/test" element={
          <ProtectedRoute><TestCreate /></ProtectedRoute>
        } />
        <Route path="/create/ppt" element={
          <ProtectedRoute><InteractiveCreate /></ProtectedRoute>
        } />
        <Route path="/host/:testId" element={
          <ProtectedRoute><HostLive /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
