import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// Mock function for email sending until we migrate the actual mail util
const sendEmail = async (options) => {
    console.log("Mock email sending:", options);
    return { messageId: "mock-message-id" };
};
/**
 * Generate access and refresh tokens for a user
 */
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // Attach refresh token to the user document
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        console.error(error);
        throw new ApiError(500, "Something went wrong while generating the access token");
    }
};
/**
 * Register a new user
 */
const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists \n Check email if not verified", []);
    }
    // Create a new user
    const user = await User.create({
        email,
        password,
        username,
    });
    // Generate email verification token
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    // Update user with verification token
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = new Date(tokenExpiry);
    await user.save({ validateBeforeSave: false });
    // TODO: Migrate mail logic
    // Send verification email (mock for now)
    await sendEmail({
        email: user.email,
        subject: "Verify your email",
        mailgenContent: {
            body: {
                name: user.username,
                intro: "Welcome to the app! Please verify your email.",
                action: {
                    instructions: "Click the button below to verify your email:",
                    button: {
                        color: "#22BC66",
                        text: "Verify Email",
                        link: `${process.env.CORS_ORIGIN}/verify-email/${unHashedToken}`,
                    },
                },
            },
        },
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }
    return res
        .status(201)
        .json(new ApiResponse(201, { user: createdUser }, "User registered successfully and verification email has been sent on your email."));
});
/**
 * Login a user
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }
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
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString());
    // Get updated user object
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
    // Set cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
    }, "User logged in successfully"));
});
export { registerUser, loginUser, generateAccessAndRefreshTokens };
//# sourceMappingURL=user.controller.js.map