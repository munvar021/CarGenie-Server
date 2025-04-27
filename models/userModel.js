import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  mobile: String,
  gender: String,
  password: String,
  bio: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: true },
  tempEmail: String,
});

export default mongoose.model("User", userSchema);
