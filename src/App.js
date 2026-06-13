import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Main, Login, Register, Navbar, Game, Dashboard, TestCreate, QuizGame } from './pages';
import { useAuth } from './context/AuthContext';
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
  return (
    <AuthProvider>
      <Navbar />
      <Chatbot />
      <Routes>
        <Route path="/"         element={<PublicRoute><Main /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/game"           element={<Game />} />
        <Route path="/play/:testId"   element={<QuizGame />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/create/test" element={
          <ProtectedRoute><TestCreate /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
