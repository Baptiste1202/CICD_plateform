import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../interfaces/IUser.js";
import { userRoles } from "../utils/enums/userRoles.js";

const userSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        forename: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        avatar: { type: String },
        role: {
            type: String,
            enum: Object.values(userRoles),
            default: userRoles.USER
        },
        auth_type: { type: String, default: "google" },
    },
    { timestamps: true }
);

const User = mongoose.model<IUser & Document>("User", userSchema);
export default User;