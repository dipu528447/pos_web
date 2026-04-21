const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("POS API Running...");
});
const authRoutes = require("./modules/auth/routes");
const dashboardRoutes = require("./modules/dashboard/routes");
const salesRoutes = require("./modules/sales/routes");
const inventoryRoutes = require("./modules/inventory/routes");
const purchaseRoutes = require("./modules/purchase/routes");
const categoryRoutes = require("./modules/category/routes");
const customerRoutes = require("./modules/customer/routes")
const supplierRoutes = require("./modules/supplier/routes");
const productRoutes = require("./modules/product/routes");
const salesReturnRoutes = require("./modules/salesReturn/routes");
const stockRoutes = require("./modules/stock/routes");
const purchaseReportRoutes = require("./modules/report/purchase/routes");
const salesReportRoutes = require("./modules/report/sales/routes");
const profitReportRoutes = require("./modules/report/profit/routes");
const wastageRoutes = require("./modules/wastage/routes");
const productWiseReport = require("./modules/report/ProductWise/routes");
const warehouseRoutes = require("./modules/warehouse/routes");
const transferRoutes = require("./modules/warehouseTransfer/routes");
const warehouseReportRoutes = require("./modules/report/warehouse/routes");



app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/product", productRoutes);
app.use("/api/sales-returns", salesReturnRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/report/purchase", purchaseReportRoutes);
app.use("/api/report/sales", salesReportRoutes);
app.use("/api/report/profit", profitReportRoutes);
app.use("/api/wastage",wastageRoutes);
app.use("/api/report/productWiseReport",productWiseReport);
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/report/warehouse", warehouseReportRoutes);
module.exports = app;
