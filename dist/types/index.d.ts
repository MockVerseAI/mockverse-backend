import { Request } from "express";
import { Document, Types } from "mongoose";
export interface AuthRequest extends Request {
    user?: {
        _id: string;
        email: string;
        username: string;
        role?: string;
    };
}
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
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
    generateTemporaryToken(): {
        unHashedToken: string;
        hashedToken: string;
        tokenExpiry: number;
    };
}
export interface ApiResponseType<T = any> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}
export interface InterviewDocument extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId | UserDocument;
    title: string;
    topic: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApplicationDocument extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId | UserDocument;
    title: string;
    company: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ResumeDocument extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId | UserDocument;
    title: string;
    fileUrl: string;
    createdAt: Date;
    updatedAt: Date;
}
