/**
 * Centralised configuration
 * Import this instead of process.env directly so all settings
 * are validated at startup and have sensible defaults.
 */

require('dotenv').config();

const required = (key) => {
  const val = process.env[key];
  if (!val && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};

module.exports = {
  port:        parseInt(process.env.PORT) || 5000,
  nodeEnv:     process.env.NODE_ENV || 'development',
  mongoUri:    required('MONGODB_URI') || 'mongodb+srv://yt:oJmDvxJODZQzlZb0@cluster0.zh9gikn.mongodb.net/',
  jwt: {
    secret:    required('JWT_SECRET') || 'dev_secret_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin:    process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    avatarDir:   'uploads/avatars',
    resumeDir:   'uploads/resumes',
  },
  rateLimit: {
    windowMs:  15 * 60 * 1000,
    general:   100,
    auth:      10,
  },
};
