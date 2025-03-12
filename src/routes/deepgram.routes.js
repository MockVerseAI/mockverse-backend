import { Router } from "express";
import { getKey } from "../controllers/deepgram.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/key/:interviewId").get(verifyJWT, getKey);

export default router;
