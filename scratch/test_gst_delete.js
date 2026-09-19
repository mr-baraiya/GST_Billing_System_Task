const path = require('path');
const { pool } = require(path.join(__dirname, '../backend/src/config/db'));
const gstRateController = require(path.join(__dirname, '../backend/src/controllers/gstRateController'));

async function testGstDelete() {
  try {
    // 1. Insert test rate 15%
    const ins = await pool.query('INSERT INTO gst_rates (rate) VALUES (15) RETURNING *');
    const rateId = ins.rows[0].id;
    console.log('Inserted test rate:', ins.rows[0]);

    // 2. Delete test rate
    const fakeReq = { params: { id: rateId } };
    const fakeRes = {
      json: (data) => console.log('Deleted result:', data),
      status: (c) => fakeRes
    };

    await gstRateController.deleteGstRate(fakeReq, fakeRes);
    process.exit(0);
  } catch (err) {
    console.error('Error testing GST rate deletion:', err);
    process.exit(1);
  }
}

testGstDelete();
