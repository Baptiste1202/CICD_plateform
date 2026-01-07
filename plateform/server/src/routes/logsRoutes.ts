import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { deleteAllLogs, deleteLog, getLoglevels, getLogs } from "../controllers/logController.js";

const router: Router = express.Router();

router.get("/", verifyToken({ role: "admin" }), getLogs);
router.get("/log-levels", verifyToken({ role: "admin" }), getLoglevels);
router.delete("/:id", verifyToken({ role: "admin" }), deleteLog);
router.delete("/", verifyToken({ role: "admin" }), deleteAllLogs);

export default router;