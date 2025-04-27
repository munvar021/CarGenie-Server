import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { cloudinary } from "../config/cloudinary.js";
import { sendEmail } from "../utils/email.js";
import { getOTPEmailTemplate } from "../utils/emailTemplates.js";
import crypto from "crypto";

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bio, username } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (username !== undefined) updateData.fullName = username;

    if (req.file) {
      try {
        if (user.profileImage && user.profileImage.includes("cloudinary")) {
          const urlParts = user.profileImage.split("/");
          const fileNameWithExtension = urlParts[urlParts.length - 1];
          const publicId = `cargenie/${fileNameWithExtension.split(".")[0]}`;

          await cloudinary.uploader.destroy(publicId);
          console.log(
            `Previous profile image ${publicId} deleted from Cloudinary`
          );
        }

        updateData.profileImage = req.file.path;
      } catch (cloudinaryError) {
        console.error(
          "Error deleting previous image from Cloudinary:",
          cloudinaryError
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      select: "-password -otp -otpExpires",
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        gender: updatedUser.gender,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "-password -otp -otpExpires"
    );

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
        bio: user.bio || "",
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to get profile" });
  }
};

export const initiatePasswordChange = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: "No email address found for your account",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const emailContent = getOTPEmailTemplate(otp, "password change");

    await sendEmail(user.email, "Password Change Verification", emailContent);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email for verification",
      otpSentTime: Date.now(),
    });
  } catch (error) {
    console.error("Password Change Initiation Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate password change" });
  }
};

export const verifyAndChangePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otp, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res
        .status(401)
        .json({ success: false, message: "OTP has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password Change Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to change password" });
  }
};

export const initiateAccountDeletion = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: "No email address found for your account",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Password is incorrect" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const emailContent = getOTPEmailTemplate(otp, "account deletion");

    await sendEmail(user.email, "Account Deletion Verification", emailContent);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email for verification",
      otpSentTime: Date.now(),
    });
  } catch (error) {
    console.error("Account Deletion Initiation Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate account deletion" });
  }
};

export const verifyAndDeleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res
        .status(401)
        .json({ success: false, message: "OTP has expired" });
    }

    if (user.profileImage && user.profileImage.includes("cloudinary")) {
      try {
        const urlParts = user.profileImage.split("/");
        const fileNameWithExtension = urlParts[urlParts.length - 1];
        const publicId = `cargenie/${fileNameWithExtension.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error(
          "Error deleting profile image from Cloudinary:",
          cloudinaryError
        );
      }
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account Deletion Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete account" });
  }
};

export const resendAuthenticatedOTP = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { actionType } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: "No email address found for your account",
      });
    }

    if (
      user.otpExpires &&
      new Date(user.otpExpires) > new Date(Date.now() - 60000)
    ) {
      const timeRemaining = Math.ceil((user.otpExpires - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeRemaining} seconds before requesting a new OTP`,
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const subject =
      actionType === "passwordChange"
        ? "Password Change Verification"
        : "Account Deletion Verification";

    const templateType =
      actionType === "passwordChange" ? "password change" : "account deletion";

    const emailContent = getOTPEmailTemplate(otp, templateType);

    await sendEmail(user.email, subject, emailContent);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otpSentTime: Date.now(),
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to resend OTP" });
  }
};

export const initiateEmailChange = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "New email address is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.email && user.email.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "New email must be different from your current email",
      });
    }

    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already associated with another account",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.tempEmail = email;
    await user.save();

    const emailContent = getOTPEmailTemplate(otp, "email change");

    await sendEmail(email, "Email Change Verification", emailContent);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your new email address",
      otpSentTime: Date.now(),
    });
  } catch (error) {
    console.error("Email Change Initiation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate email change",
    });
  }
};

export const verifyEmailChange = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.tempEmail) {
      return res.status(400).json({
        success: false,
        message: "No email change request pending",
      });
    }

    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    const oldEmail = user.email;

    user.email = user.tempEmail;
    user.tempEmail = null;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    try {
      await sendEmail(
        user.email,
        "Email Change Successful",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Email Change Successful</h2>
          <p>Your email has been successfully updated to ${user.email}.</p>
          <p>If you did not request this change, please contact our support team immediately.</p>
        </div>
        `
      );

      if (oldEmail) {
        await sendEmail(
          oldEmail,
          "Your CarGenie Email Has Been Changed",
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Email Change Notification</h2>
            <p>Your email address has been changed to ${user.email}.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
          </div>
          `
        );
      }
    } catch (emailError) {
      console.error("Error sending confirmation emails:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Email successfully updated",
      email: user.email,
    });
  } catch (error) {
    console.error("Email Change Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify and update email",
    });
  }
};

export const resendEmailOTP = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.tempEmail) {
      return res.status(400).json({
        success: false,
        message: "No email change request pending",
      });
    }

    if (
      user.otpExpires &&
      new Date(user.otpExpires) > new Date(Date.now() - 60000)
    ) {
      const timeRemaining = Math.ceil(
        (new Date(user.otpExpires) - Date.now() + 60000) / 1000
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeRemaining} seconds before requesting a new code`,
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const emailContent = getOTPEmailTemplate(otp, "email change");

    await sendEmail(user.tempEmail, "Email Change Verification", emailContent);

    return res.status(200).json({
      success: true,
      message: "New verification code sent",
      otpSentTime: Date.now(),
    });
  } catch (error) {
    console.error("Resend Email OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification code",
    });
  }
};
