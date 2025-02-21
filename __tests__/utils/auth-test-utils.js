import request from 'supertest';
import { generateMockToken } from './test-utils.js';

/**
 * Make an authenticated request
 * @param {Object} app - Express app instance
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} payload - Request payload
 * @param {Object} user - User object to generate token for
 * @returns {Promise} Supertest request
 */
export const authenticatedRequest = (app, method, url, payload = null, user = null) => {
  const token = generateMockToken(user);
  const req = request(app)[method](url)
    .set('Authorization', `Bearer ${token}`);
  
  if (payload) {
    if (payload instanceof FormData) {
      // Handle multipart/form-data
      Object.entries(payload).forEach(([key, value]) => {
        if (value instanceof File) {
          req.attach(key, value);
        } else {
          req.field(key, value);
        }
      });
    } else {
      // Handle JSON payload
      req.send(payload);
    }
  }
  
  return req;
}; 