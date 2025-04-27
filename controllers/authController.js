import User from "../models/userModel.js";
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

    const existingUser = await User.findOne({
      email: normalizedEmail,
      isVerified: true,
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const recentOTP = await User.findOne({
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
    await User.findOneAndUpdate(
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
      "CarGenie - Verify Your Account",
      getOTPEmailTemplate(otp, "registration")
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: "5 minutes",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp, userData } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const updatedUser = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        fullName: userData.name,
        mobile: userData.mobile,
        gender: userData.gender,
        password: hashedPassword,
        otp: null,
        otpExpires: null,
        isVerified: true,
      },
      { new: true }
    );

    const token = jwt.sign(
      { userId: updatedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      token,
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        gender: updatedUser.gender,
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

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Account not verified" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.otpExpires && user.otpExpires > Date.now()) {
      return res.status(200).json({
        success: true,
        message: "OTP already sent and valid",
        email: user.email,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 300000;
    await user.save();

    await sendEmail(
      normalizedEmail,
      "CarGenie - Login Verification",
      getOTPEmailTemplate(otp, "login")
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      email: user.email,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const normalizedEmail = email?.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: { $gt: Date.now() },
      isVerified: true,
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
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
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.lastOtpRequest && Date.now() - user.lastOtpRequest < 30000) {
      return res.status(429).json({
        success: false,
        message: "Please wait 30 seconds before requesting another OTP",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 300000;
    user.lastOtpRequest = Date.now();
    await user.save();

    await sendEmail(
      normalizedEmail,
      `CarGenie - ${user.isVerified ? "Login" : "Registration"} Verification`,
      getOTPEmailTemplate(otp, user.isVerified ? "login" : "registration")
    );

    res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
      email: user.email,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to resend OTP" });
  }
};

export const validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, isVerified: true });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("Token Validation Error:", error);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
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

    const user = await User.findOne({
      email: normalizedEmail,
      isVerified: true,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const recentOTP = await User.findOne({
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
    user.otp = otp;
    user.otpExpires = Date.now() + 300000;
    await user.save();

    await sendEmail(
      normalizedEmail,
      "CarGenie - Reset Your Password",
      getOTPEmailTemplate(otp, "password-reset")
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
    const user = await User.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: { $gt: Date.now() },
      isVerified: true,
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      email: user.email,
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

    const user = await User.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: { $gt: Date.now() },
      isVerified: true,
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

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
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};
