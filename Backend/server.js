require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const galleryRoutes = require('./routes/gallery');
const documentsRoutes = require('./routes/documents');
const path = require('path');
const connectDB = require('./utils/db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/documents', documentsRoutes);
const adminAuthRoutes = require('./routes/adminAuth');
const adminApprovalsRoutes = require('./routes/adminApprovals');
const updatesRoutes = require('./routes/updates');
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/approvals', adminApprovalsRoutes);
app.use('/api/updates', updatesRoutes);
// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health
app.get('/', (req, res) => res.json({ status: 'ok' }));

// DB health check
app.get('/health', async (req, res) => {
  try {
    await connectDB();
    return res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    // Do not include secrets in the response; include only short error message
    return res.status(503).json({ status: 'db-unavailable', error: err.name || 'DB_ERROR' });
  }
});

// Connect to MongoDB and start
const PORT = process.env.PORT || 5000;

// Try an initial connection but do NOT exit on failure - serverless environments
// should return controlled errors per-request rather than crash on cold start.
connectDB()
  .then(async () => {
    console.log('MongoDB connected (initial)');
    // Ensure model indexes are built at startup (will fail fast if duplicates exist)
    try {
      const User = require('./models/User');
      await User.init();
      console.log('User indexes ensured');
    } catch (e) {
      console.warn('User.init() failed at startup:', e && e.message ? e.message : e);
    }
  })
  .catch((err) => {
    console.error('Initial MongoDB connection failed (continuing):', err && err.message ? err.message : err);
  })
  .finally(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });

// Global error handler to ensure JSON responses
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});
