import fs from "fs";
import path from "path";
import { Request } from "express";
import logger from "../logger/winston.logger.js";

/**
 * Get the URL path for a static file
 * @param req The Express request object
 * @param fileName The name of the file
 * @returns The URL path to the static file
 */
export const getStaticFilePath = (req: Request, fileName: string): string => {
  return `${req.protocol}://${req.get("host")}/static/${fileName}`;
};

/**
 * Get the local file system path for a file name
 * @param fileName The name of the file
 * @returns The local path to the file
 */
export const getLocalPath = (fileName: string): string => {
  return path.join(process.cwd(), "public", fileName);
};

/**
 * Remove a file from the local file system
 * @param localPath The local path to the file
 * @returns true if the file was removed, false otherwise
 */
export const removeLocalFile = (localPath: string): boolean => {
  try {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
    return false;
  } catch (error) {
    logger.error("Error removing local file:", error);
    return false;
  }
};

/**
 * Remove unused multer image files on error
 * @param req The Express request object
 */
export const removeUnusedMulterImageFilesOnError = (req: Request): void => {
  try {
    if (req.file) {
      // If there's only one file
      const localPath = getLocalPath(req.file.filename);
      removeLocalFile(localPath);
    } else if (req.files) {
      // If there are multiple files
      const files = req.files as
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };

      if (Array.isArray(files)) {
        // If files is an array of files
        files.forEach((file) => {
          const localPath = getLocalPath(file.filename);
          removeLocalFile(localPath);
        });
      } else {
        // If files is an object with arrays of files
        Object.keys(files).forEach((key) => {
          files[key].forEach((file: Express.Multer.File) => {
            const localPath = getLocalPath(file.filename);
            removeLocalFile(localPath);
          });
        });
      }
    }
  } catch (error) {
    logger.error("Error removing unused multer files:", error);
  }
};
