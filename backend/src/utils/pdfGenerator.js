const PDFDocument = require('pdfkit');

/**
 * Converts a numeric amount to Indian Currency Words.
 */
function numberToWordsINR(amount) {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(num) {
    if ((num = num.toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || (b[n[1][0]] + ' ' + a[n[1][1]])) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || (b[n[2][0]] + ' ' + a[n[2][1]])) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || (b[n[3][0]] + ' ' + a[n[3][1]])) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || (b[n[4][0]] + ' ' + a[n[4][1]])) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || (b[n[5][0]] + ' ' + a[n[5][1]])) : '';
    return str.trim();
  }

  const parts = Number(amount).toFixed(2).split('.');
  const rupees = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);

  let result = '';
  if (rupees === 0) {
    result = 'Zero Rupees';
  } else {
    result = inWords(rupees) + ' Rupees';
  }

  if (paise > 0) {
    result += ' and ' + inWords(paise) + ' Paise';
  }

  return result + ' Only';
}

/**
 * Streams a professional GST invoice PDF.
 */
function generateInvoicePdf(res, bill, items, shop = {}) {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  if (res && res.setHeader) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bill.invoice_no}.pdf`);
    doc.pipe(res);
  }

  const shopName = shop.shop_name || process.env.SHOP_NAME || 'Darshan Electronics & Retail';
  const shopAddress = shop.address || process.env.SHOP_ADDRESS || 'Rajkot, Gujarat';
  const shopState = shop.state || process.env.SHOP_STATE || 'Gujarat';
  const shopGstin = shop.gstin || process.env.SHOP_GSTIN || '24AAACD1234E1Z5';
  const shopPhone = shop.phone || process.env.SHOP_PHONE || '+91 98765 43210';
  const shopEmail = shop.email || process.env.SHOP_EMAIL || '';

  const isIgst = bill.tax_type === 'IGST';

  // 1. Header Banner Box (Navy Blue #0f172a)
  doc.rect(30, 30, 535, 58).fill('#0f172a');
  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text(shopName, 42, 38);
  doc.fontSize(8.5).font('Helvetica').text(`${shopAddress} | State: ${shopState}`, 42, 58);
  doc.text(`GSTIN: ${shopGstin} | Phone: ${shopPhone} ${shopEmail ? '| ' + shopEmail : ''}`, 42, 70);

  // TAX INVOICE Badge right aligned
  doc.rect(435, 42, 115, 22).fill('#2563eb');
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('TAX INVOICE', 435, 48, { align: 'center', width: 115 });

  // 2. Info Cards (Two Columns - Left: Invoice Info, Right: Customer Bill To)
  const metaY = 96;
  const cardWidth = 260;
  const cardHeight = 65;

  // Invoice Details Box (Left)
  doc.rect(30, metaY, cardWidth, cardHeight).stroke('#cbd5e1');
  doc.rect(30, metaY, cardWidth, 16).fill('#f1f5f9');
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text('INVOICE DETAILS', 38, metaY + 4);

  doc.fillColor('#000000').fontSize(8.5);
  doc.font('Helvetica-Bold').text('Invoice No:', 38, metaY + 22);
  doc.font('Helvetica').text(bill.invoice_no, 98, metaY + 22);

  doc.font('Helvetica-Bold').text('Date:', 38, metaY + 35);
  doc.font('Helvetica').text(new Date(bill.invoice_date).toLocaleDateString('en-IN'), 98, metaY + 35);

  doc.font('Helvetica-Bold').text('Supply Type:', 38, metaY + 48);
  doc.font('Helvetica').text(isIgst ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)', 98, metaY + 48);

  // Customer Billed To Box (Right)
  const rightX = 305;
  doc.rect(rightX, metaY, cardWidth, cardHeight).stroke('#cbd5e1');
  doc.rect(rightX, metaY, cardWidth, 16).fill('#f1f5f9');
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text('BILLED TO (CUSTOMER)', rightX + 8, metaY + 4);

  doc.fillColor('#000000').fontSize(8.5);
  doc.font('Helvetica-Bold').text('Name:', rightX + 8, metaY + 22);
  doc.font('Helvetica').text(bill.party_name, rightX + 50, metaY + 22, { width: 200, height: 12 });

  doc.font('Helvetica-Bold').text('Mobile:', rightX + 8, metaY + 35);
  doc.font('Helvetica').text(bill.party_mobile || 'N/A', rightX + 50, metaY + 35);

  doc.font('Helvetica-Bold').text('State:', rightX + 8, metaY + 48);
  doc.font('Helvetica').text(`${bill.party_state} ${bill.party_gstin ? '| GSTIN: ' + bill.party_gstin : ''}`, rightX + 50, metaY + 48);

  // 3. Itemized Table
  let tableY = 170;
  const tableWidth = 535;

  // Column X Coordinates & Widths (Total Width = 535)
  const col = {
    sn: { x: 30, w: 22, align: 'center' },
    name: { x: 52, w: 145, align: 'left' },
    hsn: { x: 197, w: 50, align: 'center' },
    qty: { x: 247, w: 35, align: 'center' },
    rate: { x: 282, w: 55, align: 'right' },
    taxable: { x: 337, w: 65, align: 'right' },
    gst: { x: 402, w: 38, align: 'center' },
    tax: { x: 440, w: 58, align: 'right' },
    total: { x: 498, w: 67, align: 'right' }
  };

  // Table Header Row
  doc.rect(30, tableY, tableWidth, 18).fill('#1e293b');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');

  doc.text('#', col.sn.x, tableY + 5, { width: col.sn.w, align: col.sn.align });
  doc.text('Item Description', col.name.x, tableY + 5, { width: col.name.w, align: col.name.align });
  doc.text('HSN', col.hsn.x, tableY + 5, { width: col.hsn.w, align: col.hsn.align });
  doc.text('Qty', col.qty.x, tableY + 5, { width: col.qty.w, align: col.qty.align });
  doc.text('Rate', col.rate.x, tableY + 5, { width: col.rate.w, align: col.rate.align });
  doc.text('Taxable', col.taxable.x, tableY + 5, { width: col.taxable.w, align: col.taxable.align });
  doc.text('GST%', col.gst.x, tableY + 5, { width: col.gst.w, align: col.gst.align });
  doc.text(isIgst ? 'IGST' : 'CGST+SGST', col.tax.x, tableY + 5, { width: col.tax.w, align: col.tax.align });
  doc.text('Total (Rs)', col.total.x, tableY + 5, { width: col.total.w, align: col.total.align });

  tableY += 18;
  doc.fillColor('#000000').font('Helvetica').fontSize(8);

  items.forEach((it, idx) => {
    const taxAmt = isIgst ? Number(it.igst) : (Number(it.cgst) + Number(it.sgst));
    const rowBg = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
    
    doc.rect(30, tableY, tableWidth, 18).fill(rowBg);
    doc.fillColor('#000000');

    doc.text(String(idx + 1), col.sn.x, tableY + 5, { width: col.sn.w, align: col.sn.align });
    doc.text(it.name, col.name.x, tableY + 5, { width: col.name.w, align: col.name.align, lineBreak: false });
    doc.text(it.hsn_code || '-', col.hsn.x, tableY + 5, { width: col.hsn.w, align: col.hsn.align });
    doc.text(String(it.qty), col.qty.x, tableY + 5, { width: col.qty.w, align: col.qty.align });
    doc.text(Number(it.rate).toFixed(2), col.rate.x, tableY + 5, { width: col.rate.w, align: col.rate.align });
    doc.text(Number(it.taxable_amt).toFixed(2), col.taxable.x, tableY + 5, { width: col.taxable.w, align: col.taxable.align });
    doc.text(`${it.gst_percent}%`, col.gst.x, tableY + 5, { width: col.gst.w, align: col.gst.align });
    doc.text(taxAmt.toFixed(2), col.tax.x, tableY + 5, { width: col.tax.w, align: col.tax.align });
    doc.text(Number(it.line_total).toFixed(2), col.total.x, tableY + 5, { width: col.total.w, align: col.total.align });

    tableY += 18;
    doc.moveTo(30, tableY).lineTo(565, tableY).stroke('#e2e8f0');
  });

  tableY += 12;

  // 4. Lower Section (Left: Words, Status & Terms; Right: Totals Summary)
  const lowerY = tableY;

  // Right Side - Grand Totals Summary Box
  const sumX = 350;
  const sumW = 215;
  doc.rect(sumX, lowerY, sumW, 75).stroke('#cbd5e1');
  doc.rect(sumX, lowerY, sumW, 16).fill('#f1f5f9');
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text('SUMMARY TOTALS', sumX + 8, lowerY + 4);

  doc.fillColor('#000000').fontSize(8.5).font('Helvetica');
  doc.text('Subtotal (Taxable):', sumX + 8, lowerY + 22);
  doc.text(`Rs. ${Number(bill.subtotal).toFixed(2)}`, sumX + 100, lowerY + 22, { align: 'right', width: 105 });

  if (Number(bill.discount) > 0) {
    doc.text('Discount:', sumX + 8, lowerY + 34);
    doc.text(`- Rs. ${Number(bill.discount).toFixed(2)}`, sumX + 100, lowerY + 34, { align: 'right', width: 105 });
  }

  doc.text('Total Tax:', sumX + 8, lowerY + 46);
  doc.text(`Rs. ${Number(bill.total_tax).toFixed(2)}`, sumX + 100, lowerY + 46, { align: 'right', width: 105 });

  doc.rect(sumX, lowerY + 58, sumW, 17).fill('#0f172a');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
  doc.text('Grand Total:', sumX + 8, lowerY + 62);
  doc.text(`Rs. ${Number(bill.grand_total).toFixed(2)}`, sumX + 100, lowerY + 62, { align: 'right', width: 105 });

  // Left Side - Amount in Words, Payment Status, Terms
  doc.fillColor('#000000').fontSize(8.5);
  doc.font('Helvetica-Bold').text('Amount in Words:', 30, lowerY + 4);
  doc.font('Helvetica-Oblique').text(numberToWordsINR(bill.grand_total), 30, lowerY + 16, { width: 305 });

  doc.font('Helvetica-Bold').text('Payment Status:', 30, lowerY + 36);
  doc.font('Helvetica').text(bill.status || 'Unpaid', 105, lowerY + 36);

  doc.font('Helvetica-Bold').text('Terms & Conditions:', 30, lowerY + 52);
  doc.font('Helvetica-Oblique').fontSize(7.5);
  doc.text('1. Goods once sold will not be taken back.', 30, lowerY + 63);
  doc.text('2. Subject to local jurisdiction.', 30, lowerY + 73);

  // 5. Signatory Section
  const footerY = lowerY + 95;
  doc.fontSize(8.5).font('Helvetica-Bold').text(`For ${shopName}`, 380, footerY, { align: 'center', width: 185 });
  doc.font('Helvetica-Oblique').fontSize(7.5).text('Authorized Signatory', 380, footerY + 28, { align: 'center', width: 185 });

  doc.end();
  return doc;
}

module.exports = { generateInvoicePdf, numberToWordsINR };
