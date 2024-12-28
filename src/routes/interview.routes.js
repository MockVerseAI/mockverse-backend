import { Router } from "express";
import { setupInterview } from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/setup").post(verifyJWT, setupInterview);

export default router;
