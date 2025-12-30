const jwt = require("jsonwebtoken");
const db = require("../../config/config");
const User = db.user;
const Department = db.department;
const accessSecretKey = process.env.ACCESS_SECRET_KEY;

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, accessSecretKey);

    // 🔐 TOKEN MUST HAVE id & type
    if (!decoded.id || !decoded.type) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // 🔥 NORMALIZE req.user (THIS FIXES EVERYTHING)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.type, // ✅ convert `type` → `userType`
    };

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
