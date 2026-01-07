import express, { Router, RequestHandler } from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
  deleteAccount,
  getAuthTypesStat,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router: Router = express.Router();

/** ROUTES ADMIN **/
router.get("/", verifyToken({ role: "admin" }), getUsers as RequestHandler);
router.delete("/:id", verifyToken({ role: "admin" }), deleteUser as RequestHandler);
router.get("/stats/authTypes", verifyToken({ role: "admin" }), getAuthTypesStat as RequestHandler);

/** ROUTES UTILISATEUR **/
router.put("/:id", verifyToken({ role: "user" }), updateUser as RequestHandler);
router.delete("/delete/account", verifyToken({ role: "user" }), deleteAccount as RequestHandler);

export default router;