const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../../middleware/authMiddleware");
const { getProfitReport } = require("./controller");

router.get("/", verifyToken, getProfitReport);

module.exports = router;