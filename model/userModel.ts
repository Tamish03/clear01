import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  username: string;
  email: string;
  password?: string;
  isVerified: boolean;
  verifyCode: string;
  verifyCodeExpiry?: Date;
  settings: {
    blurNSFW: boolean;
    blurViolence: boolean;
    blurScam: boolean;
    blurHate: boolean;
  };
  whiteList: string[];
}

// Update your UserSchema in model/userModel.ts
const UserSchema: Schema<User> = new mongoose.Schema({
  username: { type: String, required: [true, "Username is required"], unique: true, trim: true },
  email: { type: String, required: [true, "Email is required"], unique: true, match: [/.+\@.+\..+/, "Please use a valid email address"] },
  password: { type: String, required: [true, "Password is required"] },
  verifyCode: { type: String, required: [true, "Verify Code is required"] },
  verifyCodeExpiry: { type: Date, required: [true, "Verify Code Expiry is required"] },
  isVerified: { type: Boolean, default: false },
  // ADD THIS SETTINGS OBJECT
  settings: {
    blurNSFW: { type: Boolean, default: true },
    blurViolence: { type: Boolean, default: true },
    blurScam: { type: Boolean, default: true },
    blurHate: { type: Boolean, default: true },
  },
  whiteList: { 
    type: [String], 
    default: [] 
  }
});

// This ensures we don't redefine the model if it already exists
const userModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default userModel;