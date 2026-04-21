const db = require("../../config/db");

// =========================
// CREATE SALE (WITH STOCK CHECK + DUE SYSTEM)
// =========================
const createSale = async (req, res) => {
  const {
    customer_id,
    items,
    subtotal,
    discount,
    tax,
    total,
    paid_amount = 0, // ✅ NEW
    payment_method,
    notes
  } = req.body;

  const user_id = req.user?.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const invoice_no = "INV-" + Date.now();

    // =========================
    // 💰 PAYMENT LOGIC
    // =========================
    const due_amount = total - paid_amount;

    let payment_status = "DUE";
    if (paid_amount == total) payment_status = "PAID";
    else if (paid_amount > 0) payment_status = "PARTIAL";

    // =========================
    // 1. INSERT SALE
    // =========================
    const [saleResult] = await conn.query(
      `INSERT INTO sales 
      (invoice_no, customer_id, user_id, total_amount, discount, tax, paid_amount, due_amount, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_no,
        customer_id || null,
        user_id,
        total,
        discount,
        tax,
        paid_amount,
        due_amount,
        payment_method,
        payment_status
      ]
    );

    const saleId = saleResult.insertId;

    // =========================
    // 2. PROCESS ITEMS
    // =========================
    for (let item of items) {
      const { id, qty, price } = item;

      const [productRows] = await conn.query(
        `SELECT stock FROM products WHERE id = ?`,
        [id]
      );

      if (!productRows.length) {
        throw new Error(`Product not found (ID: ${id})`);
      }

      const availableStock = productRows[0].stock;

      if (availableStock <= 0) {
        throw new Error(`Product out of stock (ID: ${id})`);
      }

      if (qty > availableStock) {
        throw new Error(
          `Insufficient stock for product ID ${id}. Available: ${availableStock}, Requested: ${qty}`
        );
      }

      // Insert item
      await conn.query(
        `INSERT INTO sale_items 
        (sale_id, product_id, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [saleId, id, qty, price, qty * price]
      );

      // Update stock
      await conn.query(
        `UPDATE products 
         SET stock = stock - ?
         WHERE id = ?`,
        [qty, id]
      );

      // Stock movement
      await conn.query(
        `INSERT INTO stock_movements 
        (product_id, type, quantity, reference_type, reference_id)
        VALUES (?, 'OUT', ?, 'SALE', ?)`,
        [id, qty, saleId]
      );
    }

    // =========================
    // 💾 SAVE PAYMENT HISTORY
    // =========================
    if (paid_amount > 0) {
      await conn.query(
        `INSERT INTO sale_payments 
        (sale_id, amount, payment_method)
        VALUES (?, ?, ?)`,
        [saleId, paid_amount, payment_method || "Cash"]
      );
    }

    await conn.commit();

    res.json({
      message: "Sale completed successfully",
      saleId,
      invoice_no
    });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// =========================
// 💰 COLLECT DUE
// =========================
const collectDue = async (req, res) => {
  const { saleId } = req.params; // ✅ FIX HERE
  const { amount, payment_method } = req.body;

  try {
    const [[sale]] = await db.query(
      `SELECT total_amount, paid_amount FROM sales WHERE id = ?`,
      [saleId]
    );

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const newPaid = Number(sale.paid_amount) + Number(amount);
    const newDue = sale.total_amount - newPaid;

    let status = "PARTIAL";
    if (newDue <= 0) status = "PAID";

    await db.query(
      `UPDATE sales 
       SET paid_amount = ?, due_amount = ?, payment_status = ?
       WHERE id = ?`,
      [newPaid, newDue, status, saleId]
    );

    await db.query(
      `INSERT INTO sale_payments (sale_id, amount, payment_method)
       VALUES (?, ?, ?)`,
      [saleId, amount, payment_method]
    );

    res.json({ message: "Due collected successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// =========================
// GET ALL SALES
// =========================
const getSales = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        s.*, 
        c.name AS customer_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       ORDER BY s.id DESC`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET SINGLE SALE
// =========================
const getSaleById = async (req, res) => {
  const { id } = req.params;

  try {
    const [sale] = await db.query(
      `SELECT * FROM sales WHERE id = ?`,
      [id]
    );

    const [items] = await db.query(
      `SELECT si.*, p.name 
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = ?`,
      [id]
    );

    const [payments] = await db.query(
      `SELECT * FROM sale_payments WHERE sale_id = ?`,
      [id]
    );

    res.json({
      sale: sale[0],
      items,
      payments // ✅ NEW
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// DELETE SALE (RESTORE STOCK)
// =========================
const deleteSale = async (req, res) => {
  const { id } = req.params;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      `SELECT * FROM sale_items WHERE sale_id = ?`,
      [id]
    );

    for (let item of items) {
      await conn.query(
        `UPDATE products 
         SET stock = stock + ? 
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await conn.query(`DELETE FROM sale_items WHERE sale_id = ?`, [id]);
    await conn.query(`DELETE FROM sale_payments WHERE sale_id = ?`, [id]); // ✅ NEW
    await conn.query(`DELETE FROM sales WHERE id = ?`, [id]);

    await conn.commit();

    res.json({ message: "Sale deleted successfully" });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

module.exports = {
  createSale,
  collectDue, // ✅ NEW
  getSales,
  getSaleById,
  deleteSale
};