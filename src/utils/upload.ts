import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import logger from "../logger/winston.logger.js";
import { ApiError } from "./ApiError.js";
import { getLocalPath, removeLocalFile } from "./helpers.js";

/**
 * File upload interface
 */
export interface UploadedFile {
  filename: string;
  mimetype: string;
  size: number;
  path?: string;
  originalname?: string;
}

/**
 * S3 client for file uploads
 */
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Upload a file to S3
 * @param file The file to upload
 * @param key The S3 key to use
 * @returns The public URL of the uploaded file
 * @throws ApiError if upload fails
 */
export const upload = async (
  file: UploadedFile,
  key: string
): Promise<string> => {
  try {
    const localPath = getLocalPath(file?.filename);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "",
      Key: key,
      ContentType: file.mimetype,
      ACL: "public-read",
      Body: await readFile(localPath),
    });

    await s3Client.send(command);

    // Construct the public link
    const publicLink = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    // Remove local file after uploading to S3
    removeLocalFile(localPath);

    return publicLink;
  } catch (error) {
    logger.error(error);
    throw new ApiError(500, "Error Uploading File");
  }
};
