const db = require("../../../config/db");

// ============================
// PURCHASE REPORT
// ============================
const getPurchaseReport = async (req, res) => {
  try {
    const { from, to, supplier_id } = req.query;

    let query = `
      SELECT 
        p.id,
        p.invoice_no,
        p.created_at,
        p.total,
        p.discount,
        p.extra_cost,
        s.name AS supplier_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;

    const params = [];

    // DATE FILTER
    if (from && to) {
      query += ` AND DATE(p.created_at) BETWEEN ? AND ? `;
      params.push(from, to);
    }

    // SUPPLIER FILTER
    if (supplier_id) {
      query += ` AND p.supplier_id = ? `;
      params.push(supplier_id);
    }

    query += ` ORDER BY p.id DESC`;

    const [rows] = await db.query(query, params);

    // GRAND TOTAL CALCULATION
    const totalAmount = rows.reduce((sum, r) => sum + Number(r.total || 0), 0);

    res.json({
      data: rows,
      totalPurchase: totalAmount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  getPurchaseReport
};