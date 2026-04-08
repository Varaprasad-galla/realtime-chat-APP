const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register
exports.register = async (req, res) => {
  try {
    console.log('Register request received:', req.body); // Debug log
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      console.log('Missing fields:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ error: 'Please provide all fields' });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      console.log('User already exists:', email);
      if (user.email === email) {
        return res.status(400).json({ error: 'Email already exists' });
      } else {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Create user
    user = new User({
      username,
      email,
      password
    });

    console.log('Saving user:', username);
    await user.save();
    console.log('User saved successfully:', username);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordLength: password?.length }); // Debug

    // Validation
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check user
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', !!user, email); // Debug
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ error: 'User does not exist' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch); // Debug
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ error: 'Wrong password' });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('Login successful for:', email);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const token = generateToken(user._id);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
