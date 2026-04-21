const db = require("../../config/db");

// CREATE WASTAGE

const createWastage = async (req, res) => {
  const { items, note } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const reference_no = "WST-" + Date.now();

    const [result] = await conn.query(
      `INSERT INTO wastage (reference_no, note, total_items)
       VALUES (?, ?, ?)`,
      [reference_no, note, items.length]
    );

    const wastageId = result.insertId;

    for (let item of items) {
      const { product_id, quantity, reason } = item;

      const [[product]] = await conn.query(
        `SELECT stock FROM products WHERE id=?`,
        [product_id]
      );

      if (!product || product.stock < quantity) {
        throw new Error(`Insufficient stock for product ${product_id}`);
      }

      await conn.query(
        `INSERT INTO wastage_items
        (wastage_id, product_id, quantity, reason)
        VALUES (?, ?, ?, ?)`,
        [wastageId, product_id, quantity, reason]
      );

      // 🔥 STOCK DOWN
      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id=?`,
        [quantity, product_id]
      );
    }

    await conn.commit();
    res.json({ message: "Wastage created" });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};



// UPDATE
const updateWastage = async (req, res) => {
  const { id } = req.params;
  const { items, note } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 🔁 restore previous stock
    const [oldItems] = await conn.query(
      `SELECT * FROM wastage_items WHERE wastage_id=?`,
      [id]
    );

    for (let item of oldItems) {
      await conn.query(
        `UPDATE products SET stock = stock + ? WHERE id=?`,
        [item.quantity, item.product_id]
      );
    }

    await conn.query(`DELETE FROM wastage_items WHERE wastage_id=?`, [id]);

    // 🔥 insert new
    for (let item of items) {
      const { product_id, quantity, reason } = item;

      const [[product]] = await conn.query(
        `SELECT stock FROM products WHERE id=?`,
        [product_id]
      );

      if (!product || product.stock < quantity) {
        throw new Error(`Insufficient stock for product ${product_id}`);
      }

      await conn.query(
        `INSERT INTO wastage_items
        (wastage_id, product_id, quantity, reason)
        VALUES (?, ?, ?, ?)`,
        [id, product_id, quantity, reason]
      );

      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id=?`,
        [quantity, product_id]
      );
    }

    await conn.query(
      `UPDATE wastage SET note=?, total_items=? WHERE id=?`,
      [note, items.length, id]
    );

    await conn.commit();

    res.json({ message: "Wastage updated" });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};


// GET ALL
const getWastages = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM wastage ORDER BY id DESC
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET SINGLE
const getWastageById = async (req, res) => {
  const { id } = req.params;

  try {
    const [wastage] = await db.query(
      `SELECT * FROM wastage WHERE id=?`,
      [id]
    );

    const [items] = await db.query(
      `SELECT wi.*, p.name
       FROM wastage_items wi
       LEFT JOIN products p ON wi.product_id = p.id
       WHERE wi.wastage_id=?`,
      [id]
    );

    res.json({
      wastage: wastage[0],
      items,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createWastage,
  getWastages,
  getWastageById,
  updateWastage,
};