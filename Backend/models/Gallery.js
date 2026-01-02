const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  caption: { type: String, default: '' },
  src: { type: String, required: true }, // base64 image data
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
