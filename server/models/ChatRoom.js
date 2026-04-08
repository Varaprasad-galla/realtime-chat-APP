const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a room name'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  roomType: {
    type: String,
    enum: ['public', 'private-group', 'private-one-to-one'],
    default: 'public'
  },
  passkey: {
    type: String,
    default: null
  },
  isOneToOne: {
    type: Boolean,
    default: false
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  icon: {
    type: String,
    default: 'https://via.placeholder.com/100'
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: Date,
  maxMembers: {
    type: Number,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
