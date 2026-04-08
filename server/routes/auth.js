const express = require('express');
const { register, login, getCurrentUser, refreshToken } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getCurrentUser);
router.post('/refresh', auth, refreshToken);

module.exports = router;
