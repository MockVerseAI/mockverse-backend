import { Router } from "express";
import {
  createResume,
  deleteResume,
} from "../controllers/resume.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, upload.single("resume"), createResume);
router.route("/:id").delete(verifyJWT, deleteResume);

export default router;
