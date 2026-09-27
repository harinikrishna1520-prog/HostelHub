const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');

// Helper to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'hostelhub_super_secret_jwt_key_2026_secure',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, roomNumber, hostelBlock } = req.body;

    // Field validations
    if (!name || !email || !phone || !password || !confirmPassword || !roomNumber || !hostelBlock) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    // Role is strictly enforced as student for public registration
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'student',
      roomNumber: roomNumber.trim(),
      hostelBlock: hostelBlock.trim()
    });

    // Automatically associate student with the room if it exists
    try {
      const room = await Room.findOne({
        roomNumber: roomNumber.trim(),
        hostelBlock: hostelBlock.trim()
      });
      if (room) {
        if (!room.occupants.includes(user._id)) {
          room.occupants.push(user._id);
          await room.save();
        }
      }
    } catch (err) {
      console.error('Error linking user to room during register:', err);
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login.' });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Also fetch room information if student has assigned room
    let room = null;
    if (user.roomNumber && user.hostelBlock) {
      room = await Room.findOne({
        roomNumber: user.roomNumber,
        hostelBlock: user.hostelBlock
      }).populate('occupants', 'name email phone roomNumber hostelBlock');
    }

    res.json({
      success: true,
      user,
      room
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { name, phone, password } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (password && password.trim().length >= 6) {
      user.password = password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Failed to update profile.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
