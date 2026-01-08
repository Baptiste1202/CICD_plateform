import { Router } from "express";
import { getConfig, updateConfig } from "../controllers/configController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/", verifyToken({ role: "user" }), getConfig);
router.put("/", verifyToken({ role: "admin" }), updateConfig);

export default router;