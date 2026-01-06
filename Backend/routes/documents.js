const express = require('express');
const jwt = require('jsonwebtoken');
const Document = require('../models/Document');
const connectDB = require('../utils/db');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const router = express.Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
    console.log('Documents GET: Connecting to DB...');
    await connectDB();
    console.log('Documents GET: DB connected, fetching documents...');
    
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
    console.log(`Documents GET: Found ${documents.length} documents`);
    
    const formattedDocs = documents.map(doc => ({
      id: doc._id.toString(),
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
    if (err.name === 'MongoConnectionError') {
      return res.status(503).json({ message: 'Database connection error', error: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Add new document
router.post('/', adminAuth, upload.single('file'), async (req, res) => {
  try {
    await connectDB();
    
    const { title, category, ref, date } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    let fileUrl = '';
    let fileSize = '';
    let fileType = 'PDF';

    if (req.file) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'raw', folder: 'documents' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      fileUrl = result.secure_url;
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
      fileType = req.file.mimetype || 'PDF';
    } else {
      return res.status(400).json({ message: 'File is required' });
    }
    
    const newDoc = new Document({
      title,
      category,
      ref: ref || '',
      fileUrl,
      fileSize,
      fileType,
      date: date ? new Date(date) : new Date(),
    });
    
    await newDoc.save();
    
    res.json({
      message: 'Document added successfully',
      document: {
        id: newDoc._id.toString(),
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
        id: doc._id.toString(),
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
