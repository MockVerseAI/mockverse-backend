import { Request } from "express";
import { Document, Types } from "mongoose";

// Extend Express Request
export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    username: string;
    role?: string;
  };
}

// User related types
export interface UserDocument extends Document {
  _id: Types.ObjectId;
  avatar: string;
  username: string;
  email: string;
  password: string;
  loginType: string;
  isEmailVerified: boolean;
  refreshToken?: string;
  forgotPasswordToken?: string;
  forgotPasswordExpiry?: Date;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateTemporaryToken(): {
    unHashedToken: string;
    hashedToken: string;
    tokenExpiry: number;
  };
}

// API Response types
export interface ApiResponseType<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// Interview related types
export interface InterviewDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | UserDocument;
  title: string;
  topic: string;
  createdAt: Date;
  updatedAt: Date;
}

// Application related types
export interface ApplicationDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | UserDocument;
  title: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
}

// Resume related types
export interface ResumeDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | UserDocument;
  title: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
