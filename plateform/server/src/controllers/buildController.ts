import { Request, Response } from "express";
import { io } from "../sockets/socket.js";

export const createBuild = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectName } = req.body;

    res.status(201).json({ message: "Pipeline lancé" });

    const steps = ["Clone Git", "Build Maven", "Docker Push", "SSH Deploy"];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (io) {
        io.emit("pipeline-update", {
          step: steps[i],
          index: i,
          status: "running"
        });
      }
    }

    if (io) io.emit("pipeline-finished", { status: "success" });

  } catch (error) {
    res.status(500).json({ error: "Erreur pipeline" });
  }
};

export const getBuilds = async (req: Request, res: Response) => res.json([]);
export const restartBuild = async (req: Request, res: Response) => res.json({ message: "Restarting..." });