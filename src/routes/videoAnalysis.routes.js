import { Router } from "express";
import {
  analyzeVideo,
  getVideoAnalysisResult,
  getVideoAnalysisStatus,
} from "../controllers/videoAnalysis.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Video analysis routes
router.route("/:interviewId/analyze").post(analyzeVideo);
router.route("/:interviewId/status").get(getVideoAnalysisStatus);
router.route("/:interviewId/result").get(getVideoAnalysisResult);

export default router;
