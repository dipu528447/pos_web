const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier
} = require("./controller");

const { verifyToken } = require("../../middleware/authMiddleware");

router.post("/", verifyToken, createSupplier);
router.get("/", verifyToken, getSuppliers);
router.put("/:id", verifyToken, updateSupplier);
router.delete("/:id", verifyToken, deleteSupplier);

module.exports = router;