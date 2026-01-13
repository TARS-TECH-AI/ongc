const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const connectDB = require('../utils/db');

const router = express.Router();

// Configure multer to use memory storage for direct uploads to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, .png and .pdf files are allowed'));
    }
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = verified.id;
    next();
  } catch (err) {
    // Log token verification errors for debugging without leaking token
    console.error('Token verification failed:', err && err.message ? err.message : err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Register
router.post('/register', upload.single('idProof'), async (req, res) => {
  try {
    await connectDB();
    // Ensure indexes are created (forces index build and surfaces duplicate key errors early)
    try { await User.init(); } catch (e) { console.warn('User.init() failed:', e && e.message ? e.message : e); }
    console.log('Registration request received');

    // Accept fields from multipart/form-data or JSON body
    const { name, password, designation, category } = req.body;
    // Normalize and trim critical fields to avoid mismatches
    const emailRaw = (req.body.email || '').trim();
    const mobileRaw = (req.body.mobile || '').trim();
    const employeeIdRaw = (req.body.employeeId || '').trim();
    const email = emailRaw.toLowerCase();
    const mobile = mobileRaw;
    const employeeId = employeeIdRaw;

    if (!name || !email || !password || !mobile || !employeeId) {
      const missing = [];
      if (!name) missing.push('name');
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!mobile) missing.push('mobile');
      if (!employeeId) missing.push('employeeId');
      // Trimmed/normalized inputs for debugging
      console.log('Normalized registration fields:', { email, mobile, employeeId });
      
      console.log('Missing fields:', missing);
      return res.status(400).json({ 
        message: 'All fields are required',
        missingFields: missing 
      });
    }

    // Check for existing user by email, mobile or employeeId (normalized)
    const existing = await User.findOne({ $or: [{ email }, { mobile }, { employeeId }] });
    if (existing) {
      // Unified message to avoid leaking which field matched and give clear next action
      return res.status(400).json({ message: 'Your registration already exists. Please login.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      passwordHash,
      mobile,
      employeeId,
      designation,
      category,
    };

    // Ensure fields saved are normalized
    userData.email = email;
    userData.mobile = mobile;
    userData.employeeId = employeeId;

    // Handle ID proof upload if file is provided
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'idproofs' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          stream.end(req.file.buffer);
        });
        userData.idProofDocument = result.secure_url;
        userData.idProofFileName = req.file.originalname;
        userData.idProofFileType = req.file.mimetype;
        userData.idProofPublicId = result.public_id || '';
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr);
        return res.status(500).json({ message: 'File upload failed' });
      }
    }

    // Backward compatible: accept base64 in body if present
    if (req.body.idProofDocument && !userData.idProofDocument) {
      userData.idProofDocument = req.body.idProofDocument;
      userData.idProofFileName = req.body.idProofFileName;
      userData.idProofFileType = req.body.idProofFileType;
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({
      message: 'Registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        employeeId: user.employeeId,
        designation: user.designation,
        category: user.category,
        status: user.status,
        hasIdProof: !!user.idProofDocument
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    // Handle Mongo duplicate key error (E11000) - may occur during race conditions
    if (err && err.code === 11000) {
      // Duplicate key error - return friendly unified message
      return res.status(400).json({ message: 'Your registration already exists. Please login.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Check field availability (email/mobile/employeeId)
router.get('/check', async (req, res) => {
  try {
    await connectDB();
    const { field, value } = req.query;
    if (!field || !value) return res.status(400).json({ message: 'Missing params' });
    const v = value.trim();
    let query;
    if (field === 'email') query = { email: v.toLowerCase() };
    else if (field === 'mobile') query = { mobile: v };
    else if (field === 'employeeId') query = { employeeId: v };
    else return res.status(400).json({ message: 'Invalid field' });
    const existing = await User.findOne(query);
    if (existing) return res.json({ available: false, message: 'Your registration already exists. Please login.' });
    return res.json({ available: true });
  } catch (err) {
    console.error('Availability check error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { password } = req.body;
    const emailRaw = (req.body.email || '').trim();
    const email = emailRaw.toLowerCase();
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({
      message: 'Logged in',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        employeeId: user.employeeId,
        designation: user.designation,
        category: user.category,
        status: user.status,
        hasIdProof: !!user.idProofDocument
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', verifyToken, upload.single('idProof'), async (req, res) => {
  try {
    await connectDB();
    const { name, designation, category } = req.body;
    const mobileRaw = req.body.mobile ? req.body.mobile.trim() : undefined;
    const employeeIdRaw = req.body.employeeId ? req.body.employeeId.trim() : undefined;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Update fields
    if (name) user.name = name;
    if (mobileRaw) {
      // ensure no other user has this mobile
      const other = await User.findOne({ mobile: mobileRaw, _id: { $ne: user._id } });
      if (other) return res.status(400).json({ message: 'Mobile number already registered' });
      user.mobile = mobileRaw;
    }
    if (employeeIdRaw) {
      const other = await User.findOne({ employeeId: employeeIdRaw, _id: { $ne: user._id } });
      if (other) return res.status(400).json({ message: 'Employee ID already registered' });
      user.employeeId = employeeIdRaw;
    }
    // Accept designation and category updates (allow empty string)
    if (designation !== undefined) user.designation = designation;
    if (category !== undefined) user.category = category;
    
    // If file uploaded, upload to Cloudinary
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'idproofs' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          stream.end(req.file.buffer);
        });
        user.idProofDocument = result.secure_url;
        user.idProofFileName = req.file.originalname;
        user.idProofFileType = req.file.mimetype;
        user.idProofPublicId = result.public_id || '';
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr);
        return res.status(500).json({ message: 'File upload failed' });
      }
    }
    
    // Log incoming update for debugging
    console.log('Profile update for user', req.userId, 'payload fields:', { name, mobile, employeeId, designation, category, hasFile: !!req.file });
    // Dump full body for debugging (covers both JSON and multipart)
    try { console.log('Full request body:', JSON.stringify(req.body)); } catch (e) { console.log('Full request body (raw):', req.body); }

    // Backward compatible: accept base64 if provided
    if (req.body.idProofDocument && !user.idProofDocument) {
      user.idProofDocument = req.body.idProofDocument;
      user.idProofFileName = req.body.idProofFileName;
      user.idProofFileType = req.body.idProofFileType;
    }
    
    await user.save();
    // Verify saved values
    try {
      const updated = await User.findById(req.userId).select('designation category');
      console.log('Saved designation/category:', { designation: updated && updated.designation, category: updated && updated.category });
    } catch (e) {
      console.log('Failed to read back updated user:', e && e.message ? e.message : e);
    }
    console.log('Profile saved for', req.userId);
    
    const updatedUser = await User.findById(req.userId).select('-passwordHash');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;