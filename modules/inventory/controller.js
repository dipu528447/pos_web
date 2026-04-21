const db = require("../../config/db");


// ================= CATEGORY =================

// CREATE CATEGORY
const createCategory = async (req, res) => {
  const { name } = req.body;

  try {
    await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
    res.json({ message: "Category created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= PRODUCTS =================

// CREATE PRODUCT
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
    await db.query(
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
        stock || 0,
        min_stock || 0,
        expiry_date || null,
        batch_no || null
      ]
    );

    res.json({ message: "Product created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET PRODUCTS
const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= STOCK =================

// STOCK ADJUSTMENT
const adjustStock = async (req, res) => {
  const { product_id, quantity } = req.body;

  try {
    // update stock
    await db.query(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [quantity, product_id]
    );

    // movement log
    await db.query(
      `INSERT INTO stock_movements 
      (product_id, type, quantity, reference_type)
      VALUES (?, 'ADJUST', ?, 'MANUAL')`,
      [product_id, quantity]
    );

    res.json({ message: "Stock adjusted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// LOW STOCK
const lowStock = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE stock <= min_stock"
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  createCategory,
  getCategories,
  createProduct,
  getProducts,
  adjustStock,
  lowStock
};