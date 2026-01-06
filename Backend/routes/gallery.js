const express = require('express');
const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');
const connectDB = require('../utils/db');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

// Public endpoint: Get all gallery items
router.get('/', async (req, res) => {
  try {
    // Ensure database connection
    console.log('Gallery GET: Attempting to connect to database...');
    await connectDB();
    console.log('Gallery GET: Database connected, fetching items...');
    
    // Fetch limited items to avoid timeout, use lean() for better performance
    const items = await Gallery.find()
      .select('_id title caption createdAt src')
      .lean()
      .limit(20); // Limit to 20 images to avoid timeout
    
    console.log(`Gallery GET: Found ${items.length} items`);
    
    const formattedItems = items.map(item => ({
      id: item._id.toString(),
      title: item.title,
      caption: item.caption,
      date: item.createdAt,
      src: item.src
    })).reverse(); // Show newest first
    
    res.json({ items: formattedItems });
  } catch (err) {
    console.error('Gallery GET error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Admin endpoint: Add gallery item
router.post('/', async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();

    const { title, caption, image } = req.body;
    console.log('Gallery POST: received payload keys ->', Object.keys(req.body));

    let srcUrl = image;

    // If client sent a base64 data URL, upload to Cloudinary and store the secure URL
    if (typeof image === 'string' && (image.startsWith('data:') || image.includes('base64'))) {
      try {
        console.log('Gallery POST: uploading image to Cloudinary...');
        const uploadResult = await cloudinary.uploader.upload(image, { folder: 'ONGC/gallery' });
        srcUrl = uploadResult.secure_url;
        var cloudinaryPublicId = uploadResult.public_id || '';
        console.log('Gallery POST: Cloudinary upload complete, url=', srcUrl);
      } catch (uploadErr) {
        console.error('Gallery POST: Cloudinary upload failed:', uploadErr);
        return res.status(502).json({ message: 'Failed to upload image', error: uploadErr.message });
      }
    }

    // Small sanity check for resulting src
    if (!srcUrl || typeof srcUrl !== 'string') {
      return res.status(400).json({ message: 'Invalid image data' });
    }

    const newItem = new Gallery({
      title: title || 'Untitled',
      caption: caption || '',
      src: srcUrl
      , cloudinaryPublicId: cloudinaryPublicId || ''
    });

    console.log('Gallery POST: saving new item to DB...');
    await newItem.save();
    console.log('Gallery POST: saved item id=', newItem._id.toString());

    res.json({ 
      id: newItem._id.toString(), 
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
    const item = await Gallery.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // If we have a stored Cloudinary public id, attempt to delete remote resource
    if (item.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(item.cloudinaryPublicId, { resource_type: 'image' });
        console.log('Gallery DELETE: removed cloudinary resource', item.cloudinaryPublicId);
      } catch (cloudErr) {
        console.error('Gallery DELETE: failed to remove cloudinary resource', cloudErr);
      }
    }

    await Gallery.findByIdAndDelete(id);

    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Gallery DELETE error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
