import { Router } from "express";
import {
  createInterviewWorkspace,
  deleteInterviewWorkspace,
  getAllInterviewWorkspaces,
} from "../controllers/interviewWorkspace.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createInterviewWorkspaceValidator } from "../validators/interviewWorkspace.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.route("/").get(verifyJWT, getAllInterviewWorkspaces);
router
  .route("/")
  .post(
    verifyJWT,
    createInterviewWorkspaceValidator(),
    validate,
    createInterviewWorkspace
  );
router
  .route("/:interviewWorkspaceId")
  .delete(verifyJWT, deleteInterviewWorkspace);

export default router;
