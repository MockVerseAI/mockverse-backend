import { v2 as cloudinary } from "cloudinary";
import logger from "../logger/winston.logger.js";
import { ApiError } from "./ApiError.js";
import { getLocalPath, removeLocalFile } from "./helpers.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const upload = async (file, key) => {
  try {
    const localPath = getLocalPath(file?.filename);

    const resourceType = file.mimetype === "application/pdf" ? "raw" : "image";

    const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

    const result = await cloudinary.uploader.upload(localPath, {
      public_id: `${env}/${key}`,
      resource_type: resourceType,
      overwrite: true,
    });

    removeLocalFile(localPath);

    return result.secure_url;
  } catch (error) {
    logger.error(error);
    throw new ApiError(500, "Error Uploading File");
  }
};
