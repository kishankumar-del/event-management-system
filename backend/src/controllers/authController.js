const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { signToken, sanitizeUser } = require('../services/authService');

/**
 * Register a new attendee or organizer
 */
const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check for duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists.', 400));
  }

  // Create new user (role defaults to attendee if not provided)
  const newUser = new User({
    name,
    email,
    passwordHash: password, // will be hashed in pre-save hook
    role: role || 'attendee',
  });
  await newUser.save();

  // Generate JWT token
  const token = signToken(newUser._id, newUser.role);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: sanitizeUser(newUser),
    },
  });
});

/**
 * Log in an existing user
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if user exists & fetch passwordHash
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  // 2. Verify account is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  // 3. Verify password match
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  // 4. Issue JWT
  const token = signToken(user._id, user.role);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: sanitizeUser(user),
    },
  });
});

/**
 * Get current authenticated user profile
 */
const getMe = catchAsync(async (req, res, next) => {
  // req.user was populated by the auth middleware
  res.status(200).json({
    status: 'success',
    data: {
      user: sanitizeUser(req.user),
    },
  });
});

/**
 * Client logout acknowledgment
 */
const logout = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
};
