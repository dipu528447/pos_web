const db = require("../../config/db");

// CREATE
const createSupplier = async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    await db.query(
      "INSERT INTO suppliers (name, phone, address) VALUES (?, ?, ?)",
      [name, phone, address]
    );

    res.json({ message: "Supplier created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
const getSuppliers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM suppliers");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;

  try {
    await db.query(
      "UPDATE suppliers SET name=?, phone=?, address=? WHERE id=?",
      [name, phone, address, id]
    );

    res.json({ message: "Supplier updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM suppliers WHERE id=?", [id]);
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier
};