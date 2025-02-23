import { Router } from "express";
import { getAllPositions } from "../controllers/positions.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getAllPositions);

export default router;
