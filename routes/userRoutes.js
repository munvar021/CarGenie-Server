import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";
import {
  updateUserProfile,
  getUserProfile,
  initiatePasswordChange,
  verifyAndChangePassword,
  initiateAccountDeletion,
  verifyAndDeleteAccount,
  resendAuthenticatedOTP,
  initiateEmailChange,
  verifyEmailChange,
  resendEmailOTP,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authenticateToken, getUserProfile);
router.put(
  "/profile",
  authenticateToken,
  upload.single("profileImage"),
  updateUserProfile
);
router.post("/password/initiate", authenticateToken, initiatePasswordChange);
router.post("/password/verify", authenticateToken, verifyAndChangePassword);
router.post(
  "/account/delete/initiate",
  authenticateToken,
  initiateAccountDeletion
);
router.post(
  "/account/delete/verify",
  authenticateToken,
  verifyAndDeleteAccount
);
router.post("/otp/resend", authenticateToken, resendAuthenticatedOTP);
router.post("/email/update", authenticateToken, initiateEmailChange);
router.post("/email/verify", authenticateToken, verifyEmailChange);
router.post("/email/resend-otp", authenticateToken, resendEmailOTP);

export default router;
