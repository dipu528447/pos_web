const express = require("express");
const router = express.Router();

const {
  warehouseStockReport,transferHistory
} = require("./controller");

router.get("/stock", warehouseStockReport);
router.get("/history", transferHistory);
module.exports = router;