const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  mobile: { type: String, required: true },
  employeeId: { type: String, required: true },
  category: { type: String, required: false }, // Made optional for backward compatibility
  idProofDocument: { type: String }, // Base64 encoded document
  idProofFileName: { type: String }, // Original file name
  idProofFileType: { type: String }, // File MIME type
  status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  documents: [
    {
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
}, { strict: false });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
