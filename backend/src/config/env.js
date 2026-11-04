const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env if present
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredInProduction = ['MONGODB_URI', 'JWT_SECRET'];

if (process.env.NODE_ENV === 'production') {
  for (const envVar of requiredInProduction) {
    if (!process.env[envVar]) {
      throw new Error(`CRITICAL: Environment variable ${envVar} is missing in production!`);
    }
  }
}

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_management',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_development_secret_key_minimum_32_characters_long',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

module.exports = env;

