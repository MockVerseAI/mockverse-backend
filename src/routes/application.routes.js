import { Router } from "express";
import {
  createApplication,
  getAllApplications,
  getOrGenerateApplicationFeedback,
} from "../controllers/application.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createApplicationValidator } from "../validators/application.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.route("/").get(verifyJWT, getAllApplications);
router
  .route("/")
  .post(createApplicationValidator(), validate, verifyJWT, createApplication);
router
  .route("/report/:applicationId")
  .get(verifyJWT, getOrGenerateApplicationFeedback);

export default router;
