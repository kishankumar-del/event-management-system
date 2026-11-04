const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const env = require('./src/config/env');
const apiRoutes = require('./src/routes');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration (locked to env.CORS_ORIGIN, supporting comma-separated origins or '*')
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matched origin
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
  })
);

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing with limit to prevent denial of service
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Mount API routes
app.use('/api', apiRoutes);

// Root route welcome banner
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Event Management System REST API',
    documentation: '/api/health',
    status: 'online',
  });
});

// 404 handler for unknown routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;

