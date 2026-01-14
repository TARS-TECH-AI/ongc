const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  postInAssociation: { type: String, trim: true },
  unit: { type: String, trim: true },
  cpfNo: { type: String, required: true, trim: true },
  type: { type: String, enum: ['CWC', 'CEC'], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

MemberSchema.index({ cpfNo: 1, type: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Member', MemberSchema);
