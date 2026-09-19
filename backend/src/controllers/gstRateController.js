const { pool } = require('../config/db');

const DEFAULT_RATES = [0, 5, 12, 18, 28];

// GET /api/gst-rates (List all GST rate suggestions)
exports.getAllGstRates = async (req, res) => {
  try {
    // Seed defaults if table is empty
    for (const r of DEFAULT_RATES) {
      await pool.query('INSERT INTO gst_rates (rate) VALUES ($1) ON CONFLICT (rate) DO NOTHING', [r]);
    }

    const result = await pool.query('SELECT id, rate FROM gst_rates ORDER BY rate ASC');
    const rates = result.rows.map(r => ({ id: r.id, rate: Number(r.rate) }));

    res.json(rates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch GST rates' });
  }
};

// POST /api/gst-rates (Add a new GST rate suggestion)
exports.createGstRate = async (req, res) => {
  try {
    const { rate } = req.body;
    const numRate = Number(rate);

    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      return res.status(400).json({ error: 'Please enter a valid GST percentage (0 - 100%)' });
    }

    const existing = await pool.query('SELECT id, rate FROM gst_rates WHERE rate = $1', [numRate]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `GST rate ${numRate}% is already in suggestions` });
    }

    const result = await pool.query(
      'INSERT INTO gst_rates (rate) VALUES ($1) RETURNING id, rate',
      [numRate]
    );

    const newRate = { id: result.rows[0].id, rate: Number(result.rows[0].rate) };

    res.status(201).json({
      message: 'GST rate suggestion added successfully',
      rate: newRate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add GST rate suggestion' });
  }
};

// DELETE /api/gst-rates/:id (Delete a custom GST rate suggestion)
exports.deleteGstRate = async (req, res) => {
  try {
    const rateId = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM gst_rates WHERE id = $1', [rateId]);
    res.json({ message: 'GST rate suggestion deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete GST rate' });
  }
};
