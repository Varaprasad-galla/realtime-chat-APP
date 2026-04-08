import React, { useState } from 'react';
import toast from 'react-hot-toast';
import '../styles/RoomCreator.css';

const RoomCreator = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [passkey, setPasskey] = useState('');
  const [generatedPasskey, setGeneratedPasskey] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePasskey = () => {
    const key = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedPasskey(key);
    setPasskey(key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Room name is required');
      return;
    }

    if (roomType === 'private-group' && !passkey.trim()) {
      toast.error('Passkey is required for private rooms');
      return;
    }

    setLoading(true);
    try {
      onCreate({ 
        name, 
        description,
        roomType,
        passkey: roomType === 'private-group' ? passkey : null
      });
    } catch (error) {
      toast.error('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-creator-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <h2>Create New Room</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Type</label>
            <select 
              value={roomType} 
              onChange={(e) => {
                setRoomType(e.target.value);
                if (e.target.value === 'public') {
                  setPasskey('');
                  setGeneratedPasskey('');
                }
              }}
              required
            >
              <option value="public">Public Room (Anyone can find and join)</option>
              <option value="private-group">Private Room with Passkey</option>
            </select>
          </div>

          <div className="form-group">
            <label>Room Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter room description (optional)"
              rows="3"
            />
          </div>

          {roomType === 'private-group' && (
            <div className="form-group">
              <label>Passkey (share with members to join)</label>
              <div className="passkey-input-group">
                <input
                  type="text"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter or generate passkey"
                  required
                />
                <button 
                  type="button" 
                  onClick={generatePasskey}
                  className="btn-generate-passkey"
                  title="Generate random passkey"
                >
                  🔐 Generate
                </button>
              </div>
              {generatedPasskey && (
                <p className="passkey-info">Generated: <strong>{generatedPasskey}</strong></p>
              )}
            </div>
          )}

          <div className="form-info">
            <p>
              {roomType === 'public' 
                ? '📢 This will create a public room that anyone can find and join'
                : '🔒 This will create a private room. Share the passkey with people you want to add'}
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-create">
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomCreator;
