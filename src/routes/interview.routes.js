import { Router } from "express";
import {
  chat,
  endInterview,
  getAllInterviews,
  setupInterview,
  getOrGenerateReport,
} from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  chatValidator,
  setupInterviewValidator,
} from "../validators/interview.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.route("/").get(verifyJWT, getAllInterviews);
router
  .route("/setup")
  .post(setupInterviewValidator(), validate, verifyJWT, setupInterview);
router
  .route("/chat/:interviewId")
  .post(chatValidator(), validate, verifyJWT, chat);
router.route("/end/:interviewId").post(verifyJWT, endInterview);
router.route("/report/:interviewId").get(verifyJWT, getOrGenerateReport);

export default router;
