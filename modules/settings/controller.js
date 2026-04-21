const db = require("../../../config/db");

// ==============================
// GET ALL PERMISSIONS
// ==============================
const getPermissions = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM permissions");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// CREATE ROLE WITH PERMISSIONS
// ==============================
const createRole = async (req, res) => {
  const { name, permissions } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [role] = await conn.query(
      "INSERT INTO roles (name) VALUES (?)",
      [name]
    );

    const roleId = role.insertId;

    for (let p of permissions) {
      await conn.query(
        `INSERT INTO role_permissions 
        (role_id, permission_id, can_view, can_create, can_edit, can_delete)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          roleId,
          p.permission_id,
          p.can_view,
          p.can_create,
          p.can_edit,
          p.can_delete,
        ]
      );
    }

    await conn.commit();
    res.json({ message: "Role created successfully" });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// ==============================
// GET ROLES WITH PERMISSIONS
// ==============================
const getRoles = async (req, res) => {
  try {
    const [roles] = await db.query("SELECT * FROM roles");

    for (let role of roles) {
      const [perms] = await db.query(`
        SELECT p.name, rp.*
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
      `, [role.id]);

      role.permissions = perms;
    }

    res.json(roles);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// CREATE USER
// ==============================
const createUser = async (req, res) => {
  const { name, email, password, role_id } = req.body;

  try {
    await db.query(
      `INSERT INTO users (name, email, password, role_id)
       VALUES (?, ?, ?, ?)`,
      [name, email, password, role_id]
    );

    res.json({ message: "User created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// GET USERS
// ==============================
const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.*, r.name AS role
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPermissions,
  createRole,
  getRoles,
  createUser,
  getUsers,
};