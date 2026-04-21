const express = require("express");
const router = express.Router();

const {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
} = require("./controller");
const { verifyToken } = require("../../middleware/authMiddleware");

router.get("/", verifyToken,getTransfers);
router.get("/:id",verifyToken, getTransferById);
router.post("/",verifyToken, createTransfer);
router.put("/:id",verifyToken, updateTransfer);

module.exports = router;