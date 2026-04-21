const db = require("../../config/db");

// ==========================
// CREATE PURCHASE
// ==========================
const createPurchase = async (req, res) => {
  const {
    supplier_id,
    warehouse_id, // ✅ NEW
    items,
    subtotal,
    discount,
    extra_cost,
    total,
    notes,
  } = req.body;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Insert into purchases table
    const [purchaseResult] = await conn.query(
      `INSERT INTO purchases 
  (supplier_id, warehouse_id, subtotal, discount, extra_cost, total, notes) 
  VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [supplier_id, warehouse_id, subtotal, discount, extra_cost, total, notes],
    );
    const purchaseId = purchaseResult.insertId;

    // 2️⃣ Insert purchase items + update stock
    for (let item of items) {
      const { id, qty, price } = item;

      // Insert purchase item
      await conn.query(
        `INSERT INTO purchase_items 
        (purchase_id, product_id, quantity, cost_price, subtotal) 
        VALUES (?, ?, ?, ?, ?)`,
        [purchaseId, id, qty, price, qty * price],
      );

      // Update product stock
      // Check if stock exists
      const [stock] = await conn.query(
        `SELECT * FROM product_stock 
   WHERE product_id=? AND warehouse_id=?`,
        [id, warehouse_id],
      );

      if (stock.length > 0) {
        // Update existing stock
        await conn.query(
          `UPDATE product_stock 
     SET quantity = quantity + ? 
     WHERE product_id=? AND warehouse_id=?`,
          [qty, id, warehouse_id],
        );
      } else {
        // Insert new stock row
        await conn.query(
          `INSERT INTO product_stock 
     (product_id, warehouse_id, quantity) 
     VALUES (?, ?, ?)`,
          [id, warehouse_id, qty],
        );
      }
      await conn.query(`UPDATE products SET stock = stock + ? WHERE id=?`, [
        qty,
        id,
      ]);
    }

    await conn.commit();

    res.json({
      message: "Purchase created successfully",
      purchase_id: purchaseId,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// ==========================
// GET ALL PURCHASES
// ==========================
const getPurchases = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, s.name as supplier_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.id DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// GET SINGLE PURCHASE DETAILS
// ==========================
const getPurchaseById = async (req, res) => {
  const { id } = req.params;

  try {
    // Purchase info
    const [purchase] = await db.query(`SELECT * FROM purchases WHERE id=?`, [
      id,
    ]);

    // Items
    const [items] = await db.query(
      `SELECT pi.*, pr.name 
       FROM purchase_items pi
       LEFT JOIN products pr ON pi.product_id = pr.id
       WHERE pi.purchase_id=?`,
      [id],
    );

    res.json({
      purchase: purchase[0],
      items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// DELETE PURCHASE (OPTIONAL)
// ==========================
const deletePurchase = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Get items (to reverse stock)
    const [items] = await conn.query(
      `SELECT * FROM purchase_items WHERE purchase_id=?`,
      [id],
    );

    // Reverse stock
    for (let item of items) {
      await conn.query(
        `UPDATE products 
         SET stock = stock - ? 
         WHERE id = ?`,
        [item.quantity, item.product_id],
      );
    }

    // Delete items
    await conn.query(`DELETE FROM purchase_items WHERE purchase_id=?`, [id]);

    // Delete purchase
    await conn.query(`DELETE FROM purchases WHERE id=?`, [id]);

    await conn.commit();

    res.json({ message: "Purchase deleted" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  deletePurchase,
};
