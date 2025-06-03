import { Router } from "express";
import {
  analyzeMedia,
  getMediaAnalysisResult,
  getMediaAnalysisStatus,
} from "../controllers/mediaAnalysis.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Media analysis routes
router.route("/:interviewId/analyze").post(analyzeMedia);
router.route("/:interviewId/status").get(getMediaAnalysisStatus);
router.route("/:interviewId/result").get(getMediaAnalysisResult);

export default router;
