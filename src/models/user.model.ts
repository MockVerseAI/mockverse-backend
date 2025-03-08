import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import mongoose, { Schema, Model } from "mongoose";
import {
  AvailableSocialLogins,
  USER_TEMPORARY_TOKEN_EXPIRY,
  UserLoginType,
} from "../utils/constants.js";
import { UserDocument } from "../types/index.js";

// User schema definition
const userSchema = new Schema<UserDocument>(
  {
    avatar: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    loginType: {
      type: String,
      enum: AvailableSocialLogins,
      default: UserLoginType.EMAIL_PASSWORD,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check if password is correct
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function (): string {
  const payload = {
    _id: this._id,
    email: this.email,
    username: this.username,
    role: this.role,
  };

  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || "fallback-secret";
  const expiry = process.env.ACCESS_TOKEN_EXPIRY || "1h";

  return jwt.sign(payload, accessTokenSecret, {
    expiresIn: expiry as jwt.SignOptions["expiresIn"],
  });
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
  const payload = {
    _id: this._id,
  };

  const refreshTokenSecret =
    process.env.REFRESH_TOKEN_SECRET || "fallback-refresh-secret";
  const expiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";

  return jwt.sign(payload, refreshTokenSecret, {
    expiresIn: expiry as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Method responsible for generating tokens for email verification, password reset etc.
 */
userSchema.methods.generateTemporaryToken = function (): {
  unHashedToken: string;
  hashedToken: string;
  tokenExpiry: number;
} {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // This should stay in the DB to compare at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  userSchema
);
