import mongoose from "mongoose";
import { User } from "../../models/user.model.js";
import { UserLoginType } from "../../utils/constants.js";
import { jest, describe, it, expect } from "@jest/globals";

describe("User Model Tests", () => {
  // Test data
  const testUser = {
    username: "testuser",
    email: "test@example.com",
    password: "Password123!",
  };

  // Test for user creation
  it("should create a new user", async () => {
    const user = new User(testUser);
    const savedUser = await user.save();

    // Verify user was saved
    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(testUser.username);
    expect(savedUser.email).toBe(testUser.email);
    expect(savedUser.password).not.toBe(testUser.password); // Password should be hashed
    expect(savedUser.loginType).toBe(UserLoginType.EMAIL_PASSWORD);
    expect(savedUser.isEmailVerified).toBe(false);
  });

  // Test for password hashing
  it("should hash the password before saving", async () => {
    const user = new User(testUser);
    const savedUser = await user.save();

    // Verify password is hashed
    expect(savedUser.password).not.toBe(testUser.password);

    // Verify isPasswordCorrect method works
    const isPasswordCorrect = await savedUser.isPasswordCorrect(
      testUser.password
    );
    expect(isPasswordCorrect).toBe(true);
  });

  // Test for JWT token generation
  it("should generate access and refresh tokens", async () => {
    const user = new User(testUser);
    const savedUser = await user.save();

    // Generate tokens
    const accessToken = savedUser.generateAccessToken();
    const refreshToken = savedUser.generateRefreshToken();

    // Verify tokens are strings
    expect(typeof accessToken).toBe("string");
    expect(typeof refreshToken).toBe("string");

    // Verify tokens are not empty
    expect(accessToken.length).toBeGreaterThan(0);
    expect(refreshToken.length).toBeGreaterThan(0);
  });

  // Test for temporary token generation
  it("should generate temporary tokens for verification", async () => {
    const user = new User(testUser);

    // Generate temporary token
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken();

    // Verify token properties
    expect(typeof unHashedToken).toBe("string");
    expect(typeof hashedToken).toBe("string");
    expect(tokenExpiry).toBeGreaterThan(Date.now());
  });
});
