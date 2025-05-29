import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getConnectionStats } from "../services/websocket.service.js";
import { verifyApiKey } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * Get WebSocket connection statistics
 */
router.get(
  "/stats",
  verifyApiKey,
  asyncHandler(async (req, res) => {
    const stats = await getConnectionStats();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "WebSocket statistics retrieved successfully"
        )
      );
  })
);

export default router;
