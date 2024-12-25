import { Router } from "express";
import { setupInterview } from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/setup").post(verifyJWT, upload.single("resume"), setupInterview);

export default router;
