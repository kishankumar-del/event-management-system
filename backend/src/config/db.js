const mongoose = require('mongoose');
const env = require('./env');

// Set buffering timeout to 3s to avoid freezing requests when database is unreachable
mongoose.set('bufferTimeoutMS', 3000);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Initial connection error: ${error.message}`);
    // If during server bootstrap, log error. Do not exit if in test environment.
    if (env.NODE_ENV !== 'test') {
      console.warn('[MongoDB] Running without active database connection or waiting for retry.');
    }
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime connection error: ${err.message}`);
});

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };

