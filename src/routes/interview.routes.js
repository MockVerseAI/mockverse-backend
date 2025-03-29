import { Router } from "express";
import {
  agentEndCallback,
  chat,
  endAgentInterview,
  endInterview,
  getAllInterviews,
  getInterviewAgentId,
  getOrGenerateReport,
  setupInterview,
} from "../controllers/interview.controller.js";
import {
  verifyJWT,
  verifyVapiWebhookSecret,
} from "../middlewares/auth.middleware.js";
import {
  chatValidator,
  setupInterviewValidator,
} from "../validators/interview.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.route("/:interviewWorkspaceId").get(verifyJWT, getAllInterviews);
router
  .route("/:interviewWorkspaceId/setup")
  .post(verifyJWT, setupInterviewValidator(), validate, setupInterview);
router
  .route("/chat/:interviewId")
  .post(verifyJWT, chatValidator(), validate, chat);
router.route("/agent/:interviewId").get(verifyJWT, getInterviewAgentId);
router.route("/end/:interviewId").post(verifyJWT, endInterview);
router.route("/end-agent/:interviewId").post(verifyJWT, endAgentInterview);
router.route("/report/:interviewId").get(verifyJWT, getOrGenerateReport);
router
  .route("/agent-end-callback/:interviewId")
  .post(verifyVapiWebhookSecret, agentEndCallback);

export default router;
