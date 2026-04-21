const db = require("../../config/db");

// CREATE
const createCustomer = async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    await db.query(
      "INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)",
      [name, phone, address]
    );

    res.json({ message: "Customer added" });
  } catch (err) {
    console.error(err); // 👈 ADD THIS
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
const getCustomers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;

  try {
    await db.query(
      "UPDATE customers SET name=?, phone=?, address=? WHERE id=?",
      [name, phone, address, id]
    );

    res.json({ message: "Customer updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM customers WHERE id=?", [id]);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
};