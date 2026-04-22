const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ❌ No header
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // ✅ Extract token correctly
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message); // 👈 add this for debug
    return res.status(401).json({ message: "Invalid token" });
  }
};