# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev                  # Start with hot reload (nodemon)
npm run dev:no-worker        # Dev without media analysis worker

# Production
npm start                    # Start with New Relic monitoring
npm start:no-worker          # Production without worker

# Workers (run as separate processes)
npm run worker:media         # Run media analysis worker
npm run worker:media:dev     # Dev mode media analysis worker
```

No test suite is configured.

## Architecture

**MockVerse Backend** is a Node.js/Express REST API for an AI-powered interview preparation platform using ES modules throughout.

### Request Flow

```
Express (src/index.js) → Routes (src/routes/) → Controllers (src/controllers/)
  → Models (src/models/) → MongoDB via Mongoose
  → Queues (src/queues/) → Workers (src/workers/) → Services (src/services/)
```

### Key Architectural Pieces

- **Two process model**: The main API server and `mediaAnalysis.worker.js` run as separate processes. The worker can be excluded via `*:no-worker` scripts.
- **Job queue**: BullMQ + Redis for background media analysis jobs. Queue definitions live in `src/queues/`, the consumer in `src/workers/`.
- **WebSocket**: Socket.io real-time layer initialized in `src/services/websocket.service.js` and attached to the HTTP server in `src/index.js`.
- **Auth**: JWT for stateless auth + Passport.js (Google & GitHub OAuth2 strategies in `src/passport/`). JWT tokens are stored in the `User` model.
- **AI providers**: Multiple LLM backends via Vercel AI SDK (`@ai-sdk/google`, `@ai-sdk/groq`, `@ai-sdk/togetherai`), Vapi AI for voice, Deepgram for STT, AWS Polly for TTS.
- **Redis singleton**: Single connection managed in `src/config/redis.js`, shared by BullMQ and any caching.
- **Graceful shutdown**: `src/index.js` handles SIGTERM/SIGINT to cleanly close WebSocket, workers, Redis, and MongoDB.

### Routing

All routes mount at `/api/v1/*`. Health check is at `/api/v1/healthcheck`. Port defaults to `8080`.

### Code Conventions (from `.cursorrules`)

- **Files**: kebab-case
- **Classes**: PascalCase
- **Variables/functions**: camelCase
- **Constants**: UPPERCASE
- **Errors**: Always throw `new Error(...)` — never strings
- Follow Google Technical Writing guidelines for comments and docs
- Input validation via `express-validator` in `src/validators/`
- Structured logging via Winston (`src/logger/winston.logger.js`) — use the logger, not `console.log`

### Environment Variables

Copy `.env.example` to `.env`. Required vars include:
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — token signing
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`
- Google & GitHub OAuth credentials
- SMTP config (Mailtrap in dev)
- AWS credentials for Polly, Deepgram API key, Vapi credentials

### Docker

`docker-compose.yml` orchestrates the API + worker containers. `Dockerfile` builds both.
