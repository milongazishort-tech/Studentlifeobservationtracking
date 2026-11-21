const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic and event listeners.
 */
const connectDB = async (retryCount = 5, retryDelay = 5000) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[Database] CRITICAL: MONGO_URI is not defined in environment variables.');
    throw new Error('MONGO_URI must be provided in environment variables.');
  }

  const options = {
    dbName: process.env.DB_NAME || 'studentlife_tracker',
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  };

  // Setup connection event listeners
  mongoose.connection.on('connected', () => {
    console.log(`[Database] MongoDB connected successfully to database: ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected. Waiting for reconnection...');
  });

  // Retry loop
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`[Database] Connecting to MongoDB (Attempt ${attempt}/${retryCount})...`);
      await mongoose.connect(uri, options);
      return mongoose.connection;
    } catch (err) {
      console.error(`[Database] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === retryCount) {
        console.error('[Database] Maximum connection attempts reached. Failed to connect to MongoDB.');
        throw err;
      }
      console.log(`[Database] Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

/**
 * Disconnect from MongoDB gracefully.
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected successfully.');
  } catch (err) {
    console.error('[Database] Error during MongoDB disconnection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
