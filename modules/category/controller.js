const db = require("../../config/db");

// CREATE CATEGORY
const createCategory = async (req, res) => {
  const { name } = req.body;

  try {
    await db.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );

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

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM categories WHERE id=?", [id]);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await db.query(
      "UPDATE categories SET name=? WHERE id=?",
      [name, id]
    );

    res.json({ message: "Category updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory
};