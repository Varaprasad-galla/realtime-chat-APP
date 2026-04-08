const User = require('../models/User');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('chatRooms')
      .populate('contacts');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('-password')
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        username: username || undefined,
        bio: bio || undefined,
        avatar: avatar || undefined,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { status },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add contact
exports.addContact = async (req, res) => {
  try {
    const { contactId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { contacts: contactId } },
      { new: true }
    ).select('-password').populate('contacts');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove contact
exports.removeContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { contacts: contactId } },
      { new: true }
    ).select('-password').populate('contacts');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get contacts
exports.getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('contacts');

    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
