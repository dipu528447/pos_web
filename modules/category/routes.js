const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory
} = require("./controller");

const { verifyToken } = require("../../middleware/authMiddleware");

router.post("/", verifyToken, createCategory);
router.get("/", verifyToken, getCategories);
router.delete("/:id", verifyToken, deleteCategory);
router.put("/:id", verifyToken, updateCategory);
module.exports = router;