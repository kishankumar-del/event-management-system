const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Signs a JSON Web Token for the authenticated user
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User's role (admin, organizer, attendee)
 * @returns {string} Signed JWT token
 */
const signToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Synchronously or asynchronously verifies a JWT token
 * @param {string} token - The raw Bearer token string
 * @returns {object} Decoded JWT payload
 */
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

/**
 * Strips passwordHash and sensitive internals from a user object
 * @param {object} user - Mongoose document or plain JS user object
 * @returns {object} Safe user object
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;
  delete userObj.__v;
  return userObj;
};

module.exports = {
  signToken,
  verifyToken,
  sanitizeUser,
};

