const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  designation: { type: String, required: false }, // Added for user profile updates
  category: { type: String, required: false }, // Made optional for backward compatibility
  idProofDocument: { type: String }, // Base64 encoded document
  idProofFileName: { type: String }, // Original file name
  idProofFileType: { type: String }, // File MIME type
  idProofPublicId: { type: String, default: '' },
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

// Ensure indexes exist for unique fields (helps avoid race conditions)
try {
  // create indexes if they don't exist; this is safe if already created
  userSchema.index({ email: 1 }, { unique: true });
  userSchema.index({ mobile: 1 }, { unique: true });
  userSchema.index({ employeeId: 1 }, { unique: true });
} catch (e) {
  console.warn('Index creation skipped or failed:', e && e.message ? e.message : e);
}

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
