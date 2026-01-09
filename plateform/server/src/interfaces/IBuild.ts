import mongoose, { Document } from "mongoose";

export enum BuildStatus {
  RUNNING = "running",
  PAUSED = "paused",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface IBuild extends Document {
  _id: mongoose.Types.ObjectId;
  projectName: string;
  status: BuildStatus;
  image: string;
  images?: string[];
  deploymentId?: string;
  isDeployed?: boolean;
  logs: string[];
  createdAt: Date;
  updatedAt: Date;
  user: mongoose.Types.ObjectId;
}