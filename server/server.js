const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files - MUST BE BEFORE OTHER ROUTES
const uploadsPath = path.join(__dirname, 'uploads');
console.log('📁 Serving uploads from:', uploadsPath);
console.log('📁 Directory exists:', fs.existsSync(uploadsPath));

// Simple static file serving - no extra middleware
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, path, stat) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', mongodb: 'connected' });
});

// Test endpoint
app.get('/api/users-count', async (req, res) => {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check uploads directory
app.get('/api/uploads-check', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  try {
    const files = fs.readdirSync(uploadsPath);
    console.log('Files in uploads directory:', files);
    res.json({ 
      uploadsPath,
      directoryExists: fs.existsSync(uploadsPath),
      fileCount: files.length,
      files: files.slice(0, 20) // Show first 20 files
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read directory: ' + err.message });
  }
});

// Direct file test endpoint
app.get('/api/test-file/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'uploads', req.params.filename);
  console.log('Testing file access:', filepath);
  console.log('File exists:', fs.existsSync(filepath));
  
  if (fs.existsSync(filepath)) {
    console.log('Serving file:', filepath);
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'File not found: ' + filepath });
  }
});

// Socket.IO Events
const connectedUsers = new Map(); // Map of socketId -> userId
const userSockets = new Map();    // Map of userId -> [socketIds]
const Message = require('./models/Message');
const User = require('./models/User');
const ChatRoom = require('./models/ChatRoom');

// Socket.io authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    socket.userId = decoded.id;
    socket.user = decoded;
    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log('✅ User connected:', userId, 'Socket:', socket.id);

  // Track user's sockets
  connectedUsers.set(socket.id, userId);
  if (!userSockets.has(userId)) {
    userSockets.set(userId, []);
  }
  userSockets.get(userId).push(socket.id);

  // Notify user is online
  io.emit('user-online', { userId, socketId: socket.id });

  // Send message with persistence
  socket.on('send-message', async (data) => {
    try {
      const { roomId, message, type } = data;
      const senderId = socket.userId;

      if (!roomId || !message || !senderId) {
        console.error('Invalid message data:', data);
        socket.emit('message-error', { error: 'Invalid message data' });
        return;
      }

      // Verify user is in the room
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.members.includes(senderId)) {
        socket.emit('message-error', { error: 'Not a member of this room' });
        return;
      }

      // Fetch sender info
      const user = await User.findById(senderId);
      if (!user) {
        console.error('User not found:', senderId);
        socket.emit('message-error', { error: 'User not found' });
        return;
      }

      // Create and save message to database
      const newMessage = new Message({
        senderId,
        senderUsername: user.username,
        senderAvatar: user.avatar,
        roomId,
        content: message,
        type: type || 'text'
      });

      await newMessage.save();

      // Update room's lastMessage
      await ChatRoom.findByIdAndUpdate(roomId, {
        lastMessage: newMessage._id,
        lastMessageAt: new Date(),
        $addToSet: { messages: newMessage._id }
      });

      console.log('💾 Message saved to DB:', newMessage._id, 'Room:', roomId);

      // Broadcast the saved message with DB ID to ALL users in room
      io.to(roomId).emit('receive-message', {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        senderUsername: newMessage.senderUsername,
        senderAvatar: newMessage.senderAvatar,
        content: newMessage.content,
        timestamp: newMessage.createdAt,
        createdAt: newMessage.createdAt,
        type: newMessage.type || 'text',
        roomId: newMessage.roomId,
        isEdited: false,
        reactions: []
      });

      console.log('📡 Message broadcast to room:', roomId);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  // Join room and send chat history
  socket.on('join-room', async (roomId) => {
    try {
      const userId = socket.userId;
      console.log('🚪 User joining room:', roomId, 'UserId:', userId);

      // Verify user is a member of this room
      const room = await ChatRoom.findById(roomId);
      if (!room) {
        socket.emit('room-error', { error: 'Room not found' });
        return;
      }

      if (!room.members.includes(userId)) {
        // Auto-add public room members
        if (room.roomType === 'public') {
          room.members.push(userId);
          await room.save();
        } else {
          socket.emit('room-error', { error: 'Not a member of this room' });
          return;
        }
      }

      // Join socket room
      socket.join(roomId);
      console.log('✅ Socket joined room:', roomId);

      // Fetch recent message history (last 50 messages)
      const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      console.log('📚 Fetched', messages.length, 'messages for room:', roomId);

      // Send message history to the joining user
      socket.emit('message-history', {
        roomId,
        messages: messages.reverse()
      });

      // Notify other users in the room
      socket.to(roomId).emit('user-joined', {
        message: `A user joined the room`,
        userId
      });

      console.log('✅ Room join completed for:', roomId);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('room-error', { error: error.message });
    }
  });

  // Leave room
  socket.on('leave-room', (roomId) => {
    try {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', {
        message: `A user left the room`,
        userId: socket.userId
      });
      console.log('👋 User left room:', roomId);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Edit message
  socket.on('edit-message', async (data) => {
    try {
      const { messageId, content, roomId } = data;
      const userId = socket.userId;

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('message-error', { error: 'Message not found' });
        return;
      }

      if (message.senderId.toString() !== userId) {
        socket.emit('message-error', { error: 'Not authorized to edit this message' });
        return;
      }

      message.content = content;
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      // Broadcast edited message
      io.to(roomId).emit('message-edited', {
        _id: message._id,
        content: message.content,
        isEdited: true,
        editedAt: message.editedAt,
        roomId
      });

      console.log('✏️ Message edited:', messageId);
    } catch (error) {
      console.error('Error editing message:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  // Delete message
  socket.on('delete-message', async (data) => {
    try {
      const { messageId, roomId } = data;
      const userId = socket.userId;

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('message-error', { error: 'Message not found' });
        return;
      }

      if (message.senderId.toString() !== userId) {
        socket.emit('message-error', { error: 'Not authorized to delete this message' });
        return;
      }

      await Message.findByIdAndDelete(messageId);

      // Remove from room's messages array
      await ChatRoom.findByIdAndUpdate(roomId, {
        $pull: { messages: messageId }
      });

      // Broadcast deleted message notification
      io.to(roomId).emit('message-deleted', {
        _id: messageId,
        roomId
      });

      console.log('🗑️ Message deleted:', messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  // Add reaction to message
  socket.on('add-reaction', async (data) => {
    try {
      const { messageId, emoji, roomId } = data;
      const userId = socket.userId;

      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { reactions: { userId, emoji } } },
        { new: true }
      );

      if (!message) {
        socket.emit('message-error', { error: 'Message not found' });
        return;
      }

      // Broadcast reaction update
      io.to(roomId).emit('reaction-added', {
        _id: messageId,
        reactions: message.reactions,
        roomId
      });

      console.log('😊 Reaction added to message:', messageId);
    } catch (error) {
      console.error('Error adding reaction:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('typing', {
      userId: socket.userId,
      isTyping: true,
      roomId
    });
  });

  socket.on('stop-typing', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('typing', {
      userId: socket.userId,
      isTyping: false,
      roomId
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    connectedUsers.delete(socket.id);
    
    if (userId && userSockets.has(userId)) {
      const sockets = userSockets.get(userId);
      const index = sockets.indexOf(socket.id);
      if (index > -1) {
        sockets.splice(index, 1);
      }
      if (sockets.length === 0) {
        userSockets.delete(userId);
        io.emit('user-offline', { userId, socketId: socket.id });
      }
    }
    
    console.log('❌ User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

module.exports = { app, io, server };
