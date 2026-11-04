const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Middleware that inspects express-validator results.
 * Formats errors and passes an AppError to the next middleware.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(new AppError('Input validation failed.', 400, formatted));
  }
  next();
};

module.exports = validate;

