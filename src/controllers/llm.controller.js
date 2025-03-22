import { streamText } from "ai";
import logger from "../logger/winston.logger.js";
import { ApiError } from "../utils/ApiError.js";
import { groq } from "@ai-sdk/groq";

/**
 * Controller for handling Vapi custom LLM integration
 * This endpoint is compatible with OpenAI's chat completion API format
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const chatCompletion = async (req, res) => {
  try {
    console.log(req.body);

    const {
      messages,
      stream = false,
      model: modelName = "llama3-8b-8192",
      temperature = 0.7,
      max_tokens,
    } = req.body;

    // Validate required parameters
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new ApiError(400, "Messages array is required and cannot be empty");
    }

    // Configure model settings
    const modelConfig = {
      model: groq("llama3-8b-8192"),
      temperature,
      ...(max_tokens && { maxTokens: max_tokens }),
    };

    // Handle streaming response
    if (stream) {
      // Set appropriate headers for SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const { textStream } = await streamText({
        ...modelConfig,
        messages,
      });

      const reader = textStream.getReader();

      // Send the first message to establish stream
      const firstChunk = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: modelName,
        choices: [
          { delta: { role: "assistant" }, index: 0, finish_reason: null },
        ],
      };
      res.write(`data: ${JSON.stringify(firstChunk)}\n\n`);

      // Process the text stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Send completion message with finish_reason
          const finalChunk = {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: modelName,
            choices: [{ delta: {}, index: 0, finish_reason: "stop" }],
          };
          res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);

          // Send [DONE] marker
          res.write("data: [DONE]\n\n");
          res.end();
          break;
        }

        // Send content chunk
        const chunk = {
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: modelName,
          choices: [
            {
              index: 0,
              delta: { content: value },
              finish_reason: null,
            },
          ],
        };

        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    } else {
      // Non-streaming response
      let fullResponse = "";

      const { textStream } = await streamText({
        ...modelConfig,
        messages,
      });

      // Collect the full response from the stream
      const reader = textStream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += value;
      }

      // Format response to match OpenAI's API format
      const response = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: modelName,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: fullResponse,
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 0, // Placeholder values as we don't have token counts
          completion_tokens: 0,
          total_tokens: 0,
        },
      };

      res.status(200).json(response);
    }
  } catch (error) {
    logger.error("Error in Vapi chat completion:", error);

    // Return OpenAI-compatible error format
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const errorMessage =
      error instanceof ApiError ? error.message : "Internal server error";

    res.status(statusCode).json({
      error: {
        message: errorMessage,
        type: "api_error",
        code: statusCode.toString(),
      },
    });
  }
};
