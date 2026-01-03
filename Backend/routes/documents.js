const express = require('express');
const jwt = require('jsonwebtoken');
const Document = require('../models/Document');
const connectDB = require('../utils/db');
const router = express.Router();

// Admin middleware
const adminAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Public: Get all documents (with optional filters)
router.get('/', async (req, res) => {
  try {
    await connectDB();
    
    const { category, year } = req.query;
    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31T23:59:59`);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const documents = await Document.find(query).sort({ date: -1, createdAt: -1 });
    
    const formattedDocs = documents.map(doc => ({
      id: doc._id,
      title: doc.title,
      category: doc.category,
      ref: doc.ref,
      date: doc.date,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
    }));
    
    res.json({ documents: formattedDocs });
  } catch (err) {
    console.error('Documents GET error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Add new document
router.post('/', adminAuth, async (req, res) => {
  try {
    await connectDB();
    
    const { title, category, ref, fileUrl, fileSize, fileType, date } = req.body;
    
    if (!title || !category || !fileUrl) {
      return res.status(400).json({ message: 'Title, category, and fileUrl are required' });
    }
    
    const newDoc = new Document({
      title,
      category,
      ref: ref || '',
      fileUrl,
      fileSize: fileSize || '',
      fileType: fileType || 'PDF',
      date: date ? new Date(date) : new Date(),
    });
    
    await newDoc.save();
    
    res.json({
      message: 'Document added successfully',
      document: {
        id: newDoc._id,
        title: newDoc.title,
        category: newDoc.category,
        ref: newDoc.ref,
        date: newDoc.date,
        fileUrl: newDoc.fileUrl,
        fileSize: newDoc.fileSize,
        fileType: newDoc.fileType,
      }
    });
  } catch (err) {
    console.error('Documents POST error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Delete document
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await connectDB();
    
    const { id } = req.params;
    const doc = await Document.findByIdAndDelete(id);
    
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Documents DELETE error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Update document
router.put('/:id', adminAuth, async (req, res) => {
  try {
    await connectDB();
    
    const { id } = req.params;
    const { title, category, ref, fileUrl, fileSize, fileType, date } = req.body;
    
    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (title) doc.title = title;
    if (category) doc.category = category;
    if (ref !== undefined) doc.ref = ref;
    if (fileUrl) doc.fileUrl = fileUrl;
    if (fileSize !== undefined) doc.fileSize = fileSize;
    if (fileType) doc.fileType = fileType;
    if (date) doc.date = new Date(date);
    
    await doc.save();
    
    res.json({
      message: 'Document updated successfully',
      document: {
        id: doc._id,
        title: doc.title,
        category: doc.category,
        ref: doc.ref,
        date: doc.date,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
      }
    });
  } catch (err) {
    console.error('Documents PUT error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
