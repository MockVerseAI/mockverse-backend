import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { getRedisConnection } from "../config/redis.js";
import logger from "../logger/winston.logger.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * WebSocket service for real-time communication
 * Minimal implementation for emitting events to users
 */

let io = null;

/**
 * Initialize WebSocket server with HTTP server
 * @param {import('http').Server} httpServer - HTTP server instance
 * @returns {Promise<import('socket.io').Server>} Socket.IO server instance
 */
export const initializeWebSocket = async (httpServer) => {
  try {
    logger.info("🔌 Initializing WebSocket server...");

    // Create Socket.IO server
    io = new SocketIOServer(httpServer, {
      cors: {
        origin:
          process.env.CORS_ORIGIN === "*"
            ? "*"
            : process.env.CORS_ORIGIN?.split(","),
        credentials: true,
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Setup Redis adapter for horizontal scaling
    try {
      const pubClient = getRedisConnection();
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      logger.info("📡 WebSocket Redis adapter initialized");
    } catch {
      logger.warn("⚠️ Redis adapter failed, running in single server mode");
    }

    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace("Bearer ", "");

        if (!token) {
          return next(new Error("Authentication token required"));
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select(
          "-password -refreshToken"
        );

        if (!user) {
          return next(new Error("Invalid token: user not found"));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        next();
      } catch {
        next(new Error("Authentication failed"));
      }
    });

    // Connection handling
    io.on("connection", (socket) => {
      const userId = socket.userId;

      // Join user-specific room
      socket.join(`user:${userId}`);

      logger.info(`👤 User ${userId} connected to WebSocket`);

      socket.on("disconnect", () => {
        logger.info(`👋 User ${userId} disconnected`);
      });
    });

    logger.info("✅ WebSocket server initialized successfully");
    return io;
  } catch (error) {
    logger.error("❌ Failed to initialize WebSocket server:", error);
    throw error;
  }
};

/**
 * Emit event to a specific user room
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} payload - Event payload
 * @returns {boolean} True if emitted successfully
 */
export const emitToRoom = (userId, event, payload) => {
  try {
    if (!io) {
      logger.warn("❌ WebSocket server not initialized");
      return false;
    }

    const roomId = `user:${userId}`;
    const enrichedPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    io.to(roomId).emit(event, enrichedPayload);

    logger.debug(`📡 Emitted '${event}' to user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`❌ Failed to emit '${event}' to user ${userId}:`, error);
    return false;
  }
};

/**
 * Get connection statistics
 * @returns {Promise<Object>} Connection statistics
 */
export const getConnectionStats = async () => {
  try {
    if (!io) {
      return { connected: 0, error: "WebSocket server not initialized" };
    }

    const sockets = await io.fetchSockets();
    return {
      connected: sockets.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("❌ Failed to get connection stats:", error);
    return { connected: 0, error: error.message };
  }
};

/**
 * Gracefully shutdown WebSocket server
 * @returns {Promise<void>}
 */
export const shutdownWebSocket = async () => {
  try {
    if (io) {
      logger.info("🔌 Shutting down WebSocket server...");
      io.close();
      io = null;
      logger.info("✅ WebSocket server shutdown completed");
    }
  } catch (error) {
    logger.error("❌ Error during WebSocket shutdown:", error);
  }
};

// Event constants for consistency
export const EVENTS = {
  ANALYSIS_STARTED: "analysis:started",
  ANALYSIS_COMPLETED: "analysis:completed",
  ANALYSIS_FAILED: "analysis:failed",
};
