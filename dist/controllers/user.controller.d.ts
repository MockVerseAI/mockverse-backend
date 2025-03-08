import { Request, Response, NextFunction } from "express";
/**
 * Generate access and refresh tokens for a user
 */
declare const generateAccessAndRefreshTokens: (userId: string) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
/**
 * Register a new user
 */
declare const registerUser: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Login a user
 */
declare const loginUser: (req: Request, res: Response, next: NextFunction) => void;
export { registerUser, loginUser, generateAccessAndRefreshTokens };
