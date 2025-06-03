# Multi-stage build for optimization
# Stage 1: Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies separately for better layer caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production stage
FROM node:20-slim AS production

# Create app user for security (non-root)
RUN groupadd -g 1001 appgroup && \
    useradd -r -u 1001 -g appgroup appuser

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:appgroup . .

# Create necessary directories with proper permissions
RUN mkdir -p logs && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Environment variables for New Relic
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); const options = {hostname: 'localhost', port: 8080, path: '/health', timeout: 2000}; const req = http.request(options, (res) => {if (res.statusCode === 200) process.exit(0); else process.exit(1);}); req.on('error', () => process.exit(1)); req.end();"

# Use the npm start script instead of duplicating the command
CMD ["npm", "start"]