/* global describe, it, expect, beforeEach, afterEach */

import request from 'supertest';
import app from '../../src/index.js';
import User from '../../src/models/user.js';
import { createMockUser } from '../utils/test-utils.js';

describe('Authentication API Integration Tests', () => {
  let testUser;
  const password = 'Password123!';

  beforeEach(async () => {
    // Create a test user before each test
    const userData = createMockUser({ password });
    testUser = await User.create(userData);
  });

  afterEach(async () => {
    // Clean up test user after each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: password
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/register', () => {
    const newUser = {
      email: 'newuser@example.com',
      password: 'NewPassword123!',
      firstName: 'New',
      lastName: 'User'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.firstName).toBe(newUser.firstName);
      expect(response.body.user.lastName).toBe(newUser.lastName);
    });

    it('should fail when registering with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...newUser,
          email: testUser.email
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...newUser,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...newUser,
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 