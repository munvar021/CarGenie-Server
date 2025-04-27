import express from "express";
import {
  initiateRegistration,
  verifyOtp,
  login,
  verifyLoginOtp,
  resendOTP,
  validateToken,
  initiateForgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  logout,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Registration routes
router.post("/initiate-registration", initiateRegistration);
router.post("/verify-otp", verifyOtp);

// Login routes
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOtp);

// Common routes
router.post("/resend-otp", resendOTP);
router.get("/validate-token", authenticateToken, validateToken);
router.post("/initiate-forgot-password", initiateForgotPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
router.post("/reset-password", resetPassword);
router.post("/logout", authenticateToken, logout);

export default router;
