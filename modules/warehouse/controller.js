const db = require("../../config/db");

// ============================
// GET ALL WAREHOUSES
// ============================
const getWarehouses = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM warehouses ORDER BY id DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================
// GET SINGLE
// ============================
const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM warehouses WHERE id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================
// CREATE
// ============================
const createWarehouse = async (req, res) => {
  try {
    const { name, location, description } = req.body;

    await db.query(
      `INSERT INTO warehouses (name, location, description)
       VALUES (?, ?, ?)`,
      [name, location, description]
    );

    res.json({ message: "Warehouse created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================
// UPDATE
// ============================
const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, description } = req.body;

    await db.query(
      `UPDATE warehouses
       SET name=?, location=?, description=?
       WHERE id=?`,
      [name, location, description, id]
    );

    res.json({ message: "Warehouse updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================
// DELETE (optional)
// ============================
const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM warehouses WHERE id=?`, [id]);

    res.json({ message: "Warehouse deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
};