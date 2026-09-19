const path = require('path');
const { pool } = require(path.join(__dirname, '../backend/src/config/db'));
const gstRateController = require(path.join(__dirname, '../backend/src/controllers/gstRateController'));

async function testGstRates() {
  try {
    // 1. Fetch rates
    const fakeRes = {
      json: (data) => console.log('Current GST rate suggestions:', data),
      status: (c) => fakeRes
    };
    await gstRateController.getAllGstRates({}, fakeRes);

    // 2. Add test custom rate 3%
    const addReq = { body: { rate: 3 } };
    const addRes = {
      json: (data) => console.log('Added GST rate:', data),
      status: (c) => addRes
    };
    await gstRateController.createGstRate(addReq, addRes);

    process.exit(0);
  } catch (err) {
    console.error('Error testing GST rates:', err);
    process.exit(1);
  }
}

testGstRates();
