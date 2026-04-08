import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/DirectChatModal.css';

const DirectChatModal = ({ onClose, onCreate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/chat/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId) => {
    try {
      const response = await apiClient.get(`/chat/direct/${userId}`);
      onCreate(response.data);
      toast.success('Direct chat opened!');
      onClose();
    } catch (error) {
      toast.error('Failed to open direct chat');
      console.error(error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="direct-chat-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>💬 Start Direct Chat</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="no-users">
            {searchTerm ? 'No users found' : 'No users available'}
          </div>
        ) : (
          <div className="users-list">
            {filteredUsers.map(user => (
              <div
                key={user._id}
                className="user-item"
                onClick={() => handleSelectUser(user._id)}
              >
                <img src={user.avatar} alt={user.username} className="user-avatar" />
                <div className="user-info">
                  <p className="user-name">{user.username}</p>
                  <span className={`user-status ${user.status}`}>
                    {user.status === 'online' ? '🟢' : 
                     user.status === 'away' ? '🟡' : '⚫'} {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectChatModal;
