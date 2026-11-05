const mongoose = require('mongoose');
const env = require('./env');

// Set buffering timeout to 3s to avoid freezing requests when database is unreachable
mongoose.set('bufferTimeoutMS', 3000);

let isConnecting = false;

const connectDB = async (retryCount = 0) => {
  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (env.NODE_ENV !== 'test') {
      console.warn(`[MongoDB] Connection failed. Retrying connection in 5s (attempt ${retryCount + 1})...`);
      setTimeout(() => connectDB(retryCount + 1), 5000);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection disconnected. Scheduling reconnect...');
  if (env.NODE_ENV !== 'test') {
    setTimeout(() => connectDB(), 3000);
  }
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime connection error: ${err.message}`);
});

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };

