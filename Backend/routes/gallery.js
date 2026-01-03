const express = require('express');
const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');
const connectDB = require('../utils/db');
const router = express.Router();

// Public endpoint: Get all gallery items
router.get('/', async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();
    
    const items = await Gallery.find().sort({ createdAt: -1 });
    const formattedItems = items.map(item => ({
      id: item._id,
      title: item.title,
      caption: item.caption,
      date: item.createdAt,
      src: item.src
    }));
    res.json({ items: formattedItems });
  } catch (err) {
    console.error('Gallery GET error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin endpoint: Add gallery item
router.post('/', async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();
    
    const { title, caption, image } = req.body;
    
    const newItem = new Gallery({
      title: title || 'Untitled',
      caption: caption || '',
      src: image
    });

    await newItem.save();
    
    res.json({ 
      id: newItem._id, 
      title: newItem.title, 
      caption: newItem.caption,
      date: new Date(newItem.createdAt).toLocaleDateString(),
      url: newItem.src
    });
  } catch (err) {
    console.error('Gallery POST error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin endpoint: Delete gallery item
router.delete('/:id', async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();
    
    const { id } = req.params;
    const item = await Gallery.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Gallery DELETE error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
