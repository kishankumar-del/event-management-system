const { verifyToken } = require('../services/authService');
const User = require('../models/User');

/**
 * Optional authentication middleware.
 * If Bearer token is provided, populates req.user.
 * If absent or invalid, simply passes through without throwing an error.
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = await verifyToken(token);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.isActive) {
      req.user = currentUser;
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }

  next();
};

module.exports = optionalAuth;

