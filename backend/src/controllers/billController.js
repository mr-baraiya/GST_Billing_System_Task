const { pool } = require('../config/db');
const { calculateLine, calculateBillTotals } = require('../utils/gstCalculator');
const { generateInvoicePdf } = require('../utils/pdfGenerator');
const { sendInvoiceEmail } = require('../utils/emailService');

async function generateInvoiceNumber(client, prefix = 'INV-') {
  const seq = await client.query("SELECT nextval('invoice_seq') AS n");
  const n = seq.rows[0].n;
  return `${prefix}${String(n).padStart(4, '0')}`;
}

// GET /api/bills?party=&from=&to=&status=
exports.getBills = async (req, res) => {
  try {
    const { party, from, to, status } = req.query;
    const conditions = [];
    const params = [];

    if (party) {
      params.push(`%${party}%`);
      conditions.push(`party_name ILIKE $${params.length}`);
    }
    if (from) {
      params.push(from);
      conditions.push(`invoice_date >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      conditions.push(`invoice_date <= $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    let query = 'SELECT * FROM bills';
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY invoice_date DESC, id DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

// GET /api/bills/export/csv
exports.exportBillsCsv = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bills ORDER BY invoice_date DESC, id DESC');
    let csv = 'Invoice No,Invoice Date,Party Name,Party State,GSTIN,Tax Type,Subtotal,Total Tax,Discount,Grand Total,Status\n';
    result.rows.forEach((b) => {
      const dateStr = new Date(b.invoice_date).toISOString().split('T')[0];
      const gstinStr = b.party_gstin || '';
      csv += `"${b.invoice_no}","${dateStr}","${b.party_name.replace(/"/g, '""')}","${b.party_state}","${gstinStr}","${b.tax_type}",${b.subtotal},${b.total_tax},${b.discount || 0},${b.grand_total},"${b.status}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="GST_Bills_Export.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export bills CSV' });
  }
};

// GET /api/bills/:id
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await pool.query('SELECT * FROM bills WHERE id = $1', [id]);
    if (bill.rows.length === 0) return res.status(404).json({ error: 'Bill not found' });
    const items = await pool.query('SELECT * FROM bill_items WHERE bill_id = $1 ORDER BY id', [id]);
    
    // Fetch shop settings to include on detail view
    const shopRes = await pool.query('SELECT * FROM shop_settings ORDER BY id ASC LIMIT 1');
    const shop = shopRes.rows[0] || {
      shop_name: process.env.SHOP_NAME || 'Darshan Electronics & Retail',
      address: process.env.SHOP_ADDRESS || '',
      state: process.env.SHOP_STATE || 'Gujarat',
      gstin: process.env.SHOP_GSTIN || '',
      phone: process.env.SHOP_PHONE || '',
      email: process.env.SHOP_EMAIL || ''
    };

    res.json({ ...bill.rows[0], items: items.rows, shop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
};

// POST /api/bills
// body: { partyId, items: [{ itemId?, name, hsnCode, rate, qty, gstPercent }], discount, status, notes }
exports.createBill = async (req, res) => {
  const client = await pool.connect();
  try {
    const { partyId, items, discount = 0, status = 'Unpaid', notes = '' } = req.body;
    if (!partyId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'partyId and at least one item are required' });
    }

    // Fetch Shop Settings dynamically
    const shopRes = await client.query('SELECT * FROM shop_settings ORDER BY id ASC LIMIT 1');
    const shop = shopRes.rows[0] || {
      state: process.env.SHOP_STATE || 'Gujarat',
      invoice_prefix: 'INV-'
    };
    const shopState = shop.state || 'Gujarat';
    const invoicePrefix = shop.invoice_prefix || 'INV-';

    const partyRes = await client.query('SELECT * FROM parties WHERE id = $1', [partyId]);
    if (partyRes.rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    const party = partyRes.rows[0];

    const sameState = party.state.trim().toLowerCase() === shopState.trim().toLowerCase();
    const taxType = sameState ? 'CGST_SGST' : 'IGST';

    const computedLines = items.map((it) => {
      const rate = Number(it.rate);
      const qty = Number(it.qty);
      const gstPercent = Number(it.gstPercent);
      const calc = calculateLine(rate, qty, gstPercent, sameState);
      return { ...it, rate, qty, gstPercent, ...calc };
    });

    const { subtotal, totalTax, grandTotal } = calculateBillTotals(computedLines, Number(discount));

    await client.query('BEGIN');

    const invoiceNo = await generateInvoiceNumber(client, invoicePrefix);

    const billResult = await client.query(
      `INSERT INTO bills
        (invoice_no, invoice_date, party_id, party_name, party_mobile, party_address, party_state, party_gstin,
         shop_state, tax_type, subtotal, total_tax, discount, grand_total, status, notes)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [invoiceNo, party.id, party.name, party.mobile, party.address, party.state, party.gstin,
       shopState, taxType, subtotal, totalTax, Number(discount), grandTotal, status, notes]
    );
    const bill = billResult.rows[0];

    for (const line of computedLines) {
      await client.query(
        `INSERT INTO bill_items
          (bill_id, item_id, name, hsn_code, qty, rate, gst_percent, taxable_amt, cgst, sgst, igst, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [bill.id, line.itemId || null, line.name, line.hsnCode || null, line.qty, line.rate,
         line.gstPercent, line.taxableAmt, line.cgst, line.sgst, line.igst, line.lineTotal]
      );
    }

    await client.query('COMMIT');

    const savedItems = await pool.query('SELECT * FROM bill_items WHERE bill_id = $1', [bill.id]);
    res.status(201).json({ ...bill, items: savedItems.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create bill' });
  } finally {
    client.release();
  }
};

// GET /api/bills/:id/pdf
exports.downloadBillPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await pool.query('SELECT * FROM bills WHERE id = $1', [id]);
    if (bill.rows.length === 0) return res.status(404).json({ error: 'Bill not found' });
    const items = await pool.query('SELECT * FROM bill_items WHERE bill_id = $1 ORDER BY id', [id]);
    
    // Fetch Shop Details for PDF
    const shopRes = await pool.query('SELECT * FROM shop_settings ORDER BY id ASC LIMIT 1');
    const shop = shopRes.rows[0] || {
      shop_name: process.env.SHOP_NAME || 'Darshan Electronics & Retail',
      address: process.env.SHOP_ADDRESS || '',
      state: process.env.SHOP_STATE || 'Gujarat',
      gstin: process.env.SHOP_GSTIN || '',
      phone: process.env.SHOP_PHONE || '',
      email: process.env.SHOP_EMAIL || ''
    };

    generateInvoicePdf(res, bill.rows[0], items.rows, shop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

// POST /api/bills/:id/send-email
exports.sendBillEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const billRes = await pool.query('SELECT * FROM bills WHERE id = $1', [id]);
    if (billRes.rows.length === 0) return res.status(404).json({ error: 'Bill not found' });
    const bill = billRes.rows[0];

    const itemsRes = await pool.query('SELECT * FROM bill_items WHERE bill_id = $1 ORDER BY id', [id]);
    const items = itemsRes.rows;

    const partyRes = await pool.query('SELECT * FROM parties WHERE id = $1', [bill.party_id]);
    const party = partyRes.rows[0] || {};

    const shopRes = await pool.query('SELECT * FROM shop_settings ORDER BY id ASC LIMIT 1');
    const shop = shopRes.rows[0] || {};

    const recipientEmail = email || party.email || 'rmbinsuranceservice776@gmail.com';

    const chunks = [];
    const doc = generateInvoicePdf(null, bill, items, shop);
    doc.on('data', (chunk) => chunks.push(chunk));
    
    doc.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        await sendInvoiceEmail(recipientEmail, bill, pdfBuffer, shop.shop_name);
        res.json({ message: `Invoice #${bill.invoice_no} successfully sent to ${recipientEmail}!` });
      } catch (sendErr) {
        console.error('Email send error:', sendErr);
        res.status(500).json({ error: `Failed to send email to ${recipientEmail}. Check SMTP settings.` });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process email request' });
  }
};

// PATCH /api/bills/:id/status
exports.updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Paid', 'Unpaid', 'Partial'].includes(status)) {
      return res.status(400).json({ error: 'status must be Paid, Unpaid or Partial' });
    }
    const result = await pool.query(
      'UPDATE bills SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bill not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update bill status' });
  }
};
