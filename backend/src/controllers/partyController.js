const { pool } = require('../config/db');

// GET /api/parties?search=xyz
exports.getParties = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM parties';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ' WHERE name ILIKE $1 OR mobile ILIKE $1';
    }
    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch parties' });
  }
};

// GET /api/parties/:id
exports.getPartyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM parties WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch party' });
  }
};

// GET /api/parties/:id/bills
exports.getPartyBills = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM bills WHERE party_id = $1 ORDER BY invoice_date DESC, id DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch party bill history' });
  }
};

// POST /api/parties
exports.createParty = async (req, res) => {
  try {
    const { name, mobile, address, state, gstin, email } = req.body;
    if (!name || !mobile || !state) {
      return res.status(400).json({ error: 'name, mobile and state are required' });
    }
    const result = await pool.query(
      `INSERT INTO parties (name, mobile, address, state, gstin, email)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, mobile, address || null, state, gstin || null, email || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create party' });
  }
};

// PUT /api/parties/:id
exports.updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, address, state, gstin, email } = req.body;
    const result = await pool.query(
      `UPDATE parties SET name=$1, mobile=$2, address=$3, state=$4, gstin=$5, email=$6
       WHERE id=$7 RETURNING *`,
      [name, mobile, address || null, state, gstin || null, email || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update party' });
  }
};

// DELETE /api/parties/:id
exports.deleteParty = async (req, res) => {
  try {
    const { id } = req.params;
    // Un-link party_id from existing bills so historical invoice data is preserved
    await pool.query('UPDATE bills SET party_id = NULL WHERE party_id = $1', [id]);
    const result = await pool.query('DELETE FROM parties WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    res.json({ message: 'Party deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete party' });
  }
};
