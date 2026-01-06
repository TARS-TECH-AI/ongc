require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/documents', documentsRoutes);
const adminAuthRoutes = require('./routes/adminAuth');
const adminApprovalsRoutes = require('./routes/adminApprovals');
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/approvals', adminApprovalsRoutes);
// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health
app.get('/', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start
const PORT = process.env.PORT || 5000;

// Try an initial connection but do NOT exit on failure - serverless environments
// should return controlled errors per-request rather than crash on cold start.
connectDB()
  .then(() => {
    console.log('MongoDB connected (initial)');
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
