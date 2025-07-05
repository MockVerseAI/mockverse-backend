import { body, param, query } from "express-validator";

/**
 * @description Validation rules for creating a new cover letter
 * @route POST /api/v1/cover-letter
 */
const createCoverLetterValidator = () => {
  return [
    body("companyName")
      .trim()
      .notEmpty()
      .withMessage("Company name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Company name must be between 2 and 100 characters"),

    body("jobRole")
      .trim()
      .notEmpty()
      .withMessage("Job role is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Job role must be between 2 and 100 characters"),

    body("jobDescription")
      .trim()
      .notEmpty()
      .withMessage("Job description is required")
      .isLength({ min: 10, max: 5000 })
      .withMessage("Job description must be between 10 and 5000 characters"),

    body("resumeId")
      .trim()
      .notEmpty()
      .withMessage("Resume ID is required")
      .isMongoId()
      .withMessage("Invalid resume ID format"),
  ];
};

/**
 * @description Validation rules for getting a single cover letter
 * @route GET /api/v1/cover-letter/:id
 */
const getCoverLetterValidator = () => {
  return [
    param("id")
      .trim()
      .notEmpty()
      .withMessage("Cover letter ID is required")
      .isMongoId()
      .withMessage("Invalid cover letter ID format"),
  ];
};

/**
 * @description Validation rules for deleting a cover letter
 * @route DELETE /api/v1/cover-letter/:id
 */
const deleteCoverLetterValidator = () => {
  return [
    param("id")
      .trim()
      .notEmpty()
      .withMessage("Cover letter ID is required")
      .isMongoId()
      .withMessage("Invalid cover letter ID format"),
  ];
};

/**
 * @description Validation rules for getting cover letters with pagination and search
 * @route GET /api/v1/cover-letter
 */
const getCoverLettersValidator = () => {
  return [
    query("page")
      .optional()
      .toInt()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .toInt()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),

    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term cannot exceed 100 characters"),
  ];
};

export {
  createCoverLetterValidator,
  getCoverLetterValidator,
  deleteCoverLetterValidator,
  getCoverLettersValidator,
};
