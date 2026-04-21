const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middleware/authMiddleware");
const { getStockReport } = require("./controller");

router.get("/", verifyToken, getStockReport);

module.exports = router;