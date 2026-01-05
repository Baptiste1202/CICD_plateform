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
  image: string; // référence à l'image Docker ou autre
  logs: string[];
  createdAt: Date;
  updatedAt: Date;
  user: mongoose.Types.ObjectId; // utilisateur qui a lancé le build
}