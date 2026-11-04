const AppError = require('../utils/AppError');
const env = require('../config/env');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const val = err.keyValue ? err.keyValue[field] : 'value';
  const message = `Duplicate value '${val}' for field '${field}'. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  const message = `Validation failed: ${errors.map((e) => e.message).join('. ')}`;
  return new AppError(message, 400, errors);
};

const handleJWTError = () => new AppError('Invalid authentication token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Authentication token has expired. Please log in again.', 401);

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';
  error.errors = err.errors || [];

  // Mongoose bad ObjectId
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  // Mongoose duplicate key
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  // Mongoose validation error
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  // JWT errors
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (env.NODE_ENV === 'development' && error.statusCode === 500) {
    console.error('[UNHANDLED ERROR]', err);
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message || 'An unexpected server error occurred.',
    errors: error.errors,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

