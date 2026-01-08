import { model, Schema } from "mongoose";
import { IBuild, BuildStatus } from "../interfaces/IBuild.js";

const allowedBuildStatuses = Object.values(BuildStatus);

const buildSchema = new Schema<IBuild>(
  {
    projectName: { type: String, required: true },
    status: {
      type: String,
      enum: allowedBuildStatuses,
      required: true,
      default: BuildStatus.PENDING,
    },
    image: { type: String, required: true },
    images: [{ type: String }], // Liste des images déployées
    deploymentId: { type: String }, // ID unique du déploiement
    isDeployed: { type: Boolean, default: false }, // Indique si ce build est déployé
    logs: [{ type: String }],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Build = model<IBuild>("Build", buildSchema);