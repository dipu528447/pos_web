const db = require("../../../config/db");

// ============================
// SALES REPORT
// ============================
const getSalesReport = async (req, res) => {
  try {
    const { from, to, customer_id } = req.query;

    let query = `
      SELECT 
        s.id,
        s.invoice_no,
        s.created_at,
        s.total_amount AS total,
        s.discount,
        s.tax,
        c.name AS customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE 1=1
    `;

    const params = [];

    // DATE FILTER
    if (from && to) {
      query += ` AND DATE(s.created_at) BETWEEN ? AND ? `;
      params.push(from, to);
    }

    // CUSTOMER FILTER
    if (customer_id) {
      query += ` AND s.customer_id = ? `;
      params.push(customer_id);
    }

    query += ` ORDER BY s.id DESC`;

    const [rows] = await db.query(query, params);

    // TOTAL CALCULATION
    const totalSales = rows.reduce(
      (sum, r) => sum + Number(r.total || 0),
      0
    );

    res.json({
      data: rows,
      totalSales
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSalesReport
};