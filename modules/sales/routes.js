const express = require("express");
const router = express.Router();

const {
  createSale,
  getSales,
  getSaleById,
  deleteSale,
  collectDue
} = require("./controller");

const { verifyToken } = require("../../middleware/authMiddleware");

// =========================
// SALES ROUTES
// =========================

// Create sale (POS checkout)
router.post("/create", verifyToken, createSale);

// Get all sales (invoice list)
router.get("/", verifyToken, getSales);

// Get single sale (invoice details)
router.get("/:id", verifyToken, getSaleById);

// Delete sale (optional)
router.delete("/:id", verifyToken, deleteSale);

router.post("/collect-due/:saleId", verifyToken, collectDue);
module.exports = router;