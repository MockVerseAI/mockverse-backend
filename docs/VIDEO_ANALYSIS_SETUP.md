# Video Analysis Background Job Processing

This document describes the production-grade video analysis system using BullMQ for background job processing.

## Overview

The video analysis system processes interview videos by:
1. Fetching video from URL
2. Converting to array buffer
3. Uploading to Google Files API
4. Analyzing with Google Gemini LLM
5. Storing results in MongoDB

## Architecture

```
Interview End → Queue Job → Worker → Google Files API → Gemini Analysis → Database
```

### Components

- **Queue**: `src/queues/videoAnalysis.queue.js` - BullMQ queue configuration
- **Worker**: `src/workers/videoAnalysis.worker.js` - Self-contained job processor with standalone capability
- **Service**: `src/services/videoAnalysis.service.js` - Business logic
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
VIDEO_WORKER_CONCURRENCY=2
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

#### Without Video Analysis Worker
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
npm run worker:video:dev
```

**Note:** 
- **Worker starts by default** - no configuration needed
- Set `START_WORKER=false` to explicitly disable video analysis
- If Redis is not available, the server will continue without video analysis
- Use `:no-worker` scripts for convenience when you don't want video analysis

## API Endpoints

### Video Analysis API

#### Manually Trigger Video Analysis
```http
POST /api/v1/video-analysis/:interviewId/analyze
Authorization: Bearer <token>

# No request body required - video URL is automatically fetched from interview recording
# Returns error if no video recording exists for the interview
```

#### Get Video Analysis Status
```http
GET /api/v1/video-analysis/:interviewId/status
Authorization: Bearer <token>
```

#### Get Video Analysis Result
```http
GET /api/v1/video-analysis/:interviewId/result
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

The video analysis results are stored in the `InterviewReport` model:

```javascript
videoAnalysis: {
  analysis: String,           // LLM analysis result
  googleFileUri: String,      // Google Files API URI
  googleFileName: String,     // Original filename
  analyzedAt: Date,          // Analysis completion time
  fileSize: Number,          // File size in bytes
  error: String,             // Error message if failed
  failedAt: Date            // Failure timestamp
}
```

**Note:** Video analysis requires that an interview report be generated first.

## Production Considerations

### Scaling
- Run multiple worker instances for horizontal scaling
- Adjust `VIDEO_WORKER_CONCURRENCY` based on server resources
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
   - Verify video URLs are accessible
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
3. Run worker: `npm run worker:video:dev`
4. Run main app: `npm run dev`

## Performance Optimization

- Video files are limited to 100MB
- 5-minute timeout for video fetching
- Cleanup of Google Files after processing
- **Single shared Redis connection** across all queues and workers
- Efficient connection reuse and proper cleanup
- Graceful worker shutdown with connection cleanup 