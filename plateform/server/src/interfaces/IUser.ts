import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  forename: string;
  email: string;
  username: string;
  role: "admin" | "user";
  avatar: string;
  auth_type: "GOOGLE" ;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  forename: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  avatar: { type: String },
  auth_type: { type: String, required: true, default: "GOOGLE" }
}, { timestamps: true });

export const User = mongoose.model<IUser>("User", UserSchema);