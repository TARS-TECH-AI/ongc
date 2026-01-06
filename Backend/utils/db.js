const mongoose = require('mongoose');

function maskUriForLog(uri) {
  try {
    return uri.replace(/\/\/(.*?):(.*?)@/, '//****:****@');
  } catch (e) {
    return 'mongodb uri';
  }
}

/**
 * connectDB - connects to MongoDB with simple retry/backoff logic.
 * Returns the mongoose instance when connected.
 */
async function connectDB() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  const maxAttempts = parseInt(process.env.DB_CONNECT_ATTEMPTS || '5', 10);
  const baseDelay = parseInt(process.env.DB_RETRY_BASE_MS || '500', 10);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`MongoDB: connecting (attempt ${attempt}) to ${maskUriForLog(uri)}`);
      await mongoose.connect(uri, {
        // keep options minimal and compatible with modern mongoose
        family: 4,
        serverSelectionTimeoutMS: 5000
      });
      console.log('MongoDB connected');
      return mongoose;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err && err.message ? err.message : err);
      // If last attempt, rethrow so caller can handle
      if (attempt === maxAttempts) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying MongoDB connection in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

module.exports = connectDB;
