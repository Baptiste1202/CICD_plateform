import { Router } from "express";
import { googleSync, logout } from "../controllers/authenticationController.js";

const router = Router();

router.post("/google-sync", googleSync);
router.post("/logout", logout);

export default router;