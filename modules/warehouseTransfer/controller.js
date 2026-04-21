const db = require("../../config/db");

// ============================
// GET ALL TRANSFERS
// ============================
const getTransfers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.*,
        w1.name AS from_warehouse,
        w2.name AS to_warehouse
      FROM warehouse_transfers t
      JOIN warehouses w1 ON t.from_warehouse_id = w1.id
      JOIN warehouses w2 ON t.to_warehouse_id = w2.id
      ORDER BY t.id DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================
// GET SINGLE TRANSFER
// ============================
const getTransferById = async (req, res) => {
  try {
    const { id } = req.params;

    const [transfer] = await db.query(
      `SELECT * FROM warehouse_transfers WHERE id=?`,
      [id]
    );

    const [items] = await db.query(
      `SELECT ti.*, p.name 
       FROM warehouse_transfer_items ti
       JOIN products p ON ti.product_id = p.id
       WHERE transfer_id=?`,
      [id]
    );

    res.json({
      ...transfer[0],
      items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================
// CREATE TRANSFER (WITH STOCK MOVEMENT)
// ============================
const createTransfer = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { from_warehouse_id, to_warehouse_id, items, note } = req.body;

    if (from_warehouse_id === to_warehouse_id) {
      throw new Error("Cannot transfer to same warehouse");
    }

    await conn.beginTransaction();

    // CREATE TRANSFER
    const [result] = await conn.query(
      `INSERT INTO warehouse_transfers 
       (from_warehouse_id, to_warehouse_id, note)
       VALUES (?, ?, ?)`,
      [from_warehouse_id, to_warehouse_id, note]
    );

    const transferId = result.insertId;

    for (let item of items) {
      // CHECK STOCK
      const [stock] = await conn.query(
        `SELECT quantity FROM product_stock 
         WHERE product_id=? AND warehouse_id=?`,
        [item.product_id, from_warehouse_id]
      );

      if (!stock.length || stock[0].quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }

      // DEDUCT FROM SOURCE
      await conn.query(
        `UPDATE product_stock 
         SET quantity = quantity - ?
         WHERE product_id=? AND warehouse_id=?`,
        [item.quantity, item.product_id, from_warehouse_id]
      );

      // ADD TO DESTINATION
      await conn.query(
        `INSERT INTO product_stock (product_id, warehouse_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
        [item.product_id, to_warehouse_id, item.quantity]
      );

      // SAVE ITEM
      await conn.query(
        `INSERT INTO warehouse_transfer_items 
         (transfer_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [transferId, item.product_id, item.quantity]
      );
    }

    await conn.commit();

    res.json({ message: "Transfer completed" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// ============================
// UPDATE TRANSFER (ADVANCED)
// ============================
// ⚠️ For now: simple version (no stock rollback)
const updateTransfer = async (req, res) => {
  res.json({ message: "Edit disabled for stock safety (recommended)" });
};

module.exports = {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
};