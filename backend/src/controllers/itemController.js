const { pool } = require('../config/db');

// GET /api/items?search=xyz
exports.getItems = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM items';
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ' WHERE name ILIKE $1';
    }
    query += ' ORDER BY name ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// POST /api/items
exports.createItem = async (req, res) => {
  try {
    const { name, hsnCode, price, gstPercent } = req.body;
    if (!name || price === undefined || gstPercent === undefined) {
      return res.status(400).json({ error: 'name, price and gstPercent are required' });
    }
    const result = await pool.query(
      `INSERT INTO items (name, hsn_code, price, gst_percent)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, hsnCode || null, price, gstPercent]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

// PUT /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hsnCode, price, gstPercent } = req.body;
    const result = await pool.query(
      `UPDATE items SET name=$1, hsn_code=$2, price=$3, gst_percent=$4 WHERE id=$5 RETURNING *`,
      [name, hsnCode || null, price, gstPercent, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    // Un-link item_id from existing bill line items so historical invoice data is preserved
    await pool.query('UPDATE bill_items SET item_id = NULL WHERE item_id = $1', [id]);
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};
