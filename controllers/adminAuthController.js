import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";
import { getOTPEmailTemplate } from "../utils/emailTemplates.js";

export const initiateRegistration = async (req, res) => {
  const { email } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();
    if (!normalizedEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
      isVerified: true,
    });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const recentOTP = await Admin.findOne({
      email: normalizedEmail,
      otpExpires: { $gt: Date.now() - 60000 },
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: "Please wait 1 minute before requesting another OTP",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Admin.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otp,
        otpExpires: Date.now() + 300000,
        isVerified: false,
      },
      { upsert: true }
    );

    await sendEmail(
      normalizedEmail,
      "CarGenie - Verify Admin Account",
      getOTPEmailTemplate(otp, "admin-registration")
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: "5 minutes",
    });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp, adminData } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();
    const admin = await Admin.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const updatedAdmin = await Admin.findOneAndUpdate(
      { email: normalizedEmail },
      {
        fullName: adminData.name,
        mobile: adminData.mobile,
        gender: adminData.gender,
        password: hashedPassword,
        otp: null,
        otpExpires: null,
        isVerified: true,
      },
      { new: true }
    );

    const token = jwt.sign(
      { userId: updatedAdmin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      admin: {
        id: updatedAdmin._id,
        fullName: updatedAdmin.fullName,
        email: updatedAdmin.email,
        mobile: updatedAdmin.mobile,
        gender: updatedAdmin.gender,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();
    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin privileges required",
      });
    }

    if (!admin.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Account not verified" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (admin.otpExpires && admin.otpExpires > Date.now()) {
      return res.status(200).json({
        success: true,
        message: "OTP already sent and valid",
        email: admin.email,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpires = Date.now() + 300000;
    await admin.save();

    await sendEmail(
      normalizedEmail,
      "CarGenie - Admin Login Verification",
      getOTPEmailTemplate(otp, "admin-login")
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      email: admin.email,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// export const verifyLoginOtp = async (req, res) => {
//   const { email, otp } = req.body;
//   try {
//     const normalizedEmail = email?.toLowerCase().trim();
//     const admin = await Admin.findOne({
//       email: normalizedEmail,
//       otp,
//       otpExpires: { $gt: Date.now() },
//       isVerified: true,
//     });

//     if (!admin) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid or expired OTP" });
//     }

//     admin.otp = null;
//     admin.otpExpires = null;
//     await admin.save();

//     const token = jwt.sign(
//       { userId: admin._id, role: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     res.cookie("adminToken", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 24 * 60 * 60 * 1000,
//       sameSite: "strict",
//     });

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       admin: {
//         id: admin._id,
//         fullName: admin.fullName,
//         email: admin.email,
//         mobile: admin.mobile,
//         gender: admin.gender,
//       },
//     });
//   } catch (error) {
//     console.error("Login OTP Verification Error:", error);
//     res.status(500).json({ success: false, message: "Verification failed" });
//   }
// };

// Change in verifyLoginOtp function in adminAuthController.js

export const verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();
    const admin = await Admin.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: { $gt: Date.now() },
      isVerified: true,
    });

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    const token = jwt.sign(
      { userId: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set both httpOnly cookie and include token in response
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    // IMPORTANT: Also include the token in the response body
    // This allows the frontend to save it as a backup
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token, // Include token in response
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        mobile: admin.mobile,
        gender: admin.gender,
      },
    });
  } catch (error) {
    console.error("Login OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    if (admin.lastOtpRequest && Date.now() - admin.lastOtpRequest < 30000) {
      return res.status(429).json({
        success: false,
        message: "Please wait 30 seconds before requesting another OTP",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpires = Date.now() + 300000;
    admin.lastOtpRequest = Date.now();
    await admin.save();

    await sendEmail(
      normalizedEmail,
      `CarGenie - Admin ${
        admin.isVerified ? "Login" : "Registration"
      } Verification`,
      getOTPEmailTemplate(
        otp,
        admin.isVerified ? "admin-login" : "admin-registration"
      )
    );

    res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
      email: admin.email,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to resend OTP" });
  }
};

export const validateToken = async (req, res) => {
  // The middleware has already verified the admin, so we can just return success
  try {
    res.status(200).json({
      success: true,
      admin: {
        id: req.admin.id,
        fullName: req.admin.fullName,
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (error) {
    console.error("Token Validation Error:", error);
    res.status(500).json({
      success: false,
      message: "Error validating token",
    });
  }
};

export const initiateForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();
    if (!normalizedEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const admin = await Admin.findOne({
      email: normalizedEmail,
      isVerified: true,
    });

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Use lastOtpRequest for cooldown check
    if (admin.lastOtpRequest && Date.now() - admin.lastOtpRequest < 30000) {
      return res.status(429).json({
        success: false,
        message: "Please wait 30 seconds before requesting another OTP",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpires = Date.now() + 300000;
    admin.lastOtpRequest = Date.now(); // Ensure this is updated
    await admin.save();

    await sendEmail(
      normalizedEmail,
      "CarGenie - Reset Admin Password",
      getOTPEmailTemplate(otp, "admin-password-reset")
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: "5 minutes",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Password reset failed" });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();
    const admin = await Admin.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: { $gt: Date.now() },
      isVerified: true,
    });

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      email: admin.email,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const admin = await Admin.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: { $gt: Date.now() },
      isVerified: true,
    });

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Password Reset Error:", error);
    res.status(500).json({ success: false, message: "Password reset failed" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("adminToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};
