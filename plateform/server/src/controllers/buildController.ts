import { Request, Response } from "express";
import mongoose from "mongoose";
import { Build } from "../models/buildModel.js";
import { BuildStatus } from "../interfaces/IBuild.js";

/**
 * Retrieves builds from the database.
 *
 * @returns {Object} JSON response with builds or error message.
 */
export const getBuilds = async (req: Request, res: Response): Promise<void> => {
  const size = parseInt(req.query.size as string) || 10;
  const page = parseInt(req.query.page as string) || 0;

  try {
    const builds = await Build.find({})
      .sort({ createdAt: -1 })
      .populate("user")
      .skip(page * size)
      .limit(size);

    const count = await Build.countDocuments();

    res.status(200).json({ builds, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Creates a new build entry.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const createBuild = async (req: Request, res: Response): Promise<void> => {
  const { projectName, image } = req.body;
  const userId = req.userId; // Assuming user is set by auth middleware

  try {
    const build = await Build.create({
      projectName,
      status: BuildStatus.PENDING,
      image,
      user: userId,
      logs: [],
    });

    // Simulate starting the build (in real CI/CD, this would trigger the pipeline)
    setTimeout(async () => {
      await Build.findByIdAndUpdate(build._id, { status: BuildStatus.RUNNING });
      // Simulate build completion
      setTimeout(async () => {
        const status = Math.random() > 0.5 ? BuildStatus.SUCCESS : BuildStatus.FAILED;
        await Build.findByIdAndUpdate(build._id, { status, logs: ["Build started", "Compiling...", status === BuildStatus.SUCCESS ? "Build successful" : "Build failed"] });
      }, 5000);
    }, 1000);

    res.status(201).json(build);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Restarts a build from a previous image.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const restartBuild = async (req: Request, res: Response): Promise<void> => {
  const { buildId } = req.params;
  const userId = req.userId;

  try {
    const originalBuild = await Build.findById(buildId);
    if (!originalBuild) {
      res.status(404).json({ error: "Build not found" });
      return;
    }

    const newBuild = await Build.create({
      projectName: originalBuild.projectName,
      status: BuildStatus.PENDING,
      image: originalBuild.image,
      user: userId,
      logs: [],
    });

    // Simulate restarting the build
    setTimeout(async () => {
      await Build.findByIdAndUpdate(newBuild._id, { status: BuildStatus.RUNNING });
      setTimeout(async () => {
        const status = Math.random() > 0.5 ? BuildStatus.SUCCESS : BuildStatus.FAILED;
        await Build.findByIdAndUpdate(newBuild._id, { status, logs: ["Restarted build", "Compiling...", status === BuildStatus.SUCCESS ? "Build successful" : "Build failed"] });
      }, 5000);
    }, 1000);

    res.status(201).json(newBuild);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};