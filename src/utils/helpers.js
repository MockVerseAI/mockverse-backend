import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import {
  extractReasoningMiddleware,
  generateObject,
  generateText,
  wrapLanguageModel,
} from "ai";
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
 * @param {string} [options.model="deepseek-r1-distill-llama-70b"] - The AI model identifier to use
 * @param {string} [options.systemPrompt] - System prompt to guide the AI's behavior
 * @param {Object} [options.params] - Additional parameters to pass to the model
 * @returns {Promise<string>} A promise that resolves to the AI-generated response text
 * @throws {ApiError} When the AI service fails to generate a response
 */
export const generateAIResponse = async ({
  messages = [],
  model = "deepseek-r1-distill-llama-70b",
  systemPrompt,
  ...params
}) => {
  try {
    const _model = groq(model);

    const enhancedModel = wrapLanguageModel({
      model: _model,
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    });

    const { text, usage, warnings } = await generateText({
      model: enhancedModel,
      maxTokens: 1024,
      system: systemPrompt,
      messages,
      ...params,
    });

    logger.info("AI Response Generation Usage:", usage);

    if (warnings) {
      logger.warn("AI Response Generation Warnings:", warnings);
    }

    return text;
  } catch (error) {
    logger.error("AI Response Generation Error:", {
      error: error.message,
      details: error.response?.data,
      messages: messages.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
      })),
    });

    throw new ApiError(
      error.response?.status || 500,
      `AI Service Error: ${error.response?.data?.error || error.message}`,
      [
        {
          service: "LLM",
          model,
          error: error.response?.data || error.message,
        },
      ]
    );
  }
};

/**
 * Generates a structured object response from the AI using the Groq API based on a provided schema.
 *
 * @param {Object} options - The configuration options for the structured AI response
 * @param {Object} options.schema - JSON schema defining the structure of the desired output
 * @param {string} options.prompt - The prompt to send to the AI model
 * @param {string} [options.model="llama-3.3-70b-versatile"] - The AI model identifier to use
 * @param {number} [options.maxTokens=1024] - Maximum number of tokens in the response
 * @param {Object} [options.params] - Additional parameters to pass to the model
 * @returns {Promise<Object>} A promise that resolves to the structured object matching the provided schema
 * @throws {ApiError} When the AI service fails to generate a structured response
 */
export const generateAIStructuredResponse = async ({
  schema,
  prompt,
  model = "llama-3.3-70b-versatile",
  maxTokens = 1024,
  ...params
}) => {
  try {
    const _model = groq(model);

    const { object, usage, warnings } = await generateObject({
      model: _model,
      schema,
      prompt,
      maxTokens,
      ...params,
    });

    logger.info("AI Object Generation Usage:", usage);

    if (warnings) {
      logger.warn("AI Object Generation Warnings:", warnings);
    }

    return object;
  } catch (error) {
    logger.error("AI Response Generation Error:", {
      error: error.message,
      details: error.response?.data,
    });

    throw new ApiError(
      error.response?.status || 500,
      `AI Service Error: ${error.response?.data?.error || error.message}`,
      [
        {
          service: "LLM",
          model,
          error: error.response?.data || error.message,
        },
      ]
    );
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
    const model = google("gemini-2.0-flash-lite-preview-02-05");

    const result = await generateText({
      model,
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

    return result.text;
  } catch (error) {
    logger.error("PDF AI Content Generation Error:", {
      error: error.message,
      details: error.response?.data,
      promptLength: prompt.length,
    });

    throw new ApiError(
      error.response?.status || 500,
      `AI PDF Service Error: ${error.response?.data?.error || error.message}`,
      [
        {
          service: "Google Generative AI",
          model: "gemini-2.0-flash-lite-preview-02-05",
          error: error.response?.data || error.message,
        },
      ]
    );
  }
};
