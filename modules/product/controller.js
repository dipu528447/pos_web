const db = require("../../config/db");

// =========================
// CREATE PRODUCT
// =========================
const createProduct = async (req, res) => {
  const {
    name,
    sku,
    barcode,
    category_id,
    purchase_price,
    sale_price,
    stock,
    min_stock,
    expiry_date,
    batch_no
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO products 
      (name, sku, barcode, category_id, purchase_price, sale_price, stock, min_stock, expiry_date, batch_no)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        sku,
        barcode,
        category_id,
        purchase_price,
        sale_price,
        stock,
        min_stock,
        expiry_date,
        batch_no
      ]
    );

    res.json({
      message: "Product created successfully",
      productId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET ALL PRODUCTS
// =========================
const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET SINGLE PRODUCT
// =========================
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT * FROM products WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// UPDATE PRODUCT
// =========================
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    sku,
    barcode,
    category_id,
    purchase_price,
    sale_price,
    stock,
    min_stock,
    expiry_date,
    batch_no
  } = req.body;

  try {
    await db.query(
      `UPDATE products SET
        name = ?,
        sku = ?,
        barcode = ?,
        category_id = ?,
        purchase_price = ?,
        sale_price = ?,
        stock = ?,
        min_stock = ?,
        expiry_date = ?,
        batch_no = ?
      WHERE id = ?`,
      [
        name,
        sku,
        barcode,
        category_id,
        purchase_price,
        sale_price,
        stock,
        min_stock,
        expiry_date,
        batch_no,
        id
      ]
    );

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// DELETE PRODUCT
// =========================
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM products WHERE id = ?", [id]);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};