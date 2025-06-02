# Video Analysis Setup Guide

This guide explains how to set up and use the video analysis system in MockVerse. The system automatically analyzes interview videos using Google's Gemini AI to provide insights on candidate performance.

## Overview

The video analysis system processes interview recordings in the background using:
- **BullMQ** for job queue management
- **Redis** for queue storage and worker coordination  
- **Google Files API** for video upload and management
- **Google Gemini** for AI-powered video analysis
- **WebSocket** for real-time notifications

### Architecture Flow

```
Interview End → Queue Job → Worker → Google Files API → Gemini Analysis → Database
```

### Components

- **Queue**: `src/queues/mediaAnalysis.queue.js` - BullMQ queue configuration
- **Worker**: `src/workers/mediaAnalysis.worker.js` - Self-contained job processor with standalone capability
- **Service**: `src/services/mediaAnalysis.service.js` - Business logic
- **Controller**: `src/controllers/queue.controller.js` - Queue management API
- **Routes**: `src/routes/queue.routes.js` - Queue monitoring endpoints

## Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Google AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_GOOGLE_GENERATIVE_AI_API_KEY

# Worker Configuration
MEDIA_WORKER_CONCURRENCY=2
```

## Running the System

### 1. Start Redis Server
```bash
redis-server
```

### 2. Start the Application

#### Default: Integrated Mode (Recommended)
```bash
# Development (worker starts by default)
npm run dev

# Production (worker starts by default)
npm run start
```

#### Without Media Analysis Worker
```bash
# Development (explicitly disable worker)
npm run dev:no-worker

# Production (explicitly disable worker)
npm run start:no-worker

# Or set environment variable
START_WORKER=false npm run dev
```

#### Standalone Worker Mode
```bash
# Start worker separately (if needed)
npm run worker:media:dev
```

**Note:** 
- **Worker starts by default** - no configuration needed
- Set `START_WORKER=false` to explicitly disable media analysis
- If Redis is not available, the server will continue without media analysis
- Use `:no-worker` scripts for convenience when you don't want media analysis

## API Endpoints

### Media Analysis API

#### Manually Trigger Media Analysis
```http
POST /api/v1/media-analysis/:interviewId/analyze
Authorization: Bearer <token>

# No request body required - media URL is automatically fetched from interview recording
# Supports both video and audio recordings
# Returns error if no video or audio recording exists for the interview
```

#### Get Media Analysis Status
```http
GET /api/v1/media-analysis/:interviewId/status
Authorization: Bearer <token>
```

#### Get Media Analysis Result
```http
GET /api/v1/media-analysis/:interviewId/result
Authorization: Bearer <token>
```

### Queue Management API

#### Health Check (Public)
```http
GET /api/v1/queue/health
```

#### Queue Statistics (Authenticated)
```http
GET /api/v1/queue/stats
Authorization: Bearer <token>
```

#### Failed Jobs (Authenticated)
```http
GET /api/v1/queue/failed?limit=10&offset=0
Authorization: Bearer <token>
```

#### Retry Failed Job (Authenticated)
```http
POST /api/v1/queue/retry/:jobId
Authorization: Bearer <token>
```

#### Clean Queue (Authenticated)
```http
POST /api/v1/queue/clean
Content-Type: application/json
Authorization: Bearer <token>

{
  "olderThan": 86400000,
  "limit": 100
}
```

#### Pause/Resume Queue (Authenticated)
```http
POST /api/v1/queue/pause
POST /api/v1/queue/resume
Authorization: Bearer <token>
```

## Database Schema

The media analysis results are stored in the `InterviewReport` model:

```javascript
mediaAnalysis: {
  type: String,              // Media type: "video" or "audio"
  analysis: {                // Structured analysis object
    communicationSkills: {
      clarity: { score: Number, feedback: String, examples: [String] },
      articulation: { score: Number, feedback: String, examples: [String] },
      pace: { score: Number, feedback: String, examples: [String] },
      confidence: { score: Number, feedback: String, examples: [String] }
    },
    bodyLanguage: {          // Only for video analysis
      posture: { score: Number, feedback: String, examples: [String] },
      eyeContact: { score: Number, feedback: String, examples: [String] },
      gestures: { score: Number, feedback: String, examples: [String] },
      presence: { score: Number, feedback: String, examples: [String] }
    },
    audioQuality: {
      clarity: { score: Number, feedback: String },
      volume: { score: Number, feedback: String },
      background: { score: Number, feedback: String }
    },
    overallPerformance: {
      professionalism: { score: Number, feedback: String },
      engagement: { score: Number, feedback: String },
      readiness: { score: Number, feedback: String }
    },
    recommendations: {
      immediate: [String],
      practice: [String],
      resources: [String]
    },
    summary: {
      strengths: [String],
      weaknesses: [String],
      keyInsights: [String],
      overallScore: Number
    }
  },
  googleFileUri: String,     // Google Files API URI
  googleFileName: String,    // Original filename
  analyzedAt: Date,         // Analysis completion time
  fileSize: Number,         // File size in bytes
  processingDuration: Number, // Processing time in milliseconds
  error: String,            // Error message if failed
  failedAt: Date           // Failure timestamp
}
```

**Note:** Media analysis requires that an interview report be generated first.

## Production Considerations

### Scaling
- Run multiple worker instances for horizontal scaling
- Adjust `MEDIA_WORKER_CONCURRENCY` based on server resources
- Use Redis Cluster for high availability

### Monitoring
- Monitor queue health via `/api/v1/queue/health`
- Set up alerts for failed jobs
- Track processing times and success rates

### Error Handling
- Jobs retry 3 times with exponential backoff
- Failed jobs are preserved for debugging
- Graceful shutdown prevents job loss

### Security
- Queue management endpoints require authentication
- Google API key should be securely stored
- Redis should be password protected in production

### Redis Connection Management
- **Single Connection**: One shared Redis connection for all queues and workers
- **Automatic Cleanup**: Connections are properly closed on shutdown
- **Reconnection**: Automatic reconnection with exponential backoff
- **Event Monitoring**: Connection status is logged with emojis for easy identification

## Troubleshooting

### Common Issues

1. **Worker not processing jobs**
   - Check Redis connection
   - Verify GOOGLE_GENERATIVE_AI_API_KEY is set
   - Check worker logs for errors

2. **Jobs failing consistently**
   - Verify media URLs are accessible
   - Check Google API quotas
   - Review error logs in failed jobs

3. **High memory usage**
   - Reduce worker concurrency
   - Implement video size limits
   - Monitor Redis memory usage

### Logs
Worker logs include:
- Job start/completion events
- Error details with stack traces
- Performance metrics
- Health status updates

## Development

### Testing
```bash
# Test queue health
curl http://localhost:3000/api/v1/queue/health

# Test job creation (triggered by interview completion)
# Complete an interview with video recording enabled
```

### Local Development
1. Start Redis locally: `redis-server`
2. Set environment variables in `.env`
3. Run worker: `npm run worker:media:dev`
4. Run main app: `npm run dev`