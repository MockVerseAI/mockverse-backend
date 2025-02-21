/* global describe, it, expect, beforeEach */

import { createMockUser } from '../utils/test-utils.js';
import User from '../../src/models/user.js';

describe('User Model Test Suite', () => {
  describe('Validation', () => {
    it('should create a valid user', async () => {
      const validUserData = createMockUser();
      const user = new User(validUserData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUserData.email);
      expect(savedUser.firstName).toBe(validUserData.firstName);
      expect(savedUser.lastName).toBe(validUserData.lastName);
    });

    it('should fail to create user without required email', async () => {
      const userWithoutEmail = createMockUser({ email: undefined });
      const user = new User(userWithoutEmail);
      
      let err;
      try {
        await user.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    it('should fail to create user with invalid email format', async () => {
      const userWithInvalidEmail = createMockUser({ email: 'invalid-email' });
      const user = new User(userWithInvalidEmail);
      
      let err;
      try {
        await user.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    it('should not save password in plain text', async () => {
      const userData = createMockUser();
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toBeDefined();
    });
  });

  describe('Methods', () => {
    let user;

    beforeEach(async () => {
      const userData = createMockUser();
      user = new User(userData);
      await user.save();
    });

    it('should correctly compare valid password', async () => {
      const isValid = await user.comparePassword('Password123!');
      expect(isValid).toBe(true);
    });

    it('should correctly compare invalid password', async () => {
      const isValid = await user.comparePassword('wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('Indexes', () => {
    it('should fail to create user with duplicate email', async () => {
      const userData = createMockUser();
      const firstUser = new User(userData);
      await firstUser.save();

      const duplicateUser = new User(userData);
      
      let err;
      try {
        await duplicateUser.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeDefined();
      expect(err.code).toBe(11000); // MongoDB duplicate key error code
    });
  });
}); 