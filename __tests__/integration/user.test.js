/* global describe, it, expect, beforeEach, afterEach */

import request from 'supertest';
import path from 'path';
import { promises as fs } from 'fs';
import app from '../../src/index.js';
import User from '../../src/models/user.js';
import { createMockUser } from '../utils/test-utils.js';
import { authenticatedRequest } from '../utils/auth-test-utils.js';

describe('User API Integration Tests', () => {
  let testUser;
  let testUserPassword;

  beforeEach(async () => {
    testUserPassword = 'TestPassword123!';
    const userData = createMockUser({ password: testUserPassword });
    testUser = await User.create(userData);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/users/register', () => {
    const validUser = {
      email: 'newuser@example.com',
      password: 'ValidPass123!',
      firstName: 'New',
      lastName: 'User'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.email).toBe(validUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with existing email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ ...validUser, email: testUser.email });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ ...validUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ ...validUser, password: 'weak' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUserPassword
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUserPassword
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/logout', () => {
    it('should logout successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/users/logout',
        null,
        testUser
      );

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).post('/api/users/logout');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/current-user', () => {
    it('should get current user profile', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        '/api/users/current-user',
        null,
        testUser
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testUser._id.toString());
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/users/current-user');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/users/change-password', () => {
    const newPassword = 'NewPassword123!';

    it('should change password successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/users/change-password',
        {
          currentPassword: testUserPassword,
          newPassword: newPassword
        },
        testUser
      );

      expect(response.status).toBe(200);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: newPassword
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should fail with incorrect current password', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/users/change-password',
        {
          currentPassword: 'wrongpassword',
          newPassword: newPassword
        },
        testUser
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with weak new password', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/users/change-password',
        {
          currentPassword: testUserPassword,
          newPassword: 'weak'
        },
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/forgot-password', () => {
    it('should initiate password reset successfully', async () => {
      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      // Should not expose whether email exists
      expect(response.body).toHaveProperty('message');
    });

    it('should return success even for non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      // Should not expose whether email exists
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/users/reset-password/:resetToken', () => {
    let resetToken;

    beforeEach(async () => {
      // Generate reset token
      resetToken = 'test-reset-token';
      testUser.resetPasswordToken = resetToken;
      testUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
      await testUser.save();
    });

    it('should reset password successfully', async () => {
      const newPassword = 'NewPassword123!';
      const response = await request(app)
        .post(`/api/users/reset-password/${resetToken}`)
        .send({ password: newPassword });

      expect(response.status).toBe(200);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: newPassword
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should fail with invalid reset token', async () => {
      const response = await request(app)
        .post('/api/users/reset-password/invalid-token')
        .send({ password: 'NewPassword123!' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with expired reset token', async () => {
      // Set token as expired
      testUser.resetPasswordExpires = Date.now() - 3600000; // 1 hour ago
      await testUser.save();

      const response = await request(app)
        .post(`/api/users/reset-password/${resetToken}`)
        .send({ password: 'NewPassword123!' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/avatar', () => {
    let testImage;

    beforeEach(async () => {
      // Create test image file
      const testImagePath = path.join(process.cwd(), 'test-avatar.jpg');
      await fs.writeFile(testImagePath, 'Test image content');
      testImage = {
        path: testImagePath,
        originalname: 'test-avatar.jpg',
        mimetype: 'image/jpeg'
      };
    });

    afterEach(async () => {
      // Clean up test image
      try {
        await fs.unlink(testImage.path);
      } catch {
        // Ignore if file doesn't exist
      }
    });

    it('should update avatar successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/users/avatar',
        {
          avatar: testImage
        },
        testUser
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('avatarUrl');
    });

    it('should fail with invalid file type', async () => {
      const invalidPath = path.join(process.cwd(), 'test.txt');
      await fs.writeFile(invalidPath, 'Invalid file');

      const response = await authenticatedRequest(
        app,
        'post',
        '/api/users/avatar',
        {
          avatar: {
            path: invalidPath,
            originalname: 'test.txt',
            mimetype: 'text/plain'
          }
        },
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');

      await fs.unlink(invalidPath);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/users/avatar')
        .attach('avatar', testImage.path);

      expect(response.status).toBe(401);
    });
  });
}); 