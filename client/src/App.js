import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { token } = useContext(AuthContext);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatProvider token={token}>
              <ChatPage />
            </ChatProvider>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={token ? '/chat' : '/login'} />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
