import React, { createContext, useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';

export const ChatContext = createContext();

export const ChatProvider = ({ children, token }) => {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (token) {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
      const newSocket = io(socketUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      newSocket.on('user-online', (data) => {
        setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
      });

      newSocket.on('user-offline', (data) => {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      });

      // Handle message history when joining a room
      newSocket.on('message-history', (data) => {
        console.log('📚 Message history received:', data.messages.length);
        setMessages(data.messages.map(msg => ({
          _id: msg._id,
          senderId: msg.senderId,
          senderUsername: msg.senderUsername,
          senderAvatar: msg.senderAvatar,
          content: msg.content,
          type: msg.type,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          createdAt: msg.createdAt,
          timestamp: msg.createdAt,
          roomId: msg.roomId,
          isEdited: msg.isEdited,
          reactions: msg.reactions || []
        })));
      });

      // Handle new messages
      newSocket.on('receive-message', (data) => {
        console.log('Received message:', data);
        setMessages(prev => [...prev, {
          _id: data._id,
          senderId: data.senderId,
          senderUsername: data.senderUsername,
          senderAvatar: data.senderAvatar,
          content: data.content,
          type: data.type,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          createdAt: data.createdAt || data.timestamp,
          timestamp: data.timestamp,
          roomId: data.roomId,
          isEdited: data.isEdited,
          reactions: []
        }]);
      });

      // Handle edited messages
      newSocket.on('message-edited', (data) => {
        console.log('Message edited:', data._id);
        setMessages(prev => prev.map(msg => 
          msg._id === data._id 
            ? { ...msg, content: data.content, isEdited: true, editedAt: data.editedAt }
            : msg
        ));
      });

      // Handle deleted messages
      newSocket.on('message-deleted', (data) => {
        console.log('Message deleted:', data._id);
        setMessages(prev => prev.filter(msg => msg._id !== data._id));
      });

      // Handle reactions
      newSocket.on('reaction-added', (data) => {
        console.log('Reaction added to:', data._id);
        setMessages(prev => prev.map(msg =>
          msg._id === data._id 
            ? { ...msg, reactions: data.reactions }
            : msg
        ));
      });

      // Handle typing indicator
      newSocket.on('typing', (data) => {
        if (data.isTyping) {
          setTypingUsers(prev => [...new Set([...prev, data.userId])]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
      });

      // Handle errors
      newSocket.on('message-error', (data) => {
        console.error('Message error:', data.error);
        setError(data.error);
        setTimeout(() => setError(null), 5000);
      });

      newSocket.on('room-error', (data) => {
        console.error('Room error:', data.error);
        setError(data.error);
        setTimeout(() => setError(null), 5000);
      });

      // Listen for new direct chat notifications
      const userId = localStorage.getItem('userId');
      newSocket.on(`new-direct-chat-${userId}`, (data) => {
        console.log('📬 New direct chat received:', data);
        setRooms(prev => {
          const exists = prev.some(r => r._id === data.room._id);
          return exists ? prev : [...prev, data.room];
        });
      });

      // Listen for room deletion
      newSocket.on('room-deleted', (data) => {
        console.log('🗑️ Room deleted:', data.roomId);
        setRooms(prev => prev.filter(r => r._id !== data.roomId));
        if (currentRoom === data.roomId) {
          setCurrentRoom(null);
          setMessages([]);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token]);

  const joinRoom = useCallback((roomId) => {
    if (socket) {
      console.log('🚪 Joining room:', roomId);
      setCurrentRoom(roomId);
      setMessages([]); // Clear messages when switching rooms
      socket.emit('join-room', roomId);
    }
  }, [socket]);

  const leaveRoom = useCallback((roomId) => {
    if (socket) {
      console.log('👋 Leaving room:', roomId);
      socket.emit('leave-room', roomId);
      setCurrentRoom(null);
      setMessages([]);
    }
  }, [socket]);

  const sendMessage = useCallback((message) => {
    if (socket && currentRoom) {
      console.log('📤 Sending message to room:', currentRoom);
      socket.emit('send-message', {
        roomId: currentRoom,
        message,
        type: 'text'
      });
    }
  }, [socket, currentRoom]);

  const editMessage = useCallback((messageId, content) => {
    if (socket && currentRoom) {
      console.log('✏️ Editing message:', messageId);
      socket.emit('edit-message', {
        messageId,
        content,
        roomId: currentRoom
      });
    }
  }, [socket, currentRoom]);

  const deleteMessage = useCallback((messageId) => {
    if (socket && currentRoom) {
      console.log('🗑️ Deleting message:', messageId);
      socket.emit('delete-message', {
        messageId,
        roomId: currentRoom
      });
    }
  }, [socket, currentRoom]);

  const addReaction = useCallback((messageId, emoji) => {
    if (socket && currentRoom) {
      console.log('😊 Adding reaction to message:', messageId);
      socket.emit('add-reaction', {
        messageId,
        emoji,
        roomId: currentRoom
      });
    }
  }, [socket, currentRoom]);

  const startTyping = useCallback(() => {
    if (socket && currentRoom) {
      socket.emit('typing', { roomId: currentRoom });
    }
  }, [socket, currentRoom]);

  const stopTyping = useCallback(() => {
    if (socket && currentRoom) {
      socket.emit('stop-typing', { roomId: currentRoom });
    }
  }, [socket, currentRoom]);

  const value = {
    socket,
    rooms,
    setRooms,
    currentRoom,
    setCurrentRoom,
    messages,
    setMessages,
    onlineUsers,
    typingUsers,
    error,
    joinRoom,
    leaveRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    startTyping,
    stopTyping
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
