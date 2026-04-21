const db = require("../../../config/db");

// ============================
// WAREHOUSE STOCK REPORT
// ============================
const warehouseStockReport = async (req, res) => {
  const { warehouse_id } = req.query;

  try {
    let query = `
      SELECT 
        p.id,
        p.name,
        w.name AS warehouse,
        ps.quantity
      FROM product_stock ps
      JOIN products p ON ps.product_id = p.id
      JOIN warehouses w ON ps.warehouse_id = w.id
    `;

    let params = [];

    if (warehouse_id) {
      query += " WHERE ps.warehouse_id = ?";
      params.push(warehouse_id);
    }

    query += " ORDER BY p.name ASC";

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ============================
// TRANSFER HISTORY (DETAIL)
// ============================
const transferHistory = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.id,
        t.created_at,
        w1.name AS from_warehouse,
        w2.name AS to_warehouse,
        p.name AS product,
        ti.quantity
      FROM warehouse_transfers t
      JOIN warehouse_transfer_items ti ON t.id = ti.transfer_id
      JOIN products p ON ti.product_id = p.id
      JOIN warehouses w1 ON t.from_warehouse_id = w1.id
      JOIN warehouses w2 ON t.to_warehouse_id = w2.id
      ORDER BY t.id DESC
    `);

    res.json(rows); // ✅ MUST be array
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  warehouseStockReport,transferHistory
};