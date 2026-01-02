const express = require('express');
const jwt = require('jsonwebtoken');
const Contact = require('../models/Contact');
const User = require('../models/User');
const router = express.Router();

// Admin middleware - matches the one used in adminApprovals.js
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

// Admin: Get all contact enquiries
router.get('/admin/enquiries', adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate('user', 'name email mobile employeeId')
      .sort({ createdAt: -1 });
    
    res.json({ contacts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Require auth for contact submissions
router.post('/', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Unauthorized' });
    const token = auth.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid user' });

    const { name, email, subject, message } = req.body;
    // allow name/email override but default to user info
    const finalName = name || user.name;
    const finalEmail = email || user.email;

    if (!finalName || !finalEmail || !message) return res.status(400).json({ message: 'Missing fields' });

    const c = new Contact({ user: user._id, name: finalName, email: finalEmail, subject, message });
    await c.save();

    res.json({ message: 'Message received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;