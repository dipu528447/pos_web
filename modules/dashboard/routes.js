const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middleware/authMiddleware");
const { getDashboard } = require("./controller");

router.get("/", verifyToken, getDashboard);

module.exports = router;