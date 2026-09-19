const { pool } = require('../config/db');

exports.getShopSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shop_settings ORDER BY id ASC LIMIT 1');
    if (result.rows.length === 0) {
      return res.json({
        shop_name: process.env.SHOP_NAME || 'Darshan Electronics & Retail',
        address: process.env.SHOP_ADDRESS || '101 University Road, Rajkot, Gujarat',
        state: process.env.SHOP_STATE || 'Gujarat',
        gstin: process.env.SHOP_GSTIN || '24AAACD1234E1Z5',
        phone: process.env.SHOP_PHONE || '+91 98765 43210',
        email: process.env.SHOP_EMAIL || 'contact@darshanelectronics.com',
        invoice_prefix: 'INV-'
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch shop settings' });
  }
};

exports.updateShopSettings = async (req, res) => {
  try {
    const { shop_name, address, state, gstin, phone, email, invoice_prefix } = req.body;
    if (!shop_name || !state) {
      return res.status(400).json({ error: 'Shop Name and State are required' });
    }

    const check = await pool.query('SELECT id FROM shop_settings LIMIT 1');
    let result;
    if (check.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO shop_settings (shop_name, address, state, gstin, phone, email, invoice_prefix)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [shop_name, address, state, gstin, phone, email, invoice_prefix || 'INV-']
      );
    } else {
      const id = check.rows[0].id;
      result = await pool.query(
        `UPDATE shop_settings
         SET shop_name = $1, address = $2, state = $3, gstin = $4, phone = $5, email = $6, invoice_prefix = $7, updated_at = NOW()
         WHERE id = $8 RETURNING *`,
        [shop_name, address, state, gstin, phone, email, invoice_prefix || 'INV-', id]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update shop settings' });
  }
};
