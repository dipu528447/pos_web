const db = require("../config/db");

exports.createSale = async (req, res) => {
  const {
    customer_id,
    items,
    total_amount,
    discount,
    tax,
    paid_amount,
    payment_method
  } = req.body;

  const user_id = req.user.id; // from auth middleware

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const invoice_no = "INV-" + Date.now();
    const due_amount = total_amount - discount + tax - paid_amount;

    // 1️⃣ INSERT SALE
    const [saleResult] = await connection.query(
      `INSERT INTO sales 
      (invoice_no, customer_id, user_id, total_amount, discount, tax, paid_amount, due_amount, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_no,
        customer_id || null,
        user_id,
        total_amount,
        discount,
        tax,
        paid_amount,
        due_amount,
        payment_method
      ]
    );

    const saleId = saleResult.insertId;

    // 2️⃣ INSERT ITEMS + STOCK UPDATE
    for (let item of items) {
      const subtotal = item.qty * item.sale_price;

      // sale_items
      await connection.query(
        `INSERT INTO sale_items 
        (sale_id, product_id, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [saleId, item.id, item.qty, item.sale_price, subtotal]
      );

      // reduce stock
      await connection.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.qty, item.id]
      );

      // stock movement
      await connection.query(
        `INSERT INTO stock_movements 
        (product_id, type, quantity, reference_type, reference_id)
        VALUES (?, 'OUT', ?, 'SALE', ?)`,
        [item.id, item.qty, saleId]
      );
    }

    // 3️⃣ PAYMENT ENTRY
    if (paid_amount > 0) {
      await connection.query(
        `INSERT INTO payments 
        (type, method, amount, reference_type, reference_id)
        VALUES ('IN', ?, ?, 'SALE', ?)`,
        [payment_method, paid_amount, saleId]
      );
    }

    await connection.commit();

    res.json({
      message: "✅ Sale Completed",
      invoice_no
    });

  } catch (err) {
    await connection.rollback();
    console.log(err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};