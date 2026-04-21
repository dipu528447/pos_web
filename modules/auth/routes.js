const express = require("express");
const router = express.Router();
const authController = require("./controller");


router.post("/register", authController.register);
// router.post("/login", authController.login);
router.post("/login", (req, res) => {
  res.json({ message: "Login working" });
});
module.exports = router;