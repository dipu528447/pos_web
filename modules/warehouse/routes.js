const express = require("express");
const router = express.Router();

const {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} = require("./controller");
const { verifyToken } = require("../../middleware/authMiddleware");

// ROUTES
router.get("/", verifyToken,getWarehouses);
router.get("/:id",verifyToken, getWarehouseById);
router.post("/", verifyToken,createWarehouse);
router.put("/:id", verifyToken,updateWarehouse);
router.delete("/:id",verifyToken, deleteWarehouse);

module.exports = router;