const express = require('express');
const auth = require('../middleware/auth');
const {
  getUserProfile,
  getUserById,
  searchUsers,
  updateProfile,
  updateStatus,
  addContact,
  removeContact,
  getContacts
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', auth, getUserProfile);
router.get('/search', auth, searchUsers);
router.get('/:userId', auth, getUserById);
router.put('/profile', auth, updateProfile);
router.put('/status', auth, updateStatus);
router.post('/contacts', auth, addContact);
router.delete('/contacts/:contactId', auth, removeContact);
router.get('/contacts', auth, getContacts);

module.exports = router;
