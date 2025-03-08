import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../models/user.model.js";
import {
  verifyJWT,
  getLoggedInUserOrIgnore,
  avoidInProduction,
} from "../../middlewares/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
} from "@jest/globals";

// Mock User model
jest.mock("../../models/user.model.js", () => ({
  User: {
    findById: jest.fn(),
  },
}));

// Mock jwt
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

// Mock environment variables
const originalEnv = process.env;

// Create interface that extends partial Express types
interface MockRequest extends Partial<Request> {
  cookies?: Record<string, string>;
  header: jest.Mock;
  user?: any;
}

interface MockResponse extends Partial<Response> {
  status: jest.Mock;
  json: jest.Mock;
}

type MockNextFunction = jest.Mock;

describe("Auth Middleware Tests", () => {
  let mockReq: MockRequest;
  let mockRes: MockResponse;
  let mockNext: MockNextFunction;

  beforeEach(() => {
    // Reset mocks
    mockReq = {
      cookies: {},
      header: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("verifyJWT", () => {
    it("should throw 401 if no token is provided", async () => {
      mockReq.cookies = {};
      mockReq.header.mockReturnValue(undefined);

      await expect(
        verifyJWT(
          mockReq as Request,
          mockRes as Response,
          mockNext as NextFunction
        )
      ).rejects.toThrow(ApiError);

      // Ensure the error thrown has the right status code
      try {
        await verifyJWT(
          mockReq as Request,
          mockRes as Response,
          mockNext as NextFunction
        );
      } catch (err) {
        expect((err as ApiError).statusCode).toBe(401);
        expect((err as ApiError).message).toBe("Unauthorized request");
      }

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should set user in request and call next if valid token is provided", async () => {
      // Mock valid token
      mockReq.header.mockReturnValue("Bearer valid-token");

      // Mock JWT verification
      (jwt.verify as jest.Mock).mockReturnValue({ _id: "user-id" });

      // Mock user retrieval with properly typed mock response
      const mockUser = {
        _id: { toString: () => "user-id" },
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: true,
      };
      (User.findById as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser),
      }));

      await verifyJWT(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual({
        _id: "user-id",
        email: "test@example.com",
        username: "testuser",
      });
    });

    it("should throw 401 if user is not verified", async () => {
      // Mock valid token
      mockReq.header.mockReturnValue("Bearer valid-token");

      // Mock JWT verification
      (jwt.verify as jest.Mock).mockReturnValue({ _id: "user-id" });

      // Mock unverified user
      const mockUser = {
        _id: { toString: () => "user-id" },
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: false,
      };
      (User.findById as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser),
      }));

      await expect(
        verifyJWT(
          mockReq as Request,
          mockRes as Response,
          mockNext as NextFunction
        )
      ).rejects.toThrow(ApiError);

      try {
        await verifyJWT(
          mockReq as Request,
          mockRes as Response,
          mockNext as NextFunction
        );
      } catch (err) {
        expect((err as ApiError).statusCode).toBe(401);
        expect((err as ApiError).message).toBe("Email is not verified");
      }

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("getLoggedInUserOrIgnore", () => {
    it("should call next without setting user if no token is provided", async () => {
      await getLoggedInUserOrIgnore(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    it("should set user in request if valid token is provided", async () => {
      // Mock valid token
      mockReq.header.mockReturnValue("Bearer valid-token");

      // Mock JWT verification
      (jwt.verify as jest.Mock).mockReturnValue({ _id: "user-id" });

      // Mock user retrieval
      const mockUser = {
        _id: { toString: () => "user-id" },
        email: "test@example.com",
        username: "testuser",
      };
      (User.findById as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser),
      }));

      await getLoggedInUserOrIgnore(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual({
        _id: "user-id",
        email: "test@example.com",
        username: "testuser",
      });
    });
  });

  describe("avoidInProduction", () => {
    it("should call next in development environment", async () => {
      process.env.NODE_ENV = "development";

      await avoidInProduction(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw 403 in production environment", async () => {
      process.env.NODE_ENV = "production";

      await expect(
        avoidInProduction(
          mockReq as Request,
          mockRes as Response,
          mockNext as NextFunction
        )
      ).rejects.toThrow(ApiError);

      try {
        await avoidInProduction(
          mockReq as Request,
          mockRes as Response,
          mockNext as NextFunction
        );
      } catch (err) {
        expect((err as ApiError).statusCode).toBe(403);
      }

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
