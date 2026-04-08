import React, { useState } from 'react';
import toast from 'react-hot-toast';
import '../styles/PasskeyModal.css';

const PasskeyModal = ({ room, onClose, onJoin }) => {
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passkey.trim()) {
      toast.error('Passkey is required');
      return;
    }

    setLoading(true);
    try {
      await onJoin(room._id, passkey);
    } catch (error) {
      toast.error('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="passkey-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <h2>🔒 Join Private Room</h2>
        <p className="room-name">Room: <strong>{room.name}</strong></p>
        <p className="hint">This room is private. Please enter the passkey to join.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Passkey</label>
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter passkey"
              autoFocus
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-join">
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasskeyModal;
