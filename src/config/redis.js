import Redis from "ioredis";
import logger from "../logger/winston.logger.js";

/**
 * Redis connection configuration for BullMQ
 * Includes production-ready settings for reconnection, retries, and error handling
 */
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3, // Limit retries instead of null
  lazyConnect: true,
  // Connection pool settings for production
  family: 4,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 10000, // Increased from 5000 to 10000
  // Retry strategy
  retryStrategy: (times) => {
    if (times > 20) {
      logger.error(`Redis retry limit exceeded after ${times} attempts`);
      return null; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis connection retry attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
};

/**
 * Singleton Redis connection instance
 * Shared across all BullMQ queues and workers
 */
let redisConnection = null;

/**
 * Get or create the shared Redis connection
 * @returns {Redis} Shared Redis connection instance
 */
export const getRedisConnection = () => {
  if (!redisConnection) {
    logger.info("Creating shared Redis connection...");
    redisConnection = new Redis(redisConfig);

    // Setup event listeners
    redisConnection.on("connect", () => {
      logger.info("📡 Redis connected successfully");
    });

    redisConnection.on("ready", () => {
      logger.info("✅ Redis is ready to accept commands");
    });

    redisConnection.on("error", (error) => {
      logger.error("❌ Redis connection error:", error);
    });

    redisConnection.on("close", () => {
      logger.warn("🔌 Redis connection closed");
    });

    redisConnection.on("reconnecting", () => {
      logger.info("🔄 Redis reconnecting...");
    });

    redisConnection.on("end", () => {
      logger.warn("🛑 Redis connection ended");
      redisConnection = null; // Reset for potential reconnection
    });
  }

  return redisConnection;
};

/**
 * Check if Redis is available and accessible
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<boolean>} True if Redis is available, false otherwise
 */
export const isRedisAvailable = async (timeout = 5000) => {
  try {
    const testConnection = new Redis({
      ...redisConfig,
      connectTimeout: timeout,
      lazyConnect: false,
      retryStrategy: null, // Don't retry for availability check
    });

    await testConnection.ping();
    await testConnection.quit();
    return true;
  } catch (error) {
    logger.warn(`🔍 Redis availability check failed: ${error.message}`);
    return false;
  }
};

/**
 * Gracefully close the Redis connection
 * @returns {Promise<void>}
 */
export const closeRedisConnection = async () => {
  if (redisConnection) {
    logger.info("Closing Redis connection...");
    await redisConnection.quit();
    redisConnection = null;
    logger.info("Redis connection closed successfully");
  }
};

export { redisConfig };
export default redisConfig;
