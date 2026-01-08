import mongoose, { Document } from "mongoose";

export enum BuildStatus {
  PENDING = "pending",
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed",
}

export interface IBuild extends Document {
  _id: mongoose.Types.ObjectId;
  projectName: string;
  status: BuildStatus;
  image: string;
  images?: string[]; // Liste des images déployées (backend, frontend, etc.)
  deploymentId?: string; // ID unique du déploiement
  logs: string[];
  createdAt: Date;
  updatedAt: Date;
  user: mongoose.Types.ObjectId;
}