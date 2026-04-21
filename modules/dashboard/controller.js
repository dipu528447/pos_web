const db = require("../../config/db");

const getDashboard = async (req, res) => {
  try {
    // ============================
    // TOTAL SALES
    // ============================
    const [[sales]] = await db.query(`
      SELECT SUM(total_amount) AS totalSales FROM sales
    `);

    // TOTAL PURCHASE
    const [[purchase]] = await db.query(`
      SELECT SUM(total) AS totalPurchase FROM purchases
    `);

    // TOTAL COST (for profit)
    const [[cost]] = await db.query(`
      SELECT SUM(si.quantity * p.purchase_price) AS totalCost
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
    `);

    const totalSales = Number(sales.totalSales || 0);
    const totalPurchase = Number(purchase.totalPurchase || 0);
    const totalCost = Number(cost.totalCost || 0);

    const profit = totalSales - totalCost;

    // ============================
    // LOW STOCK
    // ============================
    const [lowStock] = await db.query(`
      SELECT id, name, stock, min_stock
      FROM products
      WHERE stock <= min_stock
      ORDER BY stock ASC
      LIMIT 10
    `);

    // ============================
    // RECENT SALES
    // ============================
    const [recentSales] = await db.query(`
      SELECT id, invoice_no, total_amount, created_at
      FROM sales
      ORDER BY id DESC
      LIMIT 5
    `);

    // ============================
    // CHART DATA (LAST 7 DAYS)
    // ============================
    const [chartData] = await db.query(`
      SELECT 
        DATE(s.created_at) as date,
        SUM(si.quantity * si.price) AS sales,
        SUM((si.price - p.purchase_price) * si.quantity) AS profit
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      WHERE s.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(s.created_at)
      ORDER BY date ASC
    `);

    // ============================
    // SINGLE RESPONSE ✅
    // ============================
    res.json({
      totalSales,
      totalPurchase,
      profit,
      lowStock,
      recentSales,
      chartData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDashboard
};