/* global describe, it, expect, beforeEach, afterEach */

import { promises as fs } from 'fs';
import path from 'path';
import request from 'supertest';
import app from '../../src/index.js';
import User from '../../src/models/user.js';
import Resume from '../../src/models/resume.js';
import { createMockUser } from '../utils/test-utils.js';
import { authenticatedRequest } from '../utils/auth-test-utils.js';

describe('Resume API Integration Tests', () => {
  let testUser;
  let testResume;

  beforeEach(async () => {
    // Create test user
    const userData = createMockUser();
    testUser = await User.create(userData);

    // Create a test PDF file
    const testFilePath = path.join(process.cwd(), 'test-resume.pdf');
    await fs.writeFile(testFilePath, 'Test PDF content');
    testResume = {
      path: testFilePath,
      originalname: 'test-resume.pdf',
      mimetype: 'application/pdf'
    };
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Resume.deleteMany({});
    
    // Clean up test file
    try {
      await fs.unlink(testResume.path);
    } catch {
      // Ignore if file doesn't exist
    }
  });

  describe('POST /api/resumes', () => {
    it('should create a new resume successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/resumes',
        {
          resume: testResume
        },
        testUser
      );

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.user).toBe(testUser._id.toString());
      expect(response.body.originalName).toBe(testResume.originalname);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .attach('resume', testResume.path);

      expect(response.status).toBe(401);
    });

    it('should fail with invalid file type', async () => {
      // Create invalid file
      const invalidFilePath = path.join(process.cwd(), 'test.txt');
      await fs.writeFile(invalidFilePath, 'Invalid file');

      const response = await authenticatedRequest(
        app,
        'post',
        '/api/resumes',
        {
          resume: {
            path: invalidFilePath,
            originalname: 'test.txt',
            mimetype: 'text/plain'
          }
        },
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');

      // Clean up invalid file
      await fs.unlink(invalidFilePath);
    });
  });

  describe('GET /api/resumes', () => {
    beforeEach(async () => {
      // Create some test resumes
      await Resume.create({
        user: testUser._id,
        url: 'https://test-bucket.s3.amazonaws.com/resume1.pdf',
        originalName: 'resume1.pdf'
      });
      await Resume.create({
        user: testUser._id,
        url: 'https://test-bucket.s3.amazonaws.com/resume2.pdf',
        originalName: 'resume2.pdf'
      });
    });

    it('should get all resumes for authenticated user', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        '/api/resumes',
        null,
        testUser
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('url');
      expect(response.body[0].user).toBe(testUser._id.toString());
    });

    it('should return empty array if user has no resumes', async () => {
      // Create new user without resumes
      const newUser = await User.create(createMockUser());

      const response = await authenticatedRequest(
        app,
        'get',
        '/api/resumes',
        null,
        newUser
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/resumes');
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/resumes/:id', () => {
    let testResumeDoc;

    beforeEach(async () => {
      testResumeDoc = await Resume.create({
        user: testUser._id,
        url: 'https://test-bucket.s3.amazonaws.com/resume.pdf',
        originalName: 'resume.pdf'
      });
    });

    it('should delete resume successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'delete',
        `/api/resumes/${testResumeDoc._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(200);
      
      // Verify resume is deleted
      const deletedResume = await Resume.findById(testResumeDoc._id);
      expect(deletedResume).toBeNull();
    });

    it('should fail to delete non-existent resume', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await authenticatedRequest(
        app,
        'delete',
        `/api/resumes/${fakeId}`,
        null,
        testUser
      );

      expect(response.status).toBe(404);
    });

    it('should fail to delete resume owned by different user', async () => {
      // Create another user
      const anotherUser = await User.create(createMockUser());

      const response = await authenticatedRequest(
        app,
        'delete',
        `/api/resumes/${testResumeDoc._id}`,
        null,
        anotherUser
      );

      expect(response.status).toBe(403);
      
      // Verify resume still exists
      const resume = await Resume.findById(testResumeDoc._id);
      expect(resume).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/resumes/${testResumeDoc._id}`);
      expect(response.status).toBe(401);
    });
  });
}); 