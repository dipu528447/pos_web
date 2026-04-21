const express = require("express");
const router = express.Router();

const {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
} = require("./controller");

const { verifyToken } = require("../../middleware/authMiddleware");

router.post("/", verifyToken, createCustomer);
router.get("/", verifyToken, getCustomers);
router.put("/:id", verifyToken, updateCustomer);
router.delete("/:id", verifyToken, deleteCustomer);

module.exports = router;