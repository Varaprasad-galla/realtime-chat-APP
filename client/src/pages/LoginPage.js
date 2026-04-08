import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      console.log('Login request:', { email }); // Debug
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      console.log('Login successful:', response.data); // Debug
      login(response.data.user, response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      toast.success('Login successful!');
      navigate('/chat');
    } catch (error) {
      console.error('Login error:', error.response); // Debug
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
