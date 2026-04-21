const db = require("../../../config/db");

// ============================
// PROFIT REPORT
// ============================
const getProfitReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    let query = `
      SELECT 
        s.id,
        s.invoice_no,
        s.created_at,
        SUM(si.quantity * si.price) AS sales_total,
        SUM(si.quantity * p.purchase_price) AS cost_total,
        SUM((si.price - p.purchase_price) * si.quantity) AS profit
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      WHERE 1=1
    `;

    const params = [];

    // DATE FILTER
    if (from && to) {
      query += ` AND DATE(s.created_at) BETWEEN ? AND ? `;
      params.push(from, to);
    }

    query += `
      GROUP BY s.id
      ORDER BY s.id DESC
    `;

    const [rows] = await db.query(query, params);

    // GRAND TOTALS
    let totalSales = 0;
    let totalCost = 0;
    let totalProfit = 0;

    rows.forEach((r) => {
      totalSales += Number(r.sales_total || 0);
      totalCost += Number(r.cost_total || 0);
      totalProfit += Number(r.profit || 0);
    });

    res.json({
      data: rows,
      summary: {
        totalSales,
        totalCost,
        totalProfit
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProfitReport
};