import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/UserProfile.css';

const UserProfile = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="user-profile-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <button className="btn-modal-close" onClick={onClose}>✕</button>
        
        <div className="profile-header">
          <img src={user?.avatar} alt="Avatar" className="profile-avatar" />
        </div>

        <div className="profile-info">
          <h2>{user?.username}</h2>
          <p className="profile-email">{user?.email}</p>
          <p className="profile-bio">{user?.bio || 'Hey there! I am using Chat App'}</p>
        </div>

        <div className="profile-stats">
          <div className="stat">
            <span className="stat-label">Status</span>
            <span className={`stat-value status-${user?.status}`}>
              {user?.status === 'online' && '🟢'}
              {user?.status === 'away' && '🟡'}
              {user?.status === 'offline' && '⚫'}
              {' '}{user?.status || 'offline'}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="btn-logout">
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
