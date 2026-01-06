const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['CWC Orders', 'CWC Letters', 'CWC Meeting', 'Other']
  },
  ref: { type: String, default: '' }, // Reference number
  fileUrl: { type: String, required: true }, // URL or base64
  fileSize: { type: String, default: '' }, // e.g., "1.2 MB"
  fileType: { type: String, default: 'PDF' },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  cloudinaryPublicId: { type: String, default: '' },
});

module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);
