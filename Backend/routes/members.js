const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const connectDB = require('../utils/db');

const requireAdmin = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.admin = { id: payload.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/members?type=cwc&limit=200
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const qType = (req.query.type || '').toString().toLowerCase();
    const type = qType === 'cec' ? 'CEC' : qType === 'cwc' ? 'CWC' : null;
    const limit = Math.min(2000, Math.max(1, Number(req.query.limit) || 200));
    const filter = {};
    if (type) filter.type = type;
    const items = await Member.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return res.json({ items });
  } catch (err) {
    console.error('GET /api/members', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/members - create
router.post('/', requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const { name, postInAssociation, unit, cpfNo, type } = req.body;
    if (!name || !cpfNo || !type) return res.status(400).json({ message: 'Missing fields: name, cpfNo, type required' });
    const t = (type || '').toString().toUpperCase();
    if (!['CWC', 'CEC'].includes(t)) return res.status(400).json({ message: 'Invalid type' });

    // Upsert by cpfNo+type to avoid duplicates
    const result = await Member.findOneAndUpdate(
      { cpfNo: cpfNo.toString().trim(), type: t },
      { $set: { name: name.trim(), postInAssociation: (postInAssociation || '').trim(), unit: (unit || '').trim(), createdBy: req.admin && req.admin.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ member: result });
  } catch (err) {
    console.error('POST /api/members', err && err.stack ? err.stack : err);
    // handle duplicate index error
    if (err && err.code === 11000) return res.status(409).json({ message: 'Duplicate CPF for this type' });
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/members/:id
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const update = {};
    ['name', 'postInAssociation', 'unit', 'cpfNo', 'type'].forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    if (update.type) update.type = update.type.toString().toUpperCase();
    const updated = await Member.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json({ member: updated });
  } catch (err) {
    console.error('PATCH /api/members/:id', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/members/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const deleted = await Member.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /api/members/:id', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
