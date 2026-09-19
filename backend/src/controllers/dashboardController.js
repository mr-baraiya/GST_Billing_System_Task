const { pool } = require('../config/db');

// GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totals = await pool.query(
      `SELECT
        COALESCE(SUM(grand_total),0) AS total_sales,
        COALESCE(SUM(total_tax),0) AS total_tax,
        COUNT(*) AS total_bills
       FROM bills`
    );

    const today = await pool.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(grand_total),0) AS amount
       FROM bills WHERE invoice_date = CURRENT_DATE`
    );

    const thisMonth = await pool.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(grand_total),0) AS amount
       FROM bills
       WHERE date_trunc('month', invoice_date) = date_trunc('month', CURRENT_DATE)`
    );

    const monthlyTrend = await pool.query(
      `SELECT
        TO_CHAR(date_trunc('month', invoice_date), 'Mon YYYY') AS month_label,
        COALESCE(SUM(grand_total), 0) AS sales,
        COALESCE(SUM(total_tax), 0) AS tax
       FROM bills
       GROUP BY date_trunc('month', invoice_date)
       ORDER BY date_trunc('month', invoice_date) ASC
       LIMIT 6`
    );

    const statusBreakdown = await pool.query(
      `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(grand_total),0) AS amount
       FROM bills
       GROUP BY status`
    );

    const topItems = await pool.query(
      `SELECT name, COALESCE(SUM(line_total), 0) AS total_revenue, COALESCE(SUM(qty), 0)::int AS total_qty
       FROM bill_items
       GROUP BY name
       ORDER BY total_revenue DESC
       LIMIT 5`
    );

    const recentBills = await pool.query(
      `SELECT id, invoice_no, invoice_date, party_name, grand_total, status
       FROM bills
       ORDER BY id DESC
       LIMIT 5`
    );

    res.json({
      totalSales: Number(totals.rows[0].total_sales),
      totalTax: Number(totals.rows[0].total_tax),
      totalBills: Number(totals.rows[0].total_bills),
      today: {
        count: Number(today.rows[0].count),
        amount: Number(today.rows[0].amount),
      },
      thisMonth: {
        count: Number(thisMonth.rows[0].count),
        amount: Number(thisMonth.rows[0].amount),
      },
      monthlyTrend: monthlyTrend.rows.map(r => ({
        month: r.month_label,
        sales: Number(r.sales),
        tax: Number(r.tax)
      })),
      statusBreakdown: statusBreakdown.rows.map(r => ({
        status: r.status,
        count: Number(r.count),
        amount: Number(r.amount)
      })),
      topItems: topItems.rows.map(r => ({
        name: r.name,
        revenue: Number(r.total_revenue),
        qty: Number(r.total_qty)
      })),
      recentBills: recentBills.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
