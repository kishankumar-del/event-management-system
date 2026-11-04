const app = require('./app');
const env = require('./src/config/env');
const { connectDB } = require('./src/config/db');

// Handle uncaught synchronous exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] Shutting down...', err.name, err.message);
  process.exit(1);
});

let server;

const startServer = async () => {
  // Connect to Database
  try {
    await connectDB();
  } catch (err) {
    console.warn(`[Bootstrap] Warning: Could not connect to MongoDB on startup (${err.message}). Continuing server bootstrap.`);
  }

  // Start HTTP listener
  server = app.listen(env.PORT, () => {
    console.log(`[Server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`[Health] Endpoint available at http://localhost:${env.PORT}/api/health`);
  });
};

startServer();

// Handle unhandled asynchronous promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION] Shutting down...', err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM (e.g. Render restart or container shutdown)
process.on('SIGTERM', () => {
  console.log('[SIGTERM RECEIVED] Gracefully shutting down...');
  if (server) {
    server.close(() => {
      console.log('[Process terminated]');
    });
  }
});

