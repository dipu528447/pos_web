const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../../middleware/authMiddleware");
const { getSalesReport } = require("./controller");

// GET SALES REPORT
router.get("/", verifyToken, getSalesReport);

module.exports = router;