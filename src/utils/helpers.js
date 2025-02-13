import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs";
import Groq from "groq-sdk";
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

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generates a response from the AI using the Groq API.
 * @returns {Promise<string>} A promise that resolves to the AI-generated response as a string.
 */
export const generateAIResponse = async ({
  messages,
  model = "llama-3.3-70b-versatile",
  jsonMode = false,
  ...params
}) => {
  try {
    const groqResponse = await groq.chat.completions.create({
      messages,
      model,
      response_format: {
        type: jsonMode ? "json_object" : "text",
      },
      temperature: 0,
      ...params,
    });

    return groqResponse.choices[0].message.content;
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
