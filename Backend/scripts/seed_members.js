const path = require('path');
const connectDB = require('../utils/db');
const Member = require('../models/Member');

async function seed() {
  try {
    await connectDB();

    // Require data arrays from AdminPanel
    const cwcPath = path.resolve(__dirname, '..', '..', 'AdminPanel', 'src', 'data', 'cwcMember.js');
    const cecPath = path.resolve(__dirname, '..', '..', 'AdminPanel', 'src', 'data', 'cecMembers.js');
    const cwc = require(cwcPath);
    const cec = require(cecPath);

    console.log(`Seeding ${cwc.length} CWC and ${cec.length} CEC members...`);

    const upsert = async (item, type) => {
      const name = item.name || item.Name || '';
      const postInAssociation = item.postInAssociation || item.post || item.designation || '';
      const unit = item.unit || item.Unit || '';
      const cpfNo = (item.cpfNo || item.cpf || '').toString();
      if (!name || !cpfNo) return null;
      const t = type.toString().toUpperCase();
      const doc = await Member.findOneAndUpdate(
        { cpfNo: cpfNo.trim(), type: t },
        { $set: { name: name.trim(), postInAssociation: postInAssociation.trim(), unit: unit.trim(), cpfNo: cpfNo.trim(), type: t } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return doc;
    };

    for (const it of cwc) {
      await upsert(it, 'CWC');
    }
    for (const it of cec) {
      await upsert(it, 'CEC');
    }

    const cwcCount = await Member.countDocuments({ type: 'CWC' });
    const cecCount = await Member.countDocuments({ type: 'CEC' });
    console.log('Seeding complete. Counts: CWC=', cwcCount, 'CEC=', cecCount);

    // close mongoose connection
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

seed();
