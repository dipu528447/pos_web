const express = require("express");
const router = express.Router();

const {
  createSalesReturn,
  getSalesReturns,
  getSalesReturnById,
  deleteSalesReturn,
  getSaleByInvoice,
  getReturnedQty
} = require("./controller");

const { verifyToken } = require("../../middleware/authMiddleware");

// ==========================
// SALES RETURN ROUTES
// ==========================

// 🔍 Get sale by invoice (for return UI)
router.get("/invoice/:invoice", verifyToken, getSaleByInvoice);

// ➕ Create return
router.post("/", verifyToken, createSalesReturn);

// 📄 Get all returns
router.get("/", verifyToken, getSalesReturns);

router.get("/returned/:sale_id/:product_id", verifyToken, getReturnedQty);
// 📄 Get single return
router.get("/:id", verifyToken, getSalesReturnById);


// ❌ Delete return
router.delete("/:id", verifyToken, deleteSalesReturn);

module.exports = router;