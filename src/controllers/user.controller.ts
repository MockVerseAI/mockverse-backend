import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserLoginType } from "../utils/constants.js";
import { Request, Response, NextFunction } from "express";
import { UserDocument, AuthRequest } from "../types/index.js";
import logger from "../logger/winston.logger.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import { upload } from "../utils/upload.js";
import mongoose from "mongoose";

// Mock function for email sending until we migrate the actual mail util
const sendEmail = async (options: any) => {
  console.log("Mock email sending:", options);
  return { messageId: "mock-message-id" };
};

/**
 * Generate access and refresh tokens for a user
 * @param userId The ID of the user to generate tokens for
 * @returns Object containing accessToken and refreshToken
 */
const generateAccessAndRefreshTokens = async (
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(error);
    throw new ApiError(
      500,
      "Something went wrong while generating the access token"
    );
  }
};

/**
 * Register a new user
 */
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with email or username already exists \n Check email if not verified",
      []
    );
  }

  // Create a new user
  const user = await User.create({
    email,
    password,
    username,
  });

  // Generate email verification token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  // Update user with verification token
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = new Date(tokenExpiry);
  await user.save({ validateBeforeSave: false });

  // Send verification email
  await sendEmail({
    email: user.email,
    subject: "Verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${process.env.CORS_ORIGIN}/verify-email/${unHashedToken}`
    ),
  });

  // Get user data without sensitive fields
  const createdUser = await User.findById((user as any)._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User registered successfully and verification email has been sent on your email."
      )
    );
});

/**
 * Login a user
 */
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check if the user's email is verified
  if (!user.isEmailVerified) {
    throw new ApiError(401, "Please verify your email before login");
  }

  // Check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    (user as any)._id.toString()
  );

  // Get updated user object
  const loggedInUser = await User.findById((user as any)._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // Set cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

/**
 * Logout the user
 */
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  // Clear refresh token from database
  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  // Clear cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out"));
});

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // Verify the refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || ""
    ) as jwt.JwtPayload;

    // Get the user from the decoded token
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Check if the incoming refresh token matches the one in the database
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id.toString()
    );

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

/**
 * Change current password
 */
const changeCurrentPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if old password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password");
    }

    // Set new password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
  }
);

/**
 * Get current user
 */
const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

/**
 * Verify email with token
 */
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing");
  }

  // Hash the token to match the stored token
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Find user with matching token and valid expiry
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(489, "Token is invalid or expired. Please try again.");
  }

  // Mark email as verified and remove verification fields
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEmailVerified: true },
        "Email verified successfully"
      )
    );
});

/**
 * Forgot password request
 */
const forgotPasswordRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // Find the user with the email
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    // Generate temporary reset token
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken();

    // Save the token and expiry in user document
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = new Date(tokenExpiry);
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    await sendEmail({
      email: user.email,
      subject: "Password reset request",
      mailgenContent: forgotPasswordMailgenContent(
        user.username,
        `${process.env.CORS_ORIGIN}/reset-password/${unHashedToken}`
      ),
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Password reset mail has been sent on your mail id"
        )
      );
  }
);

/**
 * Reset password with token
 */
const resetForgottenPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    // Hash the token to match with database
    let hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user with the hashed token and valid expiry
    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(
        489,
        "Token is invalid or expired. Please regenerate your token"
      );
    }

    // Set new password and clear token fields
    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset successfully"));
  }
);

/**
 * Social login with OAuth providers
 */
const loginWithProvider = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as UserDocument;

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id.toString()
  );

  // Get updated user object
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // Set cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

export {
  generateAccessAndRefreshTokens,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  verifyEmail,
  forgotPasswordRequest,
  resetForgottenPassword,
  loginWithProvider,
};
