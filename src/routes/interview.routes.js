import { Router } from "express";
import { setupInterview, chat } from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/setup").post(verifyJWT, setupInterview);
router.route("/chat").post(verifyJWT, chat);

export default router;
