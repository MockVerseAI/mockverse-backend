import express, { Express, NextFunction, Request, Response } from "express";
import request from "supertest";
import { User } from "../../models/user.model.js";
import { registerUser, loginUser } from "../../controllers/user.controller.js";
import { UserLoginType } from "../../utils/constants.js";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { UserDocument } from "../../types/index.js";

// Create a mockUser with the correct properties
const mockUser = {
  _id: "mock-user-id",
  username: "testuser",
  email: "test@example.com",
  isEmailVerified: true,
  generateAccessToken: jest.fn().mockReturnValue("mock-access-token"),
  generateRefreshToken: jest.fn().mockReturnValue("mock-refresh-token"),
  generateTemporaryToken: jest.fn().mockReturnValue({
    unHashedToken: "unhashed-token",
    hashedToken: "hashed-token",
    tokenExpiry: Date.now() + 3600000,
  }),
  save: jest.fn().mockResolvedValue(true),
};

// Mock the User model
jest.mock("../../models/user.model.js", () => {
  return {
    User: {
      findOne: jest.fn().mockImplementation((query) => {
        if (
          query?.$or?.some(
            (criteria) =>
              criteria.email === "test@example.com" ||
              criteria.username === "testuser"
          )
        ) {
          return Promise.resolve({
            ...mockUser,
            isPasswordCorrect: jest.fn().mockImplementation((password) => {
              return Promise.resolve(password === "Password123!");
            }),
          });
        } else if (
          query?.$or?.some(
            (criteria) => criteria.email === "unverified@example.com"
          )
        ) {
          return Promise.resolve({
            ...mockUser,
            isEmailVerified: false,
            isPasswordCorrect: jest.fn().mockResolvedValue(true),
          });
        }
        return Promise.resolve(null);
      }),
      findById: jest.fn().mockImplementation((id) => {
        if (id === "mock-user-id") {
          return {
            select: jest.fn().mockResolvedValue(mockUser),
          };
        }
        return {
          select: jest.fn().mockResolvedValue(null),
        };
      }),
      create: jest.fn().mockImplementation((userData) => {
        return Promise.resolve({
          ...mockUser,
          ...userData,
          save: jest.fn().mockResolvedValue(true),
        });
      }),
      deleteMany: jest.fn().mockResolvedValue({}),
    },
  };
});

// Mock mail functionality
jest.mock("../../utils/mail.js", () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: "mock-message-id" }),
}));

// Setup Express app for testing
const setupApp = (): Express => {
  const app = express();
  app.use(express.json());

  // Register test routes
  app.post("/api/test/register", registerUser);
  app.post("/api/test/login", loginUser);

  // Add error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  });

  return app;
};

describe("User Controller Tests", () => {
  let app: Express;

  beforeEach(() => {
    app = setupApp();
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        username: "newuser",
        email: "new@example.com",
        password: "Password123!",
      };

      const response = await request(app)
        .post("/api/test/register")
        .send(userData);

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.email).toBe(userData.email);

      // Verify the user is in the database
      const userInDb = await User.findOne({ email: userData.email });
      expect(userInDb).toBeTruthy();
      expect(userInDb?.isEmailVerified).toBe(false);
      expect(userInDb?.emailVerificationToken).toBeDefined();
      expect(userInDb?.emailVerificationExpiry).toBeDefined();
    });

    it("should not register a user with an existing email", async () => {
      // Try to register with existing email
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
      };

      // Mock User.findOne to return an existing user
      (User.findOne as jest.Mock).mockResolvedValueOnce({
        _id: "existing-user-id",
        username: "testuser",
        email: "test@example.com",
      });

      const response = await request(app)
        .post("/api/test/register")
        .send(userData);

      // Assertions
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe("loginUser", () => {
    it("should not login an unverified user", async () => {
      const response = await request(app).post("/api/test/login").send({
        email: "unverified@example.com",
        password: "Password123!",
      });

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/verify your email/i);
    });

    it("should login a verified user and return tokens", async () => {
      const response = await request(app).post("/api/test/login").send({
        email: "test@example.com",
        password: "Password123!",
      });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it("should reject login with invalid credentials", async () => {
      const response = await request(app).post("/api/test/login").send({
        email: "test@example.com",
        password: "WrongPassword123!",
      });

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/invalid credentials/i);
    });
  });
});
