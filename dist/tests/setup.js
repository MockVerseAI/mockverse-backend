import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
// Mock the NewRelic import
jest.mock("newrelic", () => ({
    addCustomAttribute: jest.fn(),
    noticeError: jest.fn(),
}));
// Mock nodemailer
jest.mock("nodemailer", () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: "mock-message-id" }),
        verify: jest.fn().mockResolvedValue(true),
    }),
}));
// MongoDB Memory Server for testing
let mongoServer;
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // Set up environment variables for testing
    process.env.DATABASE_URI = mongoUri;
    process.env.ACCESS_TOKEN_SECRET = "test-access-token-secret";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-token-secret";
    process.env.ACCESS_TOKEN_EXPIRY = "1h";
    process.env.REFRESH_TOKEN_EXPIRY = "7d";
    process.env.PORT = "4000";
    process.env.CORS_ORIGIN = "*";
    process.env.EXPRESS_SESSION_SECRET = "test-session-secret";
    await mongoose.connect(mongoUri);
});
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
// Clear all collections after each test
afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
});
//# sourceMappingURL=setup.js.map