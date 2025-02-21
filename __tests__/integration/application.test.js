/* global describe, it, expect, beforeEach, afterEach, jest */

import request from 'supertest';
import app from '../../src/index.js';
import User from '../../src/models/user.js';
import Application from '../../src/models/application.js';
import Resume from '../../src/models/resume.js';
import { createMockUser } from '../utils/test-utils.js';
import { authenticatedRequest } from '../utils/auth-test-utils.js';
import { mockGenerateAIResponse } from '../utils/ai-mock-utils.js';

// Mock the generateAIResponse function from helpers.js
jest.mock('../../src/utils/helpers.js', () => ({
  ...jest.requireActual('../../src/utils/helpers.js'),
  generateAIResponse: jest.fn((options) => 
    Promise.resolve(mockGenerateAIResponse(options))
  )
}));

describe('Application API Integration Tests', () => {
  let testUser;
  let testApplication;
  let testResume;

  beforeEach(async () => {
    // Create test user
    const userData = createMockUser();
    testUser = await User.create(userData);

    // Create test resume
    testResume = await Resume.create({
      user: testUser._id,
      url: 'https://test-bucket.s3.amazonaws.com/resume.pdf',
      originalName: 'resume.pdf',
      content: 'Test resume content with skills and experience...'
    });

    // Create test application
    testApplication = await Application.create({
      user: testUser._id,
      resume: testResume._id,
      jobTitle: 'Software Engineer',
      company: 'Tech Corp',
      status: 'applied',
      applicationDate: new Date(),
      jobDescription: 'Looking for a skilled software engineer...',
      notes: 'Applied through company website',
      salary: {
        min: 80000,
        max: 120000,
        currency: 'USD'
      },
      location: {
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        type: 'on-site'
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Application.deleteMany({});
    await Resume.deleteMany({});
  });

  describe('GET /api/applications', () => {
    beforeEach(async () => {
      // Create additional test applications
      await Application.create({
        user: testUser._id,
        resume: testResume._id,
        jobTitle: 'Senior Developer',
        company: 'Another Corp',
        status: 'interviewing',
        applicationDate: new Date(),
        jobDescription: 'Senior role...',
        notes: 'Referred by colleague',
        salary: {
          min: 120000,
          max: 180000,
          currency: 'USD'
        },
        location: {
          city: 'New York',
          state: 'NY',
          country: 'USA',
          type: 'hybrid'
        }
      });
    });

    it('should get all applications for authenticated user', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        '/api/applications',
        null,
        testUser
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('jobTitle');
      expect(response.body[0].user).toBe(testUser._id.toString());
    });

    it('should return empty array if user has no applications', async () => {
      // Create new user without applications
      const newUser = await User.create(createMockUser());

      const response = await authenticatedRequest(
        app,
        'get',
        '/api/applications',
        null,
        newUser
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/applications');
      expect(response.status).toBe(401);
    });

    it('should filter applications by status', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        '/api/applications?status=interviewing',
        null,
        testUser
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('interviewing');
    });

    it('should sort applications by date', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        '/api/applications?sort=applicationDate',
        null,
        testUser
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const dates = response.body.map(app => new Date(app.applicationDate).getTime());
      expect(dates).toBe(dates.sort());
    });
  });

  describe('POST /api/applications', () => {
    const validApplication = {
      resume: null, // Will be set in beforeEach
      jobTitle: 'Frontend Developer',
      company: 'Web Corp',
      status: 'applied',
      applicationDate: new Date().toISOString(),
      jobDescription: 'Looking for a frontend developer...',
      notes: 'Found on LinkedIn',
      salary: {
        min: 90000,
        max: 130000,
        currency: 'USD'
      },
      location: {
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        type: 'remote'
      }
    };

    beforeEach(() => {
      validApplication.resume = testResume._id;
    });

    it('should create application successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/applications',
        validApplication,
        testUser
      );

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.jobTitle).toBe(validApplication.jobTitle);
      expect(response.body.user).toBe(testUser._id.toString());
      expect(response.body.resume).toBe(testResume._id.toString());
    });

    it('should fail with invalid status', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/applications',
        { ...validApplication, status: 'invalid_status' },
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid salary range', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/applications',
        {
          ...validApplication,
          salary: { min: 100000, max: 90000, currency: 'USD' }
        },
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with non-existent resume', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/applications',
        {
          ...validApplication,
          resume: '507f1f77bcf86cd799439011' // Non-existent resume ID
        },
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail without required fields', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/applications',
        { jobTitle: 'Test Job' }, // Missing required fields
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/applications/report/:applicationId', () => {
    it('should get application feedback with AI analysis successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        `/api/applications/report/${testApplication._id}`,
        null,
        testUser
      );

      // Verify response structure
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('feedback');
      
      const { feedback } = response.body;
      
      // Verify feedback sections
      expect(feedback.strengths).toBeInstanceOf(Array);
      expect(feedback.improvements).toBeInstanceOf(Array);
      expect(feedback.marketAnalysis).toBeDefined();
      expect(feedback.nextSteps).toBeInstanceOf(Array);

      // Verify market analysis
      const { marketAnalysis } = feedback;
      expect(marketAnalysis.salaryRange).toBeDefined();
      expect(marketAnalysis.marketDemand).toBeDefined();
      expect(marketAnalysis.competitiveAnalysis).toBeDefined();

      // Verify salary calculations
      expect(marketAnalysis.salaryRange.low).toBe(testApplication.salary.min - 10000);
      expect(marketAnalysis.salaryRange.high).toBe(testApplication.salary.max + 10000);
      expect(marketAnalysis.salaryRange.average).toBe(
        (testApplication.salary.min + testApplication.salary.max) / 2
      );
      expect(marketAnalysis.salaryRange.currency).toBe(testApplication.salary.currency);

      // Verify competitive analysis
      expect(marketAnalysis.competitiveAnalysis.requiredSkills).toBeInstanceOf(Array);
      expect(marketAnalysis.competitiveAnalysis.recommendedSkills).toBeInstanceOf(Array);
    });

    it('should handle AI feedback generation errors gracefully', async () => {
      // Mock AI service failure
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      const aiService = require('../../src/services/ai.service.js');
      aiService.generateApplicationFeedback.mockRejectedValueOnce(new Error('AI feedback generation error'));

      const response = await authenticatedRequest(
        app,
        'get',
        `/api/applications/report/${testApplication._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('AI service');
    });

    it('should analyze resume against job description', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        `/api/applications/report/${testApplication._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('resumeAnalysis');
      
      const { resumeAnalysis } = response.body;
      expect(resumeAnalysis).toHaveProperty('score');
      expect(resumeAnalysis.feedback).toBeDefined();
      expect(resumeAnalysis.feedback.keywordAnalysis).toBeDefined();
      expect(resumeAnalysis.feedback.formatAnalysis).toBeDefined();
      expect(resumeAnalysis.recommendations).toBeInstanceOf(Array);
    });

    it('should fail for non-existent application', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await authenticatedRequest(
        app,
        'get',
        `/api/applications/report/${fakeId}`,
        null,
        testUser
      );

      expect(response.status).toBe(404);
    });

    it('should fail when accessing another user\'s application', async () => {
      // Create another user
      const anotherUser = await User.create(createMockUser());

      const response = await authenticatedRequest(
        app,
        'get',
        `/api/applications/report/${testApplication._id}`,
        null,
        anotherUser
      );

      expect(response.status).toBe(403);
    });

    it('should include salary and market analysis in report', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        `/api/applications/report/${testApplication._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(200);
      expect(response.body.feedback.marketAnalysis).toHaveProperty('salaryRange');
      expect(response.body.feedback.marketAnalysis).toHaveProperty('marketDemand');
      expect(response.body.feedback.marketAnalysis).toHaveProperty('competitiveAnalysis');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/applications/report/${testApplication._id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/applications/:id', () => {
    const updateData = {
      status: 'interviewing',
      notes: 'Updated notes after phone screen',
      salary: {
        min: 100000,
        max: 150000,
        currency: 'USD'
      }
    };

    it('should update application successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'put',
        `/api/applications/${testApplication._id}`,
        updateData,
        testUser
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.notes).toBe(updateData.notes);
      expect(response.body.salary.min).toBe(updateData.salary.min);
    });

    it('should fail with invalid status update', async () => {
      const response = await authenticatedRequest(
        app,
        'put',
        `/api/applications/${testApplication._id}`,
        { ...updateData, status: 'invalid_status' },
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail when updating another user\'s application', async () => {
      const anotherUser = await User.create(createMockUser());

      const response = await authenticatedRequest(
        app,
        'put',
        `/api/applications/${testApplication._id}`,
        updateData,
        anotherUser
      );

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('should delete application successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'delete',
        `/api/applications/${testApplication._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(200);

      // Verify application is deleted
      const deletedApp = await Application.findById(testApplication._id);
      expect(deletedApp).toBeNull();
    });

    it('should fail when deleting another user\'s application', async () => {
      const anotherUser = await User.create(createMockUser());

      const response = await authenticatedRequest(
        app,
        'delete',
        `/api/applications/${testApplication._id}`,
        null,
        anotherUser
      );

      expect(response.status).toBe(403);

      // Verify application still exists
      const app = await Application.findById(testApplication._id);
      expect(app).toBeDefined();
    });

    it('should fail with non-existent application', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await authenticatedRequest(
        app,
        'delete',
        `/api/applications/${fakeId}`,
        null,
        testUser
      );

      expect(response.status).toBe(404);
    });
  });
}); 