const db = require("../../../config/db");


const productSalesReport = async (req, res) => {
  const { from, to } = req.query;

  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.name,
        SUM(si.quantity) AS total_qty,
        SUM(si.subtotal) AS total_sales
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE DATE(s.created_at) BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY total_sales DESC
    `, [from, to]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const productProfitReport = async (req, res) => {
  const { from, to } = req.query;

  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.name,

        SUM(si.quantity) AS sold_qty,
        SUM(si.subtotal) AS total_sales,

        COALESCE(SUM(pi.subtotal), 0) AS total_purchase,

        (SUM(si.subtotal) - COALESCE(SUM(pi.subtotal), 0)) AS profit

      FROM products p

      LEFT JOIN sale_items si ON si.product_id = p.id
      LEFT JOIN sales s ON si.sale_id = s.id 
        AND DATE(s.created_at) BETWEEN ? AND ?

      LEFT JOIN purchase_items pi ON pi.product_id = p.id
      LEFT JOIN purchases pu ON pi.purchase_id = pu.id 
        AND DATE(pu.created_at) BETWEEN ? AND ?

      GROUP BY p.id
      ORDER BY profit DESC
    `, [from, to, from, to]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const productPurchaseReport = async (req, res) => {
  const { from, to } = req.query;

  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.name,
        SUM(pi.quantity) AS total_qty,
        SUM(pi.subtotal) AS total_purchase
      FROM purchase_items pi
      JOIN products p ON pi.product_id = p.id
      JOIN purchases pu ON pi.purchase_id = pu.id
      WHERE DATE(pu.created_at) BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY total_purchase DESC
    `, [from, to]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  productSalesReport,productProfitReport,productPurchaseReport
};