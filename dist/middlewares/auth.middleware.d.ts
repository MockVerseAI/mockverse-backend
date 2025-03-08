import { Request, Response, NextFunction } from "express";
export declare const verifyJWT: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to check logged in users for unprotected routes. The function will set the logged in user to the request object and, if no user is logged in, it will silently fail.
 *
 * NOTE: THIS MIDDLEWARE IS ONLY TO BE USED FOR UNPROTECTED ROUTES IN WHICH THE LOGGED IN USER'S INFORMATION IS NEEDED
 */
export declare const getLoggedInUserOrIgnore: (req: Request, res: Response, next: NextFunction) => void;
export declare const avoidInProduction: (req: Request, res: Response, next: NextFunction) => void;
