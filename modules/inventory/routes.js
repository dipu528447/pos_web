const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories,
  createProduct,
  getProducts,
  adjustStock,
  lowStock
} = require("./controller");

const { verifyToken } = require("../../middleware/authMiddleware");

// CATEGORY
router.post("/category", verifyToken, createCategory);
router.get("/category", verifyToken, getCategories);

// PRODUCT
router.post("/product", verifyToken, createProduct);
router.get("/product", verifyToken, getProducts);

// STOCK
router.post("/adjust", verifyToken, adjustStock);

// LOW STOCK
router.get("/low-stock", verifyToken, lowStock);

module.exports = router;