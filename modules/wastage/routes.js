const express = require("express");
const router = express.Router();

const {
  createWastage,
  getWastages,
  getWastageById,
  updateWastage,
} = require("./controller");

const { verifyToken } = require("../../middleware/authMiddleware");

router.post("/", verifyToken, createWastage);
router.get("/", verifyToken, getWastages);
router.get("/:id", verifyToken, getWastageById);
router.put("/:id", verifyToken, updateWastage);

module.exports = router;