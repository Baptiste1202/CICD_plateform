import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { getBuilds, createBuild, restartBuild } from "../controllers/buildController.js";

export const buildRouter: Router = express.Router();

/**
 * @route GET /
 * @description Retrieves all builds.
 * @middleware verifyToken({ role: "admin" }) - Ensures the user is authenticated and has the 'admin' role.
 */
buildRouter.get("/", verifyToken({ role: "admin" }), getBuilds);

/**
 * @route POST /
 * @description Creates a new build.
 * @middleware verifyToken({ role: "admin" }) - Ensures the user is authenticated and has the 'admin' role.
 */
buildRouter.post("/", verifyToken({ role: "admin" }), createBuild);

/**
 * @route POST /restart/:buildId
 * @description Restarts a build from a previous image.
 * @param {string} buildId - The ID of the build to restart.
 * @middleware verifyToken({ role: "admin" }) - Ensures the user is authenticated and has the 'admin' role.
 */
buildRouter.post("/restart/:buildId", verifyToken({ role: "admin" }), restartBuild);