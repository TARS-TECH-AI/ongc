const mongoose = require('mongoose');

let cachedDb = null;

async function connectDB() {
  // If already connected, return cached connection
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // Prefer environment variables, support common names
  let MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL || null;

  // If not provided, in development fall back to localhost; in production fail fast
  if (!MONGO_URI) {
    const msgDev = 'MONGO_URI not set. Falling back to local mongodb://127.0.0.1:27017/ongc for development.';
    const msgProd = 'MONGO_URI is not set in environment; please set it in your deployment (e.g., Vercel ENV VARS)';

    if (process.env.NODE_ENV === 'production') {
      console.error(msgProd);
      throw new Error(msgProd);
    } else {
      console.warn(msgDev);
      MONGO_URI = 'mongodb+srv://payal:payal03@cluster0.abkaqwg.mongodb.net/contactdb?appName=Cluster0';
    }
  }

  // basic validation
  if (!/^mongodb(?:\+srv)?:\/\//.test(MONGO_URI)) {
    const msg = 'MONGO_URI does not look like a valid MongoDB connection string';
    console.error(msg, MONGO_URI);
    throw new Error(msg);
  }

  // Helper to mask credentials when logging
  const maskUri = (uri) => {
    try {
      return uri.replace(/(mongodb(?:\+srv)?:\/\/)(.*:.*@)?(.*)/, (m, p1, p2, p3) => `${p1}${p2 ? '****:****@' : ''}${p3}`);
    } catch { return '***'; }
  };

  const maxAttempts = 3;
  let attempt = 0;
  let lastErr = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      console.log(`MongoDB: connecting (attempt ${attempt}) to ${maskUri(MONGO_URI)}`);
      const db = await mongoose.connect(MONGO_URI, {
        // Increase timeouts for serverless cold starts and network latency
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        // Connection pooling
        maxPoolSize: 20,
        minPoolSize: 2,
        // Keep the driver modern
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      cachedDb = db;
      console.log('MongoDB connected successfully');
      return db;
    } catch (error) {
      lastErr = error;
      console.error(`MongoDB connection attempt ${attempt} failed:`, error.message);
      // don't reveal credentials in logs
      if (attempt < maxAttempts) {
        const wait = 500 * attempt; // exponential-ish backoff
        console.log(`Retrying MongoDB connection in ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }

  // All attempts failed
  console.error('MongoDB connection failed after attempts:', lastErr && lastErr.stack);
  throw lastErr;
}

module.exports = connectDB;
