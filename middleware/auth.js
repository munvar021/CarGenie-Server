import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
