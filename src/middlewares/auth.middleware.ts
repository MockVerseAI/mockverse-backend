import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import logger from "../logger/winston.logger.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../types/index.js";

// Create a type guard to convert a Request to an AuthRequest
const asAuthRequest = (req: Request): AuthRequest => req as AuthRequest;

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = asAuthRequest(req);
    const token =
      authReq.cookies?.accessToken ||
      authReq.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    try {
      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || ""
      ) as jwt.JwtPayload;
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );

      if (!user) {
        // Client should make a request to /api/v1/user/refresh-token if they have refreshToken present in their cookie
        // Then they will get a new access token which will allow them to refresh the access token without logging out the user
        throw new ApiError(401, "Invalid access token");
      }

      if (!user.isEmailVerified) {
        throw new ApiError(401, "Email is not verified");
      }

      authReq.user = {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
      };

      next();
    } catch (error: any) {
      // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
      // Then they will get a new access token which will allow them to refresh the access token without logging out the user
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  }
);

/**
 * Middleware to check logged in users for unprotected routes. The function will set the logged in user to the request object and, if no user is logged in, it will silently fail.
 *
 * NOTE: THIS MIDDLEWARE IS ONLY TO BE USED FOR UNPROTECTED ROUTES IN WHICH THE LOGGED IN USER'S INFORMATION IS NEEDED
 */
export const getLoggedInUserOrIgnore = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = asAuthRequest(req);
    const token =
      authReq.cookies?.accessToken ||
      authReq.header("Authorization")?.replace("Bearer ", "");

    try {
      if (!token) {
        return next();
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || ""
      ) as jwt.JwtPayload;
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );

      if (user) {
        authReq.user = {
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
        };
      }

      next();
    } catch (error) {
      logger.error(error);
      // Fail silently with req.user being falsy
      next();
    }
  }
);

export const avoidInProduction = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "development") {
      next();
    } else {
      throw new ApiError(
        403,
        "This service is only available in the local environment. For more details visit: https://github.com/hiteshchoudhary/apihub/#readme"
      );
    }
  }
);
