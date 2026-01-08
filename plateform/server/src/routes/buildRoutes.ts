import { Router } from "express";
import { createBuild, getBuilds, getBuildById, updateBuildStatus, restartBuild, deleteBuild } from "../controllers/buildController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/", verifyToken({ role: "user" }), getBuilds);
router.get("/:id", verifyToken({ role: "user" }), getBuildById);
router.post("/", verifyToken({ role: "user" }), createBuild);
router.patch("/:id/status", verifyToken({ role: "user" }), updateBuildStatus);
router.post("/restart/:id", verifyToken({ role: "user" }), restartBuild);
router.delete("/:id", verifyToken({ role: "admin" }), deleteBuild);

export default router;