import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { togetherai } from "@ai-sdk/togetherai";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import {
  extractReasoningMiddleware,
  generateObject,
  generateText,
  wrapLanguageModel,
} from "ai";
import { createFallback } from "ai-fallback";
import fs from "fs";
import logger from "../logger/winston.logger.js";
import { ApiError } from "../utils/ApiError.js";

/**
 *
 * @param {string[]} fieldsArray
 * @param {any[]} objectArray
 * @returns {any[]}
 * @description utility function to only include fields present in the fieldsArray
 * For example,
 * ```js
 * let fieldsArray = [
 * {
 * id:1,
 * name:"John Doe",
 * email:"john@doe.com"
 * phone: "123456"
 * },
 * {
 * id:2,
 * name:"Mark H",
 * email:"mark@h.com"
 * phone: "563526"
 * }
 * ]
 * let fieldsArray = ["name", "email"]
 * 
 * const filteredKeysObject = filterObjectKeys(fieldsArray, fieldsArray)
 * console.log(filteredKeysObject) 
 * 
//  Above line's output will be:
//  [
//      {
//        name:"John Doe",
//        email:"john@doe.com"
//      },
//      {
//        name:"Mark H",
//        email:"mark@h.com"
//      }
//  ]
 * 
 * ```
 */
export const filterObjectKeys = (fieldsArray, objectArray) => {
  const filteredArray = structuredClone(objectArray).map((originalObj) => {
    let obj = {};
    structuredClone(fieldsArray)?.forEach((field) => {
      if (field?.trim() in originalObj) {
        obj[field] = originalObj[field];
      }
    });
    if (Object.keys(obj).length > 0) return obj;
    return originalObj;
  });
  return filteredArray;
};

/**
 *
 * @param {any[]} dataArray
 * @param {number} page
 * @param {number} limit
 * @returns {{previousPage: string | null, currentPage: string, nextPage: string | null, data: any[]}}
 */
export const getPaginatedPayload = (dataArray, page, limit) => {
  const startPosition = +(page - 1) * limit;

  const totalItems = dataArray.length; // total documents present after applying search query
  const totalPages = Math.ceil(totalItems / limit);

  dataArray = structuredClone(dataArray).slice(
    startPosition,
    startPosition + limit
  );

  const payload = {
    page,
    limit,
    totalPages,
    previousPage: page > 1,
    nextPage: page < totalPages,
    totalItems,
    currentPageItems: dataArray?.length,
    data: dataArray,
  };
  return payload;
};

/**
 *
 * @param {import("express").Request} req
 * @param {string} fileName
 * @description returns the file's static path from where the server is serving the static image
 */
export const getStaticFilePath = (req, fileName) => {
  return `${req.protocol}://${req.get("host")}/${fileName}`;
};

/**
 *
 * @param {string} fileName
 * @description returns the file's local path in the file system to assist future removal
 */
export const getLocalPath = (fileName) => {
  return `public/${fileName}`;
};

/**
 *
 * @param {string} localPath
 * @description Removed the local file from the local file system based on the file path
 */
export const removeLocalFile = (localPath) => {
  fs.unlink(localPath, (err) => {
    if (err) logger.error("Error while removing local files: ", err);
    else {
      logger.info("Removed local: ", localPath);
    }
  });
};

/**
 * @param {import("express").Request} req
 * @description **This utility function is responsible for removing unused image files due to the api fail**.
 *
 * **For example:**
 * * This can occur when product is created.
 * * In product creation process the images are getting uploaded before product gets created.
 * * Once images are uploaded and if there is an error creating a product, the uploaded images are unused.
 * * In such case, this function will remove those unused images.
 */
export const removeUnusedMulterImageFilesOnError = (req) => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) {
      // If there is file uploaded and there is validation error
      // We want to remove that file
      removeLocalFile(multerFile.path);
    }

    if (multerFiles) {
      /** @type {Express.Multer.File[][]}  */
      const filesValueArray = Object.values(multerFiles);
      // If there are multiple files uploaded for more than one fields
      // We want to remove those files as well
      filesValueArray.map((fileFields) => {
        fileFields.map((fileObject) => {
          removeLocalFile(fileObject.path);
        });
      });
    }
  } catch (error) {
    // fail silently
    logger.error("Error while removing image files: ", error);
  }
};

/**
 *
 * @param {{page: number; limit: number; customLabels: mongoose.CustomLabels;}} options
 * @returns {mongoose.PaginateOptions}
 */
export const getMongoosePaginationOptions = ({
  page = 1,
  limit = 10,
  customLabels,
}) => {
  return {
    page: Math.max(page, 1),
    limit: Math.max(limit, 1),
    pagination: true,
    customLabels: {
      pagingCounter: "serialNumberStartFrom",
      ...customLabels,
    },
  };
};

/**
 * @param {number} max Ceil threshold (exclusive)
 */
export const getRandomNumber = (max) => {
  return Math.floor(Math.random() * max);
};

