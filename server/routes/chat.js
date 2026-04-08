const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createRoom,
  getAllRooms,
  getUserRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  deleteRoom,
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  addReaction,
  uploadFile,
  searchRooms,
  getAllUsers,
  getOrCreateDirectChat
} = require('../controllers/chatController');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination called');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + '-' + file.originalname;
    console.log('Multer filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter - file mimetype:', file.mimetype);
    // Allow images and documents
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedMimes.includes(file.mimetype)) {
      console.log('File accepted');
      cb(null, true);
    } else {
      console.log('File rejected - invalid mime type');
      cb(new Error('Invalid file type'));
    }
  }
});

const router = express.Router();

// Room routes
router.post('/rooms', auth, createRoom);
router.get('/rooms', auth, getAllRooms);
router.get('/my-rooms', auth, getUserRooms);
router.get('/rooms/:roomId', auth, getRoomById);
router.post('/rooms/:roomId/join', auth, joinRoom);
router.post('/rooms/:roomId/leave', auth, leaveRoom);
router.delete('/rooms/:roomId', auth, deleteRoom);

// Message routes
router.post('/rooms/:roomId/messages', auth, sendMessage);
router.get('/rooms/:roomId/messages', auth, getMessages);
router.put('/messages/:messageId', auth, editMessage);
router.delete('/messages/:messageId', auth, deleteMessage);
router.post('/messages/:messageId/reaction', auth, addReaction);

// File upload route
router.post('/upload', auth, upload.single('file'), uploadFile);

// Search and user routes
router.get('/rooms/search/public', auth, searchRooms);
router.get('/users', auth, getAllUsers);
router.get('/direct/:otherUserId', auth, getOrCreateDirectChat);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error.message);
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  } else if (error) {
    console.error('Upload error:', error.message);
    return res.status(400).json({ error: error.message });
  }
  next();
});

module.exports = router;
