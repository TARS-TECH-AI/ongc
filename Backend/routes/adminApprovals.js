const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const connectDB = require('../utils/db');

const router = express.Router();

// simple admin auth middleware
const adminAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    console.warn('Admin auth failed: missing Authorization header');
    return res.status(401).json({ message: 'Missing Authorization header' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (payload.role !== 'admin') {
      console.warn('Admin auth failed: user missing admin role', payload && payload.role);
      return res.status(403).json({ message: 'Forbidden: admin role required' });
    }
    req.admin = payload;
    next();
  } catch (err) {
    console.warn('Admin auth failed: token invalid or expired:', err && err.message ? err.message : err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// storage for multer (use /tmp on serverless)
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.warn('Could not create upload directory:', err.message);
  }
}
const storage = multer.diskStorage({ destination: uploadDir, filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) });
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET / - list users (optional ?status=Pending)
router.get('/', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const { status } = req.query;
    const q = status ? { status } : {};
    // Return newest users first
    const users = await User.find(q).select('-passwordHash -idProofDocument').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /:id - get user details
router.get('/:id', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const u = await User.findById(req.params.id).select('-passwordHash');
    if (!u) return res.status(404).json({ message: 'Not found' });
    // Avoid returning large inline/base64 documents in the main details payload.
    // If the idProofDocument is a data URL (inline), omit it and set a flag so
    // the frontend can request it explicitly when needed.
    const isInline = typeof u.idProofDocument === 'string' && u.idProofDocument.startsWith('data:');
    res.json({ 
      id: u._id, 
      name: u.name, 
      email: u.email, 
      phone: u.mobile || u.phone, 
      mobile: u.mobile,
      employeeId: u.employeeId,
      category: u.category, 
      designation: u.designation,
      date: u.createdAt, 
      status: u.status, 
      docs: u.documents || [],
      // If the document is an inline data URL, do not include it here to reduce payload
      idProofDocument: isInline ? null : u.idProofDocument,
      idProofFileName: u.idProofFileName,
      idProofFileType: u.idProofFileType,
      idProofInline: isInline
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /:id/idproof - fetch the full id proof document (may be large); call only when needed
router.get('/:id/idproof', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const u = await User.findById(req.params.id).select('idProofDocument idProofFileName idProofFileType');
    if (!u) return res.status(404).json({ message: 'Not found' });
    if (!u.idProofDocument) return res.status(404).json({ message: 'ID proof not found' });
    // Return the full document safely
    res.json({ idProofDocument: u.idProofDocument, idProofFileName: u.idProofFileName, idProofFileType: u.idProofFileType });
  } catch (err) {
    console.error('Error fetching id proof:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /:id/status - update status
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const { status } = req.body;
    if (!['Pending','Approved','Rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    u.status = status;
    await u.save();

    // Send email notifying user about approval/rejection (best-effort)
    try {
      const { sendMail, approvalEmail } = require('../utils/mailer');
      const mail = approvalEmail(u.name || u.email, status === 'Approved', process.env.SITE_NAME || 'AISCSTEWA');
      sendMail({ to: u.email, ...mail });
    } catch (mailErr) {
      console.error('Failed to send approval email:', mailErr && mailErr.message ? mailErr.message : mailErr);
    }

    res.json({ message: 'Status updated', status: u.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /:id/documents - upload a document for the user
router.post('/:id/documents', adminAuth, upload.single('file'), async (req, res) => {
  try {
    await connectDB();
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    u.documents = u.documents || [];
    u.documents.push({ name: req.file.originalname, url });
    await u.save();
    res.json({ message: 'Uploaded', doc: u.documents[u.documents.length-1] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /:id - delete a user and cascade-delete related resources (id proof, uploaded files)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Not found' });

    // Delete Cloudinary id proof if present
    if (u.idProofPublicId) {
      try {
        await cloudinary.uploader.destroy(u.idProofPublicId, { resource_type: 'auto' });
        console.log('Deleted user idProof from Cloudinary:', u.idProofPublicId);
      } catch (cErr) {
        console.error('Failed to delete idProof from Cloudinary:', cErr.message || cErr);
      }
    }

    // Delete any uploaded local files referenced in u.documents
    if (u.documents && u.documents.length) {
      for (const doc of u.documents) {
        try {
          if (doc.url && doc.url.startsWith('/uploads/')) {
            const fp = path.join(__dirname, '..', doc.url);
            if (fs.existsSync(fp)) {
              fs.unlinkSync(fp);
              console.log('Deleted local uploaded file:', fp);
            }
          }
        } catch (fErr) {
          console.error('Failed to delete uploaded file:', fErr && fErr.message ? fErr.message : fErr);
        }
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and associated files deleted' });
  } catch (err) {
    console.error('User DELETE error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;