const express = require("express");
const router = express.Router();

const {
  productSalesReport,
  productPurchaseReport,
  productProfitReport,
} = require("./controller");

// ✅ ADD THESE ROUTES
router.get("/product-sales", productSalesReport);
router.get("/product-purchase", productPurchaseReport);
router.get("/product-profit", productProfitReport);

module.exports = router;
