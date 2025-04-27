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
} from "../controllers/adminAuthController.js";
import { verifyAdminToken } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/register/initiate", initiateRegistration);
router.post("/register/verify", verifyOtp);
router.post("/login", login);
router.post("/login/verify", verifyLoginOtp);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", initiateForgotPassword);
router.post("/forgot-password/verify", verifyForgotPasswordOtp);
router.post("/reset-password", resetPassword);
router.get("/validate", verifyAdminToken, validateToken);
router.post("/logout", verifyAdminToken, logout);

export default router;
