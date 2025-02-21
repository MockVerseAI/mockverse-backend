/* global jest */

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Generate a mock JWT token for testing
 * @param {Object} payload - The payload to include in the token
 * @returns {string} The generated JWT token
 */
const generateMockToken = (payload = {}) => {
  return jwt.sign(
    { 
      userId: payload.userId || new mongoose.Types.ObjectId(),
      email: payload.email || 'test@example.com',
      ...payload 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Create a mock user object
 * @param {Object} overrides - Override default user properties
 * @returns {Object} Mock user object
 */
const createMockUser = (overrides = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    ...overrides
  };
};

/**
 * Create mock request object for testing middleware and controllers
 * @param {Object} options - Request options
 * @returns {Object} Mock request object
 */
const createMockRequest = ({
  body = {},
  query = {},
  params = {},
  headers = {},
  user = null
} = {}) => ({
  body,
  query,
  params,
  headers,
  user
});

/**
 * Create mock response object for testing middleware and controllers
 * @returns {Object} Mock response object with jest spy functions
 */
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create mock next function for testing middleware
 * @returns {Function} Jest mock function
 */
const createMockNext = () => jest.fn();

export {
  generateMockToken,
  createMockUser,
  createMockRequest,
  createMockResponse,
  createMockNext
}; 