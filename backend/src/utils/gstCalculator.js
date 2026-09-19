function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Compute tax breakup for a single bill line item.
 * @param {number} rate - Unit Price
 * @param {number} qty - Quantity
 * @param {number} gstPercent - Applicable GST % (0, 5, 12, 18, 28)
 * @param {boolean} sameState - True if Party State === Shop State
 */
function calculateLine(rate, qty, gstPercent, sameState) {
  const taxableAmt = round2(rate * qty);
  let cgst = 0, sgst = 0, igst = 0;

  if (sameState) {
    cgst = round2((taxableAmt * (gstPercent / 2)) / 100);
    sgst = round2((taxableAmt * (gstPercent / 2)) / 100);
  } else {
    igst = round2((taxableAmt * gstPercent) / 100);
  }

  const taxApplied = round2(cgst + sgst + igst);
  const lineTotal = round2(taxableAmt + taxApplied);

  return { taxableAmt, cgst, sgst, igst, taxApplied, lineTotal };
}

/**
 * Compute subtotal, total tax, and grand total for a bill.
 */
function calculateBillTotals(lines, discount = 0) {
  const subtotal = round2(lines.reduce((s, l) => s + l.taxableAmt, 0));
  const totalTax = round2(lines.reduce((s, l) => s + l.cgst + l.sgst + l.igst, 0));
  const grandTotal = round2(Math.max(0, subtotal + totalTax - Number(discount)));
  return { subtotal, totalTax, grandTotal };
}

module.exports = { round2, calculateLine, calculateBillTotals };
