const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../../middleware/authMiddleware");
const { getPurchaseReport,productPurchaseReport } = require("./controller");

// GET PURCHASE REPORT
router.get("/", verifyToken, getPurchaseReport);


module.exports = router;