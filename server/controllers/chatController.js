const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

// Create room (public or private with passkey)
exports.createRoom = async (req, res) => {
  try {
    const { name, description, roomType, passkey } = req.body;
    const adminId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    if (!roomType || !['public', 'private-group'].includes(roomType)) {
      return res.status(400).json({ error: 'Invalid room type' });
    }

    if (roomType === 'private-group' && !passkey) {
      return res.status(400).json({ error: 'Passkey is required for private rooms' });
    }

    const chatRoom = new ChatRoom({
      name,
      description,
      roomType,
      passkey: roomType === 'private-group' ? passkey : null,
      admin: adminId,
      members: [adminId],
      isOneToOne: false
    });

    await chatRoom.save();
    await chatRoom.populate('admin', 'username avatar');
    await chatRoom.populate('members', 'username avatar');

    res.status(201).json(chatRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all rooms (public and private)
exports.getAllRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const rooms = await ChatRoom.find({ 
      isArchived: false,
      roomType: { $in: ['public', 'private-group'] }
    })
      .populate('admin', 'username avatar')
      .populate('members', 'username avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    // Remove passkey from response for private rooms
    const safeRooms = rooms.map(room => {
      const roomObj = room.toObject();
      if (roomObj.roomType === 'private-group') {
        delete roomObj.passkey;
      }
      return roomObj;
    });

    res.json(safeRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user rooms
exports.getUserRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const rooms = await ChatRoom.find({ members: userId, isArchived: false })
      .populate('admin', 'username avatar')
      .populate('members', 'username avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    // Remove passkey from response for private rooms
    const safeRooms = rooms.map(room => {
      const roomObj = room.toObject();
      if (roomObj.roomType === 'private-group') {
        delete roomObj.passkey;
      }
      return roomObj;
    });

    res.json(safeRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId)
      .populate('admin', 'username avatar')
      .populate('members', 'username avatar')
      .populate('messages');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Remove passkey from response for private rooms
    const roomObj = room.toObject();
    if (roomObj.roomType === 'private-group') {
      delete roomObj.passkey;
    }

    res.json(roomObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Join room (public or private with passkey)
exports.joinRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;
    const { passkey } = req.body;

    const room = await ChatRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is already a member
    if (room.members.includes(userId)) {
      return res.json(room);
    }

    // Validate passkey for private rooms
    if (room.roomType === 'private-group') {
      if (!passkey || passkey !== room.passkey) {
        return res.status(403).json({ error: 'Invalid passkey' });
      }
    }

    // Public rooms can be joined without passkey
    if (room.roomType !== 'public' && room.roomType !== 'private-group') {
      return res.status(403).json({ error: 'Cannot join this room type' });
    }

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'username avatar');

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Leave room
exports.leaveRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;

    const room = await ChatRoom.findByIdAndUpdate(
      roomId,
      { $pull: { members: userId } },
      { new: true }
    ).populate('members', 'username avatar');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, type } = req.body;
    const senderId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const user = await User.findById(senderId);
    const message = new Message({
      senderId,
      senderUsername: user.username,
      senderAvatar: user.avatar,
      roomId,
      content,
      type: type || 'text'
    });

    await message.save();

    // Update room's lastMessage
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $addToSet: { messages: message._id }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const skip = (page - 1) * limit;

    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Message.countDocuments({ roomId });

    res.json({
      messages: messages.reverse(),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Message.findByIdAndRemove(messageId);

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add reaction
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { reactions: { userId, emoji } } },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload file/media
exports.uploadFile = async (req, res) => {
  try {
    console.log('=== uploadFile called ===');
    console.log('File:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'NO FILE');
    console.log('Body:', req.body);
    console.log('User:', req.user ? req.user.id : 'NO USER');

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { roomId, type } = req.body;
    const senderId = req.user.id;

    if (!roomId) {
      console.log('❌ No roomId provided');
      return res.status(400).json({ error: 'Room ID required' });
    }

    console.log('Fetching user:', senderId);
    const user = await User.findById(senderId);
    if (!user) {
      console.log('❌ User not found:', senderId);
      return res.status(404).json({ error: 'User not found' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const mediaType = type === 'image' ? 'image' : 'file';

    console.log('✅ File info:');
    console.log('   Filename:', req.file.filename);
    console.log('   FileUrl:', fileUrl);
    console.log('   MediaType:', mediaType);
    console.log('   RoomId:', roomId);

    const message = new Message({
      senderId,
      senderUsername: user.username,
      senderAvatar: user.avatar,
      roomId,
      content: req.file.originalname,
      type: mediaType,
      fileUrl,
      fileName: req.file.originalname
    });

    await message.save();
    console.log('✅ Message saved:', message._id);

    // Update room's lastMessage
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $addToSet: { messages: message._id }
    });

    console.log('✅ Room updated');

    // Broadcast message to all users in the room via Socket.io
    if (req.io) {
      const broadcastData = {
        _id: message._id,
        senderId: message.senderId,
        senderUsername: message.senderUsername,
        senderAvatar: message.senderAvatar,
        content: message.content,
        type: mediaType,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        createdAt: message.createdAt,
        roomId: message.roomId
      };
      console.log('📡 Broadcasting to room:', roomId);
      req.io.to(roomId).emit('receive-message', broadcastData);
    } else {
      console.log('⚠️ req.io not available');
    }

    console.log('✅ Upload completed successfully');
    res.status(201).json(message);
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Search public and private rooms
exports.searchRooms = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    const searchQuery = {
      isArchived: false,
      roomType: { $in: ['public', 'private-group'] },
      name: { $regex: query, $options: 'i' }
    };

    const rooms = await ChatRoom.find(searchQuery)
      .populate('admin', 'username avatar')
      .populate('members', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    // Mark if user is already a member and remove passkey
    const roomsWithMembership = rooms.map(room => {
      const roomObj = room.toObject();
      if (roomObj.roomType === 'private-group') {
        delete roomObj.passkey;
      }
      return {
        ...roomObj,
        isMember: room.members.some(m => m._id.toString() === userId)
      };
    });

    res.json(roomsWithMembership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users (for one-to-one chat creation)
exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await User.find({ _id: { $ne: userId } })
      .select('_id username avatar status')
      .sort({ username: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or get one-to-one chat room
exports.getOrCreateDirectChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    if (userId === otherUserId) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    // Check if user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if one-to-one room already exists between these users
    let room = await ChatRoom.findOne({
      isOneToOne: true,
      $or: [
        { admin: userId, participant: otherUserId },
        { admin: otherUserId, participant: userId }
      ]
    })
      .populate('admin', 'username avatar')
      .populate('participant', 'username avatar')
      .populate('lastMessage');

    // If not, create new one-to-one room
    if (!room) {
      const roomName = `${otherUser.username}`;

      room = new ChatRoom({
        name: roomName,
        description: '',
        roomType: 'private-one-to-one',
        admin: userId,
        members: [userId, otherUserId],
        participant: otherUserId,
        isOneToOne: true
      });

      await room.save();
      await room.populate('admin', 'username avatar');
      await room.populate('participant', 'username avatar');

      // Emit socket event to notify other user about new direct chat
      if (req.io) {
        console.log(`📡 Notifying user ${otherUserId} about new direct chat`);
        req.io.emit(`new-direct-chat-${otherUserId}`, {
          roomId: room._id,
          room: room.toObject(),
          fromUser: userId
        });
      }
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await ChatRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Only admin can delete the room
    if (room.admin.toString() !== userId) {
      return res.status(403).json({ error: 'Only room admin can delete room' });
    }

    // Delete all messages in the room
    await Message.deleteMany({ roomId });

    // Delete the room itself
    await ChatRoom.findByIdAndRemove(roomId);

    // Notify all users in the room via Socket.io
    if (req.io) {
      console.log(`🗑️ Room ${roomId} deleted by admin`);
      req.io.to(roomId).emit('room-deleted', { roomId });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
