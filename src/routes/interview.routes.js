import { Router } from "express";
import {
  chat,
  endInterview,
  getAllInterviews,
  setupInterview,
} from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  chatValidator,
  endInterviewValidator,
  setupInterviewValidator,
} from "../validators/interview.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.route("/").get(verifyJWT, getAllInterviews);
router
  .route("/setup")
  .post(setupInterviewValidator(), validate, verifyJWT, setupInterview);
router.route("/chat").post(chatValidator(), validate, verifyJWT, chat);
router
  .route("/end")
  .post(endInterviewValidator(), validate, verifyJWT, endInterview);

export default router;