/**
 * Generates a natural language response from the AI using the Groq API with optional reasoning extraction.
 *
 * @param {Object} options - The configuration options for the AI response generation
 * @param {Array<{role: string, content: string}>} [options.messages=[]] - Array of message objects containing the conversation history
 * @param {string} [options.systemPrompt] - System prompt to guide the AI's behavior
 * @param {Object} [options.params] - Additional parameters to pass to the model
 * @returns {Promise<string>} A promise that resolves to the AI-generated response text
 * @throws {ApiError} When the AI service fails to generate a response
 */
export const generateAIResponse = async ({
  messages = [],
  systemPrompt,
  ...params
}) => {
  try {
    const model = createFallback({
      models: [
        togetherai("meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"),
        groq("deepseek-r1-distill-llama-70b"),
        togetherai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"),
        google("gemini-2.0-flash-lite-preview-02-05"),
        groq("llama-3.3-70b-versatile"),
      ],
      onError: (error, modelId) => {
        logger.error(
          `Error with AI Response Generation model ${modelId}:`,
          error
        );
      },
    });

    const enhancedModel = wrapLanguageModel({
      model,
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    });

    const { text, usage, warnings, response } = await generateText({
      model: enhancedModel,
      maxTokens: 1024,
      system: systemPrompt,
      messages,
      temperature: 0.6,
      ...params,
    });

    logger.info("AI Response Generated:", {
      model: response?.modelId,
      usage,
    });

    if (warnings) {
      logger.warn("AI Response Generation Warnings:", warnings);
    }

    return text;
  } catch (error) {
    logger.error("AI Response Generation Error:", error);

    throw new ApiError(500, `AI Response Generation Error`);
  }
};

/**
 * Generates a structured object response from the AI using the Groq API based on a provided schema.
 *
 * @param {Object} options - The configuration options for the structured AI response
 * @param {Object} options.schema - JSON schema defining the structure of the desired output
 * @param {string} options.prompt - The prompt to send to the AI model
 * @param {number} [options.maxTokens=1024] - Maximum number of tokens in the response
 * @param {Object} [options.params] - Additional parameters to pass to the model
 * @returns {Promise<Object>} A promise that resolves to the structured object matching the provided schema
 * @throws {ApiError} When the AI service fails to generate a structured response
 */
export const generateAIStructuredResponse = async ({
  schema,
  prompt,
  maxTokens = 1024,
  ...params
}) => {
  try {
    const model = createFallback({
      models: [
        google("gemini-2.0-pro-exp-02-05"),
        google("gemini-2.0-flash"),
        google("gemini-2.0-flash-lite-preview-02-05"),
        groq("llama-3.3-70b-versatile"),
      ],
      onError: (error, modelId) => {
        logger.error(
          `Error with AI Structured Object Generation model ${modelId}:`,
          error
        );
      },
    });

    const { object, usage, warnings, response } = await generateObject({
      model,
      schema,
      prompt,
      maxTokens,
      ...params,
    });

    logger.info("AI Object Generated:", {
      model: response?.modelId,
      usage,
    });

    if (warnings) {
      logger.warn("AI Object Generation Warnings:", warnings);
    }

    return object;
  } catch (error) {
    logger.error("AI Object Generation Error:", error);

    throw new ApiError(500, `AI Object Generation Error`);
  }
};

/**
 * Generates AI content from a PDF buffer using Google's Generative AI
 * @param {Buffer} pdfBuffer - The PDF file buffer to analyze
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<string>} The generated content
 */
export const generateAIContentFromPDF = async (pdfBuffer, prompt) => {
  try {
    const resumeModel = google("gemini-2.0-flash-lite-preview-02-05");

    const { text, usage, warnings, response } = await generateText({
      model: resumeModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: pdfBuffer,
              mimeType: "application/pdf",
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    logger.info("AI PDF Content Generated:", {
      model: response?.modelId,
      usage,
    });

    if (warnings) {
      logger.warn("AI PDF Content Generation Warnings:", warnings);
    }

    return text;
  } catch (error) {
    logger.error("PDF AI Content Generation Error:", error);
    throw new ApiError(500, `AI PDF Service Error`);
  }
};

// Initialize the Polly client
const pollyClient = new PollyClient({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Convert text to speech and return audio buffer
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - Voice ID to use (default: Joanna)
 * @param {string} engine - Engine to use (default: neural)
 * @returns {Promise<Buffer>} Audio buffer
 */
export const generateSpeech = async (
  text,
  voiceId = "Kajal",
  engine = "neural"
) => {
  const params = {
    Engine: engine,
    OutputFormat: "mp3",
    Text: text,
    VoiceId: voiceId,
    TextType: "text",
  };

  try {
    const command = new SynthesizeSpeechCommand(params);
    const response = await pollyClient.send(command);

    // Convert audio stream to buffer
    const chunks = [];
    for await (const chunk of response.AudioStream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    logger.error("Speech Generation Error:", error);
  }
};
