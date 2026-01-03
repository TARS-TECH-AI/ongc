const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const connectDB = require('../utils/db');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'idproof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
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
router.post('/register', async (req, res) => {
  try {
    await connectDB();
    console.log('Registration request received');
    console.log('Body keys:', Object.keys(req.body));
    
    const { name, email, password, mobile, employeeId, idProofDocument, idProofFileName, idProofFileType } = req.body;

    if (!name || !email || !password || !mobile || !employeeId) {
      const missing = [];
      if (!name) missing.push('name');
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!mobile) missing.push('mobile');
      if (!employeeId) missing.push('employeeId');
      
      console.log('Missing fields:', missing);
      return res.status(400).json({ 
        message: 'All fields are required',
        missingFields: missing 
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      passwordHash,
      mobile,
      employeeId,
      status: 'Pending'
    };

    // Store base64 document if provided
    if (idProofDocument) {
      userData.idProofDocument = idProofDocument; // Store base64 string
      userData.idProofFileName = idProofFileName;
      userData.idProofFileType = idProofFileType;
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
        status: user.status,
        hasIdProof: !!user.idProofDocument
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
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
router.put('/profile', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const { name, mobile, employeeId, idProofDocument, idProofFileName, idProofFileType } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Update fields
    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (employeeId) user.employeeId = employeeId;
    
    // Update ID proof if provided
    if (idProofDocument) {
      user.idProofDocument = idProofDocument;
      user.idProofFileName = idProofFileName;
      user.idProofFileType = idProofFileType;
    }
    
    await user.save();
    
    const updatedUser = await User.findById(req.userId).select('-passwordHash');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;