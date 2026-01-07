import { Router } from "express";
import { createBuild, getBuilds, restartBuild } from "../controllers/buildController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/", verifyToken({ role: "user" }), getBuilds);
router.post("/", verifyToken({ role: "user" }), createBuild);
router.post("/restart/:id", verifyToken({ role: "user" }), restartBuild);

export default router;