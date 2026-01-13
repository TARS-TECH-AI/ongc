const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  venue: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String },
  postedDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Update || mongoose.model('Update', updateSchema);
