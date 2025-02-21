/* global describe, it, expect */

import request from 'supertest';
import app from '../../src/index.js';

describe('Health Check API Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memoryUsage');
    });

    it('should include detailed health metrics', async () => {
      const response = await request(app).get('/health');

      expect(response.body.memoryUsage).toHaveProperty('heapTotal');
      expect(response.body.memoryUsage).toHaveProperty('heapUsed');
      expect(response.body.memoryUsage).toHaveProperty('rss');
      expect(typeof response.body.uptime).toBe('number');
    });
  });
}); 