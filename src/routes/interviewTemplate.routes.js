import { Router } from "express";
import {
  createInterviewTemplate,
  deleteInterviewTemplate,
  getInterviewTemplates,
  updateInterviewTemplate,
} from "../controllers/interviewTemplate.controller.js";
import { verifyApiKey } from "../middlewares/auth.middleware.js";
import {
  createInterviewTemplateValidator,
  getInterviewTemplatesValidator,
  updateInterviewTemplateValidator,
} from "../validators/interviewTemplate.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router
  .route("/")
  .get(verifyApiKey, getInterviewTemplatesValidator, getInterviewTemplates);

router
  .route("/")
  .post(
    verifyApiKey,
    createInterviewTemplateValidator(),
    validate,
    createInterviewTemplate
  );

router
  .route("/:interviewTemplateId")
  .delete(verifyApiKey, deleteInterviewTemplate)
  .put(
    verifyApiKey,
    updateInterviewTemplateValidator(),
    validate,
    updateInterviewTemplate
  );

export default router;
