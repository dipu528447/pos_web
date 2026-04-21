const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("./controller");

const { verifyToken } = require("../../middleware/authMiddleware");

// =========================
// PRODUCT ROUTES
// =========================

// Create product
router.post("/create", verifyToken, createProduct);

// Get all products
router.get("/", verifyToken, getProducts);

// Get single product
router.get("/:id", verifyToken, getProductById);

// Update product
router.put("/:id", verifyToken, updateProduct);

// Delete product
router.delete("/:id", verifyToken, deleteProduct);

module.exports = router;