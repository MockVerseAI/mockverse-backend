import Redis from "ioredis";
import logger from "../logger/winston.logger.js";

const redisConnectionConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_HOST ? {} : null,
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
    redisConnection = new Redis(redisConnectionConfig);

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
export const isRedisAvailable = async () => {
  try {
    const testConnection = new Redis(redisConnectionConfig);

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

export { redisConnectionConfig };
