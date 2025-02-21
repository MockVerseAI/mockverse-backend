/* global describe, it, expect, jest, beforeEach, afterEach */

import request from 'supertest';
import passport from 'passport';
import app from '../../src/index.js';
import User from '../../src/models/user.js';

// Mock passport strategies
jest.mock('passport-google-oauth20');
jest.mock('passport-github2');

describe('Social Authentication API Integration Tests', () => {
  beforeEach(() => {
    // Reset passport mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/users/google', () => {
    it('should initiate Google OAuth flow', async () => {
      const response = await request(app).get('/api/users/google');

      expect(response.status).toBe(302); // Redirect status
      expect(response.header.location).toContain('accounts.google.com');
    });

    it('should include required OAuth scopes', async () => {
      const authenticate = jest.spyOn(passport, 'authenticate');
      
      await request(app).get('/api/users/google');

      expect(authenticate).toHaveBeenCalledWith('google', {
        scope: ['profile', 'email']
      }, expect.any(Function));
    });
  });

  describe('GET /api/users/github', () => {
    it('should initiate GitHub OAuth flow', async () => {
      const response = await request(app).get('/api/users/github');

      expect(response.status).toBe(302); // Redirect status
      expect(response.header.location).toContain('github.com');
    });

    it('should include required OAuth scopes', async () => {
      const authenticate = jest.spyOn(passport, 'authenticate');
      
      await request(app).get('/api/users/github');

      expect(authenticate).toHaveBeenCalledWith('github', {
        scope: ['profile', 'email']
      }, expect.any(Function));
    });
  });

  describe('GET /api/users/google/callback', () => {
    it('should handle successful Google authentication', async () => {
      const mockProfile = {
        id: '123456789',
        emails: [{ value: 'test@gmail.com' }],
        name: { givenName: 'Test', familyName: 'User' },
        photos: [{ value: 'https://example.com/photo.jpg' }]
      };

      // Mock successful authentication
      passport.authenticate = jest.fn(() => {
        return (req, res, next) => {
          req.user = {
            _id: '507f1f77bcf86cd799439011',
            email: mockProfile.emails[0].value,
            firstName: mockProfile.name.givenName,
            lastName: mockProfile.name.familyName
          };
          next();
        };
      });

      const response = await request(app).get('/api/users/google/callback?code=test-code');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(mockProfile.emails[0].value);
    });

    it('should handle failed Google authentication', async () => {
      // Mock failed authentication
      passport.authenticate = jest.fn(() => {
        return (req, res) => {
          return res.status(401).json({ error: 'Authentication failed' });
        };
      });

      const response = await request(app).get('/api/users/google/callback?error=access_denied');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/github/callback', () => {
    it('should handle successful GitHub authentication', async () => {
      const mockProfile = {
        id: '123456789',
        emails: [{ value: 'test@github.com' }],
        displayName: 'Test User',
        photos: [{ value: 'https://example.com/photo.jpg' }]
      };

      // Mock successful authentication
      passport.authenticate = jest.fn(() => {
        return (req, res, next) => {
          req.user = {
            _id: '507f1f77bcf86cd799439011',
            email: mockProfile.emails[0].value,
            firstName: mockProfile.displayName.split(' ')[0],
            lastName: mockProfile.displayName.split(' ')[1]
          };
          next();
        };
      });

      const response = await request(app).get('/api/users/github/callback?code=test-code');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(mockProfile.emails[0].value);
    });

    it('should handle failed GitHub authentication', async () => {
      // Mock failed authentication
      passport.authenticate = jest.fn(() => {
        return (req, res) => {
          return res.status(401).json({ error: 'Authentication failed' });
        };
      });

      const response = await request(app).get('/api/users/github/callback?error=access_denied');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Social Authentication Integration', () => {
    it('should create new user on first social login', async () => {
      const mockProfile = {
        id: '123456789',
        emails: [{ value: 'newuser@gmail.com' }],
        name: { givenName: 'New', familyName: 'User' },
        photos: [{ value: 'https://example.com/photo.jpg' }]
      };

      // Mock successful authentication with new user
      passport.authenticate = jest.fn(() => {
        return async (req, res, next) => {
          const user = await User.create({
            email: mockProfile.emails[0].value,
            firstName: mockProfile.name.givenName,
            lastName: mockProfile.name.familyName,
            googleId: mockProfile.id
          });
          req.user = user;
          next();
        };
      });

      const response = await request(app).get('/api/users/google/callback?code=test-code');

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(mockProfile.emails[0].value);

      // Verify user was created in database
      const user = await User.findOne({ email: mockProfile.emails[0].value });
      expect(user).toBeDefined();
      expect(user.googleId).toBe(mockProfile.id);
    });

    it('should link accounts if email already exists', async () => {
      // Create existing user
      const existingUser = await User.create({
        email: 'existing@gmail.com',
        firstName: 'Existing',
        lastName: 'User',
        password: 'hashedpassword'
      });

      const mockProfile = {
        id: '123456789',
        emails: [{ value: existingUser.email }],
        name: { givenName: existingUser.firstName, familyName: existingUser.lastName },
        photos: [{ value: 'https://example.com/photo.jpg' }]
      };

      // Mock successful authentication with existing email
      passport.authenticate = jest.fn(() => {
        return async (req, res, next) => {
          const user = await User.findOneAndUpdate(
            { email: mockProfile.emails[0].value },
            { googleId: mockProfile.id },
            { new: true }
          );
          req.user = user;
          next();
        };
      });

      const response = await request(app).get('/api/users/google/callback?code=test-code');

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(existingUser.email);

      // Verify user was updated with social ID
      const user = await User.findById(existingUser._id);
      expect(user.googleId).toBe(mockProfile.id);
    });
  });
}); 