require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/db');
const { calculateLine, calculateBillTotals } = require('./src/utils/gstCalculator');
const { generateInvoicePdf } = require('./src/utils/pdfGenerator');

async function generateSampleDeliverables() {
  const client = await pool.connect();
  try {
    console.log('Generating sample data for deliverables...');

    const shopRes = await client.query('SELECT * FROM shop_settings ORDER BY id ASC LIMIT 1');
    const shop = shopRes.rows[0] || {
      shop_name: 'Darshan Electronics & Retail',
      address: '101 University Road, Rajkot, Gujarat - 360005',
      state: 'Gujarat',
      gstin: '24AAACD1234E1Z5',
      phone: '+91 98765 43210',
      email: 'contact@darshanelectronics.com'
    };

    const p1 = await client.query(
      `INSERT INTO parties (name, mobile, address, state, gstin, email)
       VALUES ('Patel Retail Pvt Ltd', '9825012345', '702 CG Road, Ahmedabad', 'Gujarat', '24AAACP1234F1Z1', 'patel@retail.com')
       RETURNING *`
    );
    const p2 = await client.query(
      `INSERT INTO parties (name, mobile, address, state, gstin, email)
       VALUES ('TechWave Solutions', '9819098765', '12 BKC Complex, Mumbai', 'Maharashtra', '27AABCT9876K1Z9', 'info@techwave.com')
       RETURNING *`
    );
    const p3 = await client.query(
      `INSERT INTO parties (name, mobile, address, state, gstin, email)
       VALUES ('Shreeram Traders', '9988776655', 'Station Road, Rajkot', 'Gujarat', NULL, 'shreeram@traders.in')
       RETURNING *`
    );

    const partyList = [p1.rows[0], p2.rows[0], p3.rows[0]];

    const billsToCreate = [
      {
        party: partyList[0],
        discount: 0,
        status: 'Paid',
        notes: 'Full payment received via NEFT Bank Transfer.',
        items: [
          { name: 'Smart LED TV 55 Inch', hsnCode: '8528', qty: 2, rate: 45000, gstPercent: 18 },
          { name: 'Wireless Surround Soundbar', hsnCode: '8518', qty: 2, rate: 8500, gstPercent: 18 }
        ]
      },
      {
        party: partyList[1],
        discount: 1000,
        status: 'Partial',
        notes: 'Interstate sale. 50% advance payment received.',
        items: [
          { name: 'Dell Latitude Enterprise Laptop', hsnCode: '8471', qty: 5, rate: 62000, gstPercent: 18 },
          { name: 'Ergonomic Office Desk Chair', hsnCode: '9401', qty: 5, rate: 7500, gstPercent: 18 },
          { name: 'USB-C Multiport Docking Hub', hsnCode: '8473', qty: 10, rate: 2200, gstPercent: 12 }
        ]
      },
      {
        party: partyList[2],
        discount: 500,
        status: 'Unpaid',
        notes: 'Credit period 15 days.',
        items: [
          { name: 'Heavy Duty Metal Ceiling Fan', hsnCode: '8414', qty: 10, rate: 2800, gstPercent: 12 },
          { name: 'Modular Switches Box Pack', hsnCode: '8536', qty: 25, rate: 450, gstPercent: 18 }
        ]
      }
    ];

    const outputDir = path.join(__dirname, '../sample_invoices');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const bData of billsToCreate) {
      const party = bData.party;
      const sameState = party.state.trim().toLowerCase() === shop.state.trim().toLowerCase();
      const taxType = sameState ? 'CGST_SGST' : 'IGST';

      const computedLines = bData.items.map((it) => {
        const calc = calculateLine(it.rate, it.qty, it.gstPercent, sameState);
        return { ...it, ...calc };
      });

      const { subtotal, totalTax, grandTotal } = calculateBillTotals(computedLines, bData.discount);

      await client.query('BEGIN');
      const seq = await client.query("SELECT nextval('invoice_seq') AS n");
      const invoiceNo = `INV-${String(seq.rows[0].n).padStart(4, '0')}`;

      const billRes = await client.query(
        `INSERT INTO bills
          (invoice_no, invoice_date, party_id, party_name, party_mobile, party_address, party_state, party_gstin,
           shop_state, tax_type, subtotal, total_tax, discount, grand_total, status, notes)
         VALUES ($1, CURRENT_DATE, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         RETURNING *`,
        [invoiceNo, party.id, party.name, party.mobile, party.address, party.state, party.gstin,
         shop.state, taxType, subtotal, totalTax, bData.discount, grandTotal, bData.status, bData.notes]
      );
      const bill = billRes.rows[0];

      const savedItems = [];
      for (const line of computedLines) {
        const itemRes = await client.query(
          `INSERT INTO bill_items
            (bill_id, name, hsn_code, qty, rate, gst_percent, taxable_amt, cgst, sgst, igst, line_total)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
          [bill.id, line.name, line.hsnCode, line.qty, line.rate, line.gstPercent, line.taxableAmt, line.cgst, line.sgst, line.igst, line.lineTotal]
        );
        savedItems.push(itemRes.rows[0]);
      }
      await client.query('COMMIT');

      // Generate PDF stream with finish promise
      const pdfFilePath = path.join(outputDir, `Sample_Invoice_${invoiceNo}.pdf`);
      const fileStream = fs.createWriteStream(pdfFilePath);
      const pdfDoc = generateInvoicePdf(null, bill, savedItems, shop);
      pdfDoc.pipe(fileStream);

      await new Promise((resolve) => fileStream.on('finish', resolve));
      console.log(`Generated Deliverable PDF: Sample_Invoice_${invoiceNo}.pdf`);
    }

    console.log('Sample invoice deliverables generated successfully.');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error generating sample deliverables:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

generateSampleDeliverables();
