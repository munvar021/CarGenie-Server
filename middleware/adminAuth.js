import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

export const verifyAdminToken = async (req, res, next) => {
  try {
    let token = req.cookies?.adminToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied: No token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      });
    }

    if (!decoded?.userId || decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin privileges required",
      });
    }

    const admin = await Admin.findOne({
      _id: decoded.userId,
      isVerified: true,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    req.admin = {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: "admin",
    };

    next();
  } catch (error) {
    console.error("Admin token verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
