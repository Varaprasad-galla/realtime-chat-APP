import React, { useState } from 'react';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/UserSearch.css';

const UserSearch = ({ onUserSelected, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.get(`/user/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Failed to search users');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      const response = await apiClient.get(`/chat/direct/${user._id}`);
      onUserSelected(response.data);
      onClose();
    } catch (error) {
      toast.error('Failed to start chat');
      console.error(error);
    }
  };

  return (
    <div className="user-search-modal">
      <div className="user-search-content">
        <div className="user-search-header">
          <h3>Start a Conversation</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={handleSearch} className="user-search-form">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="search-results">
          {isSearching && <p className="loading">Searching...</p>}
          
          {!isSearching && searchResults.length === 0 && searchQuery && (
            <p className="no-results">No users found</p>
          )}
          
          {!isSearching && searchResults.length > 0 && (
            <>
              <p className="results-count">Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}</p>
              <div className="users-list">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className={`user-item ${selectedUser?._id === user._id ? 'loading' : ''}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <img 
                      src={user.avatar || 'https://via.placeholder.com/40'} 
                      alt={user.username}
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <p className="user-name">{user.username}</p>
                      <p className="user-email">{user.email}</p>
                      <span className={`user-status ${user.status || 'offline'}`}>
                        {user.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                      </span>
                    </div>
                    {selectedUser?._id === user._id && <span className="loading-spinner">⏳</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
