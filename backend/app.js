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

// CORS configuration (supporting comma-separated origins, wildcards, or any local origin in dev)
const allowedOrigins = (env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Non-browser requests (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // 2. Allow if wildcard or explicitly allowed in CORS_ORIGIN
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 3. In development, automatically allow localhost and 127.0.0.1 on any port
      if (env.NODE_ENV !== 'production') {
        const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin);
        if (isLocal) return callback(null, true);
      }

      // 4. Match wildcard patterns like https://*.netlify.app
      const matchesPattern = allowedOrigins.some((allowed) => {
        if (!allowed.includes('*')) return false;
        const regex = new RegExp('^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      });
      if (matchesPattern) return callback(null, true);

      // Cleanly reject CORS without throwing an unhandled Error
      return callback(null, false);
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

