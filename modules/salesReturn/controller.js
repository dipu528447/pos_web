const db = require("../../config/db");

// ==========================
// ✅ CREATE SALES RETURN
// ==========================
const createSalesReturn = async (req, res) => {
  const { sale_id, items, refund_amount } = req.body;

  if (!sale_id || !items || items.length === 0) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ GET ORIGINAL SALE
    const [saleRows] = await conn.query(`SELECT * FROM sales WHERE id = ?`, [
      sale_id,
    ]);

    if (!saleRows.length) {
      throw new Error("Sale not found");
    }

    const sale = saleRows[0];

    const returnInvoice = "RET-" + Date.now();

    // 2️⃣ CREATE RETURN ENTRY
    const [result] = await conn.query(
      `INSERT INTO sales_returns 
      (sale_id, invoice_no, customer_id, total, refund_amount)
      VALUES (?, ?, ?, ?, ?)`,
      [sale_id, returnInvoice, sale.customer_id, 0, refund_amount],
    );

    const returnId = result.insertId;

    let total = 0;

    // 3️⃣ PROCESS ITEMS
    for (let item of items) {
      const { product_id, qty, price } = item;

      // 🔍 CHECK ORIGINAL SOLD QTY
      const [soldItem] = await conn.query(
        `SELECT quantity FROM sale_items 
         WHERE sale_id = ? AND product_id = ?`,
        [sale_id, product_id],
      );

      if (!soldItem.length) {
        throw new Error(`Product not found in sale (ID: ${product_id})`);
      }

      const soldQty = soldItem[0].quantity;

      // 🔍 CHECK ALREADY RETURNED QTY
      const [returned] = await conn.query(
        `SELECT IFNULL(SUM(quantity), 0) as returned_qty
         FROM sales_return_items sri
         JOIN sales_returns sr ON sr.id = sri.sales_return_id
         WHERE sr.sale_id = ? AND sri.product_id = ?`,
        [sale_id, product_id],
      );

      const alreadyReturned = returned[0].returned_qty || 0;

      // 🚨 PREVENT OVER RETURN
      if (alreadyReturned > soldQty) {
        throw new Error(`Return exceeds sold qty for product ${product_id}`);
      }

      const subtotal = qty * price;
      total += subtotal;

      // INSERT RETURN ITEM
      await conn.query(
        `INSERT INTO sales_return_items 
        (sales_return_id, product_id, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [returnId, product_id, qty, price, subtotal],
      );

      // 🔥 UPDATE STOCK (ADD BACK)
      await conn.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [
        qty,
        product_id,
      ]);
    }

    // 4️⃣ UPDATE RETURN TOTAL
    await conn.query(`UPDATE sales_returns SET total = ? WHERE id = ?`, [
      total,
      returnId,
    ]);

    await conn.commit();

    res.json({
      message: "Sales return created successfully",
      return_id: returnId,
      invoice_no: returnInvoice,
    });
  } catch (err) {
    await conn.rollback();
    console.log("RETURN ERROR:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// ==========================
// 🔍 GET SALE BY INVOICE
// ==========================
const getSaleByInvoice = async (req, res) => {
  let { invoice } = req.params;

  try {
    invoice = invoice.trim().toUpperCase();

    // auto fix format
    if (!invoice.startsWith("INV-")) {
      invoice = "INV-" + invoice;
    }

    const [sale] = await db.query(`SELECT * FROM sales WHERE invoice_no = ?`, [
      invoice,
    ]);

    if (!sale.length) {
      return res.status(404).json({
        message: "Sale not found",
        searched: invoice,
      });
    }
    const [items] = await db.query(
      `SELECT 
      si.product_id,
      si.quantity,
      si.price,
      p.name,

      IFNULL((
        SELECT SUM(sri.quantity)
        FROM sales_return_items sri
        JOIN sales_returns sr ON sr.id = sri.sales_return_id
        WHERE sr.sale_id = si.sale_id 
        AND sri.product_id = si.product_id
      ), 0) AS already_returned

   FROM sale_items si
   LEFT JOIN products p ON si.product_id = p.id
   WHERE si.sale_id = ?`,
      [sale[0].id],
    );
    res.json({
      sale: sale[0],
      items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// 📄 GET ALL RETURNS
// ==========================
const getSalesReturns = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        sr.id,
        sr.invoice_no,
        sr.sale_id,
        s.invoice_no AS sale_invoice,
        sr.customer_id,
        sr.total,
        sr.refund_amount,
        sr.created_at
      FROM sales_returns sr
      LEFT JOIN sales s ON sr.sale_id = s.id
      ORDER BY sr.id DESC
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// 📄 GET SINGLE RETURN
// ==========================
const getSalesReturnById = async (req, res) => {
  const { id } = req.params;

  try {
    const [ret] = await db.query(`
      SELECT sr.*, s.invoice_no AS sale_invoice
      FROM sales_returns sr
      LEFT JOIN sales s ON sr.sale_id = s.id
      WHERE sr.id = ?
    `, [id]);

    const [items] = await db.query(
      `SELECT sri.*, p.name
       FROM sales_return_items sri
       LEFT JOIN products p ON sri.product_id = p.id
       WHERE sri.sales_return_id = ?`,
      [id]
    );

    res.json({
      return: ret[0],
      items,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getReturnedQty = async (req, res) => {
  const { sale_id, product_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT IFNULL(SUM(quantity),0) as returned_qty
       FROM sales_return_items sri
       JOIN sales_returns sr ON sr.id = sri.sales_return_id
       WHERE sr.sale_id = ? AND sri.product_id = ?`,
      [sale_id, product_id],
    );

    res.json({ returned_qty: rows[0].returned_qty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ==========================
// ❌ DELETE RETURN
// ==========================
const deleteSalesReturn = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM sales_returns WHERE id = ?`, [id]);
    res.json({ message: "Return deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSalesReturn,
  getSaleByInvoice,
  getSalesReturns,
  getSalesReturnById,
  deleteSalesReturn,
  getReturnedQty,
};
