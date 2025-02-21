/* global jest, beforeAll, afterAll, afterEach */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
// Add other necessary test environment variables here

// Configure mongoose
mongoose.set('strictQuery', false);

// Setup before all tests
beforeAll(async () => {
  // Create an instance of MongoMemoryServer
  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect and stop MongoDB instance
  await mongoose.disconnect();
  await mongod.stop();
});

// Global test timeout
jest.setTimeout(30000);

// Silence console logs during tests
// Comment these out if you want to see console output during tests
console.log = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn(); 