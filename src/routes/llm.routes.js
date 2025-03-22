import { Router } from "express";
import { chatCompletion } from "../controllers/llm.controller.js";
import { verifyApiKey } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route POST /api/v1/vapi/openai-sse/chat/completions
 * @description Route for Vapi custom LLM integration
 * @access Public
 */
router.post("/openai-sse/chat/completions", verifyApiKey, chatCompletion);

export default router;
