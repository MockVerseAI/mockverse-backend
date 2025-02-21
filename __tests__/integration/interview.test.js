/* global describe, it, expect, beforeEach, afterEach, jest */

import request from 'supertest';
import app from '../../src/index.js';
import User from '../../src/models/user.js';
import Interview from '../../src/models/interview.js';
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

describe('Interview API Integration Tests', () => {
  let testUser;
  let testInterview;

  beforeEach(async () => {
    // Create test user
    const userData = createMockUser();
    testUser = await User.create(userData);

    // Create test interview
    testInterview = await Interview.create({
      user: testUser._id,
      jobTitle: 'Software Engineer',
      company: 'Tech Corp',
      type: 'technical',
      status: 'in_progress',
      jobDescription: 'Looking for an experienced software engineer...',
      parsedResume: {
        skills: ['JavaScript', 'Node.js', 'React'],
        experience: '5 years of software development'
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Interview.deleteMany({});
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/interviews', () => {
    beforeEach(async () => {
      // Create additional test interviews
      await Interview.create({
        user: testUser._id,
        jobTitle: 'Senior Developer',
        company: 'Another Corp',
        type: 'behavioral',
        status: 'completed'
      });
    });

    it('should get all interviews for authenticated user', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        '/api/interviews',
        null,
        testUser
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('jobTitle');
      expect(response.body[0].user).toBe(testUser._id.toString());
    });

    it('should return empty array if user has no interviews', async () => {
      // Create new user without interviews
      const newUser = await User.create(createMockUser());

      const response = await authenticatedRequest(
        app,
        'get',
        '/api/interviews',
        null,
        newUser
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/interviews');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/interviews/setup', () => {
    const validSetup = {
      jobTitle: 'Frontend Developer',
      company: 'Web Corp',
      type: 'technical'
    };

    it('should setup interview successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/interviews/setup',
        validSetup,
        testUser
      );

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.jobTitle).toBe(validSetup.jobTitle);
      expect(response.body.status).toBe('in_progress');
    });

    it('should fail with invalid interview type', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/interviews/setup',
        { ...validSetup, type: 'invalid' },
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail without required fields', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        '/api/interviews/setup',
        { jobTitle: 'Test Job' }, // Missing required fields
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/interviews/setup')
        .send(validSetup);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/interviews/chat/:interviewId', () => {
    const validMessage = {
      content: 'Tell me about your experience with Node.js'
    };

    it('should add chat message and get AI response successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        `/api/interviews/chat/${testInterview._id}`,
        validMessage,
        testUser
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].content).toBe(validMessage.content);
      
      // Verify AI response
      const { generateAIResponse } = require('../../src/utils/helpers.js');
      expect(generateAIResponse).toHaveBeenCalledWith({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: validMessage.content
          })
        ]),
        systemPrompt: expect.any(String)
      });
      
      // Verify response structure
      expect(response.body.aiResponse).toBeDefined();
      expect(response.body.aiResponse).toHaveProperty('text');
      expect(response.body.aiResponse).toHaveProperty('usage');
    });

    it('should handle AI response generation errors gracefully', async () => {
      // Mock AI generation failure
      const { generateAIResponse } = require('../../src/utils/helpers.js');
      generateAIResponse.mockRejectedValueOnce(new Error('AI generation error'));

      const response = await authenticatedRequest(
        app,
        'post',
        `/api/interviews/chat/${testInterview._id}`,
        validMessage,
        testUser
      );

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('AI generation');
    });

    it('should fail with empty message', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        `/api/interviews/chat/${testInterview._id}`,
        { content: '' },
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail for non-existent interview', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await authenticatedRequest(
        app,
        'post',
        `/api/interviews/chat/${fakeId}`,
        validMessage,
        testUser
      );

      expect(response.status).toBe(404);
    });

    it('should fail for completed interview', async () => {
      // Complete the interview
      testInterview.status = 'completed';
      await testInterview.save();

      const response = await authenticatedRequest(
        app,
        'post',
        `/api/interviews/chat/${testInterview._id}`,
        validMessage,
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/interviews/end/:interviewId', () => {
    it('should end interview successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'post',
        `/api/interviews/end/${testInterview._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');

      // Verify interview is marked as completed in database
      const updatedInterview = await Interview.findById(testInterview._id);
      expect(updatedInterview.status).toBe('completed');
    });

    it('should fail for non-existent interview', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await authenticatedRequest(
        app,
        'post',
        `/api/interviews/end/${fakeId}`,
        null,
        testUser
      );

      expect(response.status).toBe(404);
    });

    it('should fail for already completed interview', async () => {
      // Complete the interview
      testInterview.status = 'completed';
      await testInterview.save();

      const response = await authenticatedRequest(
        app,
        'post',
        `/api/interviews/end/${testInterview._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/interviews/report/:interviewId', () => {
    beforeEach(async () => {
      // Add some chat messages
      testInterview.messages = [
        { role: 'user', content: 'Tell me about your experience' },
        { role: 'assistant', content: 'I have worked on several projects...' }
      ];
      testInterview.status = 'completed';
      await testInterview.save();
    });

    it('should generate interview report with AI analysis successfully', async () => {
      const response = await authenticatedRequest(
        app,
        'get',
        `/api/interviews/report/${testInterview._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(200);
      
      // Verify AI function was called with correct parameters
      const { generateAIResponse } = require('../../src/utils/helpers.js');
      expect(generateAIResponse).toHaveBeenCalledWith({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('interview report')
          })
        ]),
        systemPrompt: expect.any(String)
      });
      
      // Verify response structure
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('usage');
      expect(response.body.usage).toEqual(expect.objectContaining({
        promptTokens: expect.any(Number),
        completionTokens: expect.any(Number),
        totalTokens: expect.any(Number)
      }));
    });

    it('should handle AI report generation errors gracefully', async () => {
      // Mock AI generation failure
      const { generateAIResponse } = require('../../src/utils/helpers.js');
      generateAIResponse.mockRejectedValueOnce(new Error('AI report generation error'));

      const response = await authenticatedRequest(
        app,
        'get',
        `/api/interviews/report/${testInterview._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('AI generation');
    });

    it('should fail for non-existent interview', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await authenticatedRequest(
        app,
        'get',
        `/api/interviews/report/${fakeId}`,
        null,
        testUser
      );

      expect(response.status).toBe(404);
    });

    it('should fail for in-progress interview', async () => {
      // Set interview back to in-progress
      testInterview.status = 'in_progress';
      await testInterview.save();

      const response = await authenticatedRequest(
        app,
        'get',
        `/api/interviews/report/${testInterview._id}`,
        null,
        testUser
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/interviews/report/${testInterview._id}`);

      expect(response.status).toBe(401);
    });
  });
}); 