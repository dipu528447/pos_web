const express = require("express");
const router = express.Router();

const {
  getPermissions,
  createRole,
  getRoles,
  createUser,
  getUsers,
} = require("./controller");

// Permissions
router.get("/permissions", getPermissions);

// Roles
router.get("/roles", getRoles);
router.post("/roles", createRole);

// Users
router.get("/users", getUsers);
router.post("/users", createUser);

module.exports = router;