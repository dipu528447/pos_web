const express = require("express");
const router = express.Router();

const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  deletePurchase
} = require("./controller");

const { verifyToken } = require("../../middleware/authMiddleware");

// ✅ ROUTES
router.post("/create", verifyToken, createPurchase);
router.get("/", verifyToken, getPurchases);
router.get("/:id", verifyToken, getPurchaseById);
router.delete("/:id", verifyToken, deletePurchase);

module.exports = router;