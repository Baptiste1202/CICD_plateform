import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Constants } from "../constants/constants.js";

export const generateAccessToken = (userId: mongoose.Types.ObjectId, role: string): string => {
  const secret = process.env.SECRET_ACCESS_TOKEN;

  if (!secret) {
    process.exit(1);
  }

  return jwt.sign(
      { uid: userId.toString(), role: role },
      secret,
      { expiresIn: Constants.MAX_AGE || "1d" }
  );
};