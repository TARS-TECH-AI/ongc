const express = require('express');
const jwt = require('jsonwebtoken');
const Update = require('../models/Update');
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

// Public: Get all updates (sorted: upcoming first, then past)
router.get('/', async (req, res) => {
  try {
    await connectDB();
    
    const updates = await Update.find().sort({ date: -1 });
    
    const now = new Date();
    
    // Separate upcoming and past events
    const upcoming = [];
    const past = [];
    
    updates.forEach(update => {
      const updateDate = new Date(update.date);
      if (updateDate >= now) {
        upcoming.push(update);
      } else {
        past.push(update);
      }
    });
    
    // Sort upcoming by date ascending (nearest first), past by date descending (recent first)
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const formattedUpdates = [...upcoming, ...past].map(update => ({
      id: update._id.toString(),
      title: update.title,
      venue: update.venue,
      description: update.description || '',
      date: update.date,
      postedDate: update.postedDate,
      time: update.time,
      isUpcoming: new Date(update.date) >= now,
    }));
    
    console.log('Formatted updates for GET:', formattedUpdates);
    
    res.json({ updates: formattedUpdates });
  } catch (err) {
    console.error('Updates GET error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Add new update
router.post('/', adminAuth, async (req, res) => {
  try {
    await connectDB();

    const { title, venue, date, description, postedDate, time } = req.body;

    console.log('Create Update payload:', { title, venue, date, description, postedDate, time });

    if (!title || !venue || !date) {
      return res.status(400).json({ message: 'Title, venue and date are required' });
    }

    const newUpdate = new Update({
      title,
      venue,
      description: description || '',
      date: new Date(date),
      postedDate: postedDate ? new Date(postedDate) : new Date(),
      time: time || '',
    });

    await newUpdate.save();

    res.json({
      message: 'Update added successfully',
      update: {
        id: newUpdate._id.toString(),
        title: newUpdate.title,
        venue: newUpdate.venue,
        description: newUpdate.description,
        date: newUpdate.date,
        postedDate: newUpdate.postedDate,
        time: newUpdate.time,
      }
    });
  } catch (err) {
    console.error('Updates POST error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Update existing update
router.put('/:id', adminAuth, async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;
    const { title, venue, description, date, postedDate, time } = req.body;

    console.log('Update payload for id', id, { title, venue, description, date, postedDate, time });

    const update = await Update.findById(id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    if (title) update.title = title;
    if (venue) update.venue = venue;
    if (description !== undefined) update.description = description;
    if (date) update.date = new Date(date);
    if (postedDate) update.postedDate = new Date(postedDate);
    if (time !== undefined) update.time = time;

    await update.save();

    res.json({
      message: 'Update modified successfully',
      update: {
        id: update._id.toString(),
        title: update.title,
        venue: update.venue,
        description: update.description,
        date: update.date,
        postedDate: update.postedDate,
        time: update.time,
      }
    });
  } catch (err) {
    console.error('Updates PUT error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Delete update
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    const update = await Update.findByIdAndDelete(id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    res.json({ message: 'Update deleted successfully' });
  } catch (err) {
    console.error('Updates DELETE error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
