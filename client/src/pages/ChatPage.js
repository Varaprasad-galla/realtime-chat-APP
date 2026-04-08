import React, { useContext, useState, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import RoomList from '../components/RoomList';
import RoomCreator from '../components/RoomCreator';
import UserSearch from '../components/UserSearch';
import UserProfile from '../components/UserProfile';
import PasskeyModal from '../components/PasskeyModal';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const { currentRoom, setCurrentRoom, joinRoom, leaveRoom, rooms, setRooms } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [showRoomCreator, setShowRoomCreator] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [showAvailableRooms, setShowAvailableRooms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [roomToJoin, setRoomToJoin] = useState(null);

  useEffect(() => {
    fetchRooms();
    fetchAvailableRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await apiClient.get('/chat/my-rooms');
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const response = await apiClient.get('/chat/rooms');
      const available = response.data.filter(room => !rooms.some(r => r._id === room._id));
      setAvailableRooms(available);
    } catch (error) {
      console.error('Failed to load available rooms', error);
    }
  };

  const handleSearchRooms = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await apiClient.get(`/chat/rooms/search/public?query=${searchQuery}`);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      toast.error('Failed to search rooms');
      console.error(error);
    }
  };

  const handleSelectRoom = (roomId) => {
    joinRoom(roomId);
  };

  const handleJoinRoom = async (room) => {
    // If private room, show passkey modal
    if (room.roomType === 'private-group') {
      setRoomToJoin(room);
      setShowPasskeyModal(true);
      return;
    }

    // For public rooms, join directly
    try {
      await apiClient.post(`/chat/rooms/${room._id}/join`);
      toast.success('Joined room!');
      fetchRooms();
      fetchAvailableRooms();
      handleSelectRoom(room._id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join room');
    }
  };

  const handlePasskeySubmit = async (roomId, passkey) => {
    try {
      await apiClient.post(`/chat/rooms/${roomId}/join`, { passkey });
      toast.success('Joined room!');
      setShowPasskeyModal(false);
      setRoomToJoin(null);
      fetchRooms();
      fetchAvailableRooms();
      handleSelectRoom(roomId);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid passkey');
    }
  };

  const handleGoBack = () => {
    setCurrentRoom(null);
  };

  const handleLeaveRoom = async () => {
    try {
      await apiClient.post(`/chat/rooms/${currentRoom}/leave`);
      leaveRoom(currentRoom);
      fetchRooms();
      fetchAvailableRooms();
      toast.success('Left the conversation');
    } catch (error) {
      toast.error('Failed to leave conversation');
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Delete this room? This cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/chat/rooms/${currentRoom}`);
      toast.success('Room deleted');
      leaveRoom(currentRoom);
      fetchRooms();
      fetchAvailableRooms();
      setCurrentRoom(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete room');
    }
  };

  const handleCreateRoom = async (roomData) => {
    try {
      const response = await apiClient.post('/chat/rooms', roomData);
      setRooms([...rooms, response.data]);
      setShowRoomCreator(false);
      toast.success('Room created!');
      handleSelectRoom(response.data._id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create room');
    }
  };

  const handleUserSelected = (room) => {
    setRooms([...rooms, room]);
    handleSelectRoom(room._id);
  };

  // Separate public rooms and direct messages
  const publicRooms = rooms.filter(r => r.roomType === 'public');
  const directMessages = rooms.filter(r => r.roomType === 'private-one-to-one');

  const currentRoomData = rooms.find(r => r._id === currentRoom);

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-header-left">
            <h2>Chats</h2>
            <div className="logged-in-user">
              <span className="user-indicator">👤</span>
              <span className="username">{user?.username || 'User'}</span>
            </div>
          </div>
          <div className="sidebar-actions">
            <button onClick={() => setShowRoomCreator(true)} className="btn-create-room" title="Create new room">➕</button>
            <button onClick={() => setShowUserSearch(true)} className="btn-direct-chat" title="New message">✉️</button>
            <button onClick={() => setShowUserProfile(true)} className="btn-user-profile" title="User profile">
              <img src={user?.avatar} alt="Profile" className="profile-avatar-button" />
            </button>
          </div>
        </div>

        {showRoomCreator && (
          <RoomCreator
            onClose={() => setShowRoomCreator(false)}
            onCreate={handleCreateRoom}
          />
        )}

        {showUserSearch && (
          <UserSearch
            onUserSelected={handleUserSelected}
            onClose={() => setShowUserSearch(false)}
          />
        )}

        {showUserProfile && (
          <UserProfile
            onClose={() => setShowUserProfile(false)}
          />
        )}

        {showPasskeyModal && roomToJoin && (
          <PasskeyModal
            room={roomToJoin}
            onClose={() => setShowPasskeyModal(false)}
            onJoin={handlePasskeySubmit}
          />
        )}

        {showSearchResults ? (
          <div className="search-results-section">
            <form onSubmit={handleSearchRooms} className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search public rooms..."
                autoFocus
              />
              <button type="submit">🔍</button>
            </form>
            {searchResults.length === 0 ? (
              <p className="no-rooms">No rooms found</p>
            ) : (
              <div className="search-results-list">
                {searchResults.map((room) => (
                  <div key={room._id} className="search-result-item">
                    <div className="room-info">
                      <div className="room-title-row">
                        <h4>{room.name}</h4>
                        <span className="room-type-icon">
                          {room.roomType === 'public' ? '🌐' : '🔒'}
                        </span>
                      </div>
                      <p className="room-description">{room.description}</p>
                      <p className="room-members">{room.members.length} members</p>
                    </div>
                    <button 
                      onClick={() => handleJoinRoom(room)} 
                      className="btn-join"
                      disabled={room.isMember}
                      title={room.isMember ? 'Already a member' : 'Click to join'}
                    >
                      {room.isMember ? '✓ Joined' : 'Join'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowSearchResults(false)} className="btn-back">← Back</button>
          </div>
        ) : showAvailableRooms ? (
          <div className="available-rooms-section">
            <h3>Available Rooms</h3>
            {availableRooms.length === 0 ? (
              <p className="no-rooms">No available rooms. Create one!</p>
            ) : (
              <div className="available-rooms-list">
                {availableRooms.map((room) => (
                  <div key={room._id} className="available-room-item">
                    <div className="room-info">
                      <div className="room-title-row">
                        <h4>{room.name}</h4>
                        <span className="room-type-icon">
                          {room.roomType === 'public' ? '🌐' : '🔒'}
                        </span>
                      </div>
                      <p className="room-members">{room.members.length} members</p>
                    </div>
                    <button onClick={() => handleJoinRoom(room)} className="btn-join">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="search-available">
              <form onSubmit={handleSearchRooms}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rooms..."
                />
                <button type="submit">Search</button>
              </form>
            </div>
            <button onClick={() => setShowAvailableRooms(false)} className="btn-back">← Back</button>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="loading">Loading conversations...</div>
            ) : (
              <>
                {/* Direct Messages Section */}
                {directMessages.length > 0 && (
                  <div className="room-section">
                    <h3 className="section-title">Direct Messages</h3>
                    <RoomList 
                      rooms={directMessages} 
                      onSelectRoom={handleSelectRoom} 
                      selectedRoom={currentRoom} 
                    />
                  </div>
                )}

                {/* Public Rooms Section */}
                {publicRooms.length > 0 && (
                  <div className="room-section">
                    <div className="section-header">
                      <h3 className="section-title">Public Rooms</h3>
                      <button 
                        onClick={() => setShowAvailableRooms(true)}
                        className="btn-section-action"
                        title="Browse more rooms"
                      >
                        +
                      </button>
                    </div>
                    <RoomList 
                      rooms={publicRooms} 
                      onSelectRoom={handleSelectRoom} 
                      selectedRoom={currentRoom} 
                    />
                  </div>
                )}

                {/* Empty State */}
                {publicRooms.length === 0 && directMessages.length === 0 && (
                  <div className="empty-state">
                    <p>No conversations yet</p>
                    <div className="empty-actions">
                      <button 
                        onClick={() => setShowUserSearch(true)} 
                        className="action-link"
                      >
                        💬 Start a Direct Message
                      </button>
                      <button 
                        onClick={() => setShowAvailableRooms(true)} 
                        className="action-link"
                      >
                        🌐 Join a Public Room
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="chat-main">
        {currentRoom ? (
          <>
            <div className="chat-header">
              <button onClick={handleGoBack} className="btn-back-chat" title="Back to conversations">
                ← Back
              </button>
              <div className="header-title">
                <h2>{currentRoomData?.name || 'Loading...'}</h2>
                {currentRoomData && (
                  <span className="room-type-indicator" title={`Room type: ${currentRoomData.roomType}`}>
                    {currentRoomData.roomType === 'public' && '🌐 Public Room'}
                    {currentRoomData.roomType === 'private-one-to-one' && '💬 Direct Message'}
                  </span>
                )}
              </div>
              <div className="header-actions">
                {currentRoomData?.roomType === 'public' && currentRoomData?.admin === user?.id && (
                  <button onClick={handleDeleteRoom} className="btn-delete-room" title="Delete this room">
                    🗑️ Delete
                  </button>
                )}
                <button onClick={handleLeaveRoom} className="btn-leave" title="Leave this conversation">Leave</button>
              </div>
            </div>
            <ChatWindow />
          </>
        ) : (
          <div className="no-room">
            <div className="empty-chat-content">
              <h2>💬 Welcome {user?.username}!</h2>
              <p>Select a conversation or start a new one</p>
              
              <div className="quick-actions">
                <button 
                  onClick={() => setShowUserSearch(true)} 
                  className="action-btn direct-btn"
                >
                  ✉️ New Direct Message
                </button>
                <button 
                  onClick={() => setShowAvailableRooms(true)} 
                  className="action-btn browse-btn"
                >
                  🌐 Join Public Room
                </button>
              </div>

              {publicRooms.length + directMessages.length === 0 && (
                <button 
                  onClick={() => setShowAvailableRooms(true)} 
                  className="action-btn create-btn"
                >
                  🔍 Browse All Rooms
                </button>
              )}

              {publicRooms.length + directMessages.length > 0 && (
                <div className="rooms-preview">
                  <h4>Your Conversations ({publicRooms.length + directMessages.length})</h4>
                  <div className="rooms-grid">
                    {[...directMessages, ...publicRooms].map(room => (
                      <div 
                        key={room._id}
                        className="room-preview-card"
                        onClick={() => handleSelectRoom(room._id)}
                      >
                        <div className="room-preview-icon">
                          {room.roomType === 'public' && '🌐'}
                          {room.roomType === 'private-one-to-one' && '💬'}
                        </div>
                        <h5>{room.name}</h5>
                        {room.roomType === 'public' && (
                          <p className="room-preview-members">{room.members.length} members</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
