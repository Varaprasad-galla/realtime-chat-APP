import React from 'react';
import '../styles/RoomList.css';

const RoomList = ({ rooms, onSelectRoom, selectedRoom }) => {
  const getRoomIcon = (roomType) => {
    switch(roomType) {
      case 'public':
        return '🌐';
      case 'private-group':
        return '🔒';
      case 'private-one-to-one':
        return '💬';
      default:
        return '💬';
    }
  };

  if (rooms.length === 0) {
    return (
      <div className="room-list">
        <p className="no-rooms">📭 No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="room-list">
      <div className="rooms-count-badge">{rooms.length} conversation{rooms.length !== 1 ? 's' : ''}</div>
      {rooms.map((room) => (
        <div
          key={room._id}
          className={`room-item ${selectedRoom === room._id ? 'active' : ''}`}
          onClick={() => onSelectRoom(room._id)}
          title={room.description || room.name}
        >
          <div className="room-icon">{getRoomIcon(room.roomType)}</div>
          <div className="room-info">
            <div className="room-header">
              <h4>{room.name}</h4>
              {room.roomType === 'private-group' && <span className="private-badge">🔐 Private</span>}
            </div>
            {(room.roomType === 'public' || room.roomType === 'private-group') && (
              <p className="room-members">👤 {room.members.length} member{room.members.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
