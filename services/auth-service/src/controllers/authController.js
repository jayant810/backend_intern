const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.status(200).json({ success: true, data: user });
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh
// @access  Public
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create Access Token
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '15m' // Short lived access token
  });

  // Create Refresh Token
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123', {
    expiresIn: '7d' // Long lived refresh token
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};
