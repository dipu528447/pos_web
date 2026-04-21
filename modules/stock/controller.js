const db = require("../../config/db");

const getStockReport = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        name,
        sku,
        stock,
        min_stock,
        CASE 
          WHEN stock <= min_stock THEN 'LOW'
          ELSE 'OK'
        END as status
      FROM products
      ORDER BY stock ASC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports={
    getStockReport
}