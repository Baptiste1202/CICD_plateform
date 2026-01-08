import { Request, Response } from "express";
import { Build } from "../models/buildModel.js";
import { BuildStatus } from "../interfaces/IBuild.js";
import mongoose from "mongoose";

// Créer un nouveau build au début du déploiement
export const createBuild = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectName, images, deploymentId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }

    const build = await Build.create({
      projectName,
      status: BuildStatus.RUNNING,
      image: images?.[0] || "cicd-run-backend:latest",
      images: images || [],
      deploymentId: deploymentId || new mongoose.Types.ObjectId().toString(),
      logs: [],
      user: userId,
    });

    res.status(201).json({
      message: "Build créé avec succès",
      build: {
        _id: build._id,
        projectName: build.projectName,
        status: build.status,
        deploymentId: build.deploymentId,
        images: build.images,
        createdAt: build.createdAt,
      }
    });
  } catch (error: any) {
    console.error("Erreur lors de la création du build:", error);
    res.status(500).json({ error: "Erreur lors de la création du build", details: error.message });
  }
};

// Récupérer tous les builds avec pagination
export const getBuilds = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const skip = page * size;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Filter builds based on user role
    const filter = userRole === "admin" ? {} : { user: userId };

    const [builds, count] = await Promise.all([
      Build.find(filter)
        .populate("user", "username avatar forename name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size),
      Build.countDocuments(filter)
    ]);

    res.json({ builds, count });
  } catch (error: any) {
    console.error("Erreur lors de la récupération des builds:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des builds", details: error.message });
  }
};

// Récupérer un build par ID
export const getBuildById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const build = await Build.findById(id).populate("user", "username avatar");

    if (!build) {
      res.status(404).json({ error: "Build introuvable" });
      return;
    }

    res.json(build);
  } catch (error: any) {
    console.error("Erreur lors de la récupération du build:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du build", details: error.message });
  }
};

// Mettre à jour le statut d'un build
export const updateBuildStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, log } = req.body;

    const update: any = {};
    if (status) update.status = status;
    if (log) update.$push = { logs: log };

    const build = await Build.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!build) {
      res.status(404).json({ error: "Build introuvable" });
      return;
    }

    res.json({ message: "Build mis à jour", build });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du build:", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du build", details: error.message });
  }
};

// Redémarrer un build (créer un nouveau build avec les mêmes paramètres)
export const restartBuild = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const originalBuild = await Build.findById(id);
    if (!originalBuild) {
      res.status(404).json({ error: "Build introuvable" });
      return;
    }

    const newBuild = await Build.create({
      projectName: originalBuild.projectName,
      status: BuildStatus.PENDING,
      image: originalBuild.image,
      images: originalBuild.images,
      deploymentId: new mongoose.Types.ObjectId().toString(),
      logs: [],
      user: userId || originalBuild.user,
    });

    res.json({
      message: "Build redémarré",
      build: newBuild
    });
  } catch (error: any) {
    console.error("Erreur lors du redémarrage du build:", error);
    res.status(500).json({ error: "Erreur lors du redémarrage du build", details: error.message });
  }
};

// Supprimer un build
export const deleteBuild = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const build = await Build.findById(id);
    if (!build) {
      res.status(404).json({ error: "Build introuvable" });
      return;
    }

    // Si le build est en cours d'exécution, annuler le pipeline d'abord
    if (build.status === BuildStatus.RUNNING) {
      try {
        // Dynamically import to avoid circular dependency
        const { cancelPipelineById } = await import("../routes/deployRoutes.js");
        await cancelPipelineById(id);
      } catch (error) {
        console.error("Error cancelling pipeline before deletion:", error);
        // Continue with deletion even if cancellation fails
      }
    }

    await Build.findByIdAndDelete(id);

    res.json({ message: "Build supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression du build:", error);
    res.status(500).json({ error: "Erreur lors de la suppression du build", details: error.message });
  }
};