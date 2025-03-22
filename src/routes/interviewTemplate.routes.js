import { Router } from "express";
import {
  createInterviewTemplate,
  deleteInterviewTemplate,
  findRelevantTemplate,
  getInterviewTemplates,
  updateInterviewTemplate,
} from "../controllers/interviewTemplate.controller.js";
import { verifyApiKey, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createInterviewTemplateValidator,
  findRelevantTemplateValidator,
  getInterviewTemplatesValidator,
  updateInterviewTemplateValidator,
} from "../validators/interviewTemplate.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router
  .route("/")
  .get(
    verifyJWT,
    getInterviewTemplatesValidator(),
    validate,
    getInterviewTemplates
  );

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

router
  .route("/relevant/:interviewWorkspaceId")
  .get(
    verifyJWT,
    findRelevantTemplateValidator(),
    validate,
    findRelevantTemplate
  );

export default router;
