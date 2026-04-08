const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderUsername: {
    type: String,
    required: true
  },
  senderAvatar: {
    type: String
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'emoji'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  reactions: [{
    userId: mongoose.Schema.Types.ObjectId,
    emoji: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
