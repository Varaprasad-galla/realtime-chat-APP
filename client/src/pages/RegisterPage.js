import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!username || !email || !password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending registration request:', { username, email }); // Debug
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password
      });

      console.log('Registration successful:', response.data); // Debug
      register(response.data.user, response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      toast.success('Registration successful!');
      navigate('/chat');
    } catch (error) {
      console.error('Registration error:', error); // Debug
      console.error('Error response:', error.response); // Debug
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
            />
          </div>
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
              placeholder="Create a password"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
