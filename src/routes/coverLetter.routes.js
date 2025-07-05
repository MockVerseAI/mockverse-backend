import { Router } from "express";
import {
  generateCoverLetter,
  getCoverLetters,
  getCoverLetter,
  deleteCoverLetter,
} from "../controllers/coverLetter.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCoverLetterValidator,
  getCoverLetterValidator,
  deleteCoverLetterValidator,
  getCoverLettersValidator,
} from "../validators/coverLetter.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

/**
 * @route GET /api/v1/cover-letter
 * @description Get all cover letters for the authenticated user with pagination and search
 * @access Private
 * @queryParams {number} page - Page number (default: 1)
 * @queryParams {number} limit - Items per page (default: 10, max: 50)
 * @queryParams {string} search - Search term for company name or job role
 */
router.route("/").get(getCoverLettersValidator(), validate, getCoverLetters);

/**
 * @route POST /api/v1/cover-letter
 * @description Generate a new cover letter using AI
 * @access Private
 * @body {string} companyName - Name of the company
 * @body {string} jobRole - Job role/title
 * @body {string} jobDescription - Job description
 * @body {string} resumeId - ID of the resume to use
 */
router
  .route("/")
  .post(createCoverLetterValidator(), validate, generateCoverLetter);

/**
 * @route GET /api/v1/cover-letter/:id
 * @description Get a specific cover letter by ID
 * @access Private
 * @params {string} id - Cover letter ID
 */
router.route("/:id").get(getCoverLetterValidator(), validate, getCoverLetter);

/**
 * @route DELETE /api/v1/cover-letter/:id
 * @description Delete a cover letter (soft delete)
 * @access Private
 * @params {string} id - Cover letter ID
 */
router
  .route("/:id")
  .delete(deleteCoverLetterValidator(), validate, deleteCoverLetter);

export default router;
