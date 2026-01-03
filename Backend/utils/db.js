const mongoose = require('mongoose');

let cachedDb = null;

async function connectDB() {
  // If already connected, return cached connection
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ongc';

  try {
    const db = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      // Use new connection pooling
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    cachedDb = db;
    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

module.exports = connectDB;
