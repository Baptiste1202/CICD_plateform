import express from "express";
import cors from "cors";
import adminFirebase from "firebase-admin";
import "dotenv/config";
import configRoutes from "./routes/configRoutes.js";
import authenticationRoutes from "./routes/authenticationRoutes.js";
import buildRoutes from "./routes/buildRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import {deployRoutes} from "./routes/deployRoutes";
export const admin = adminFirebase.initializeApp({
    credential: adminFirebase.credential.applicationDefault(),
});

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/config", configRoutes);
app.use("/api/auth", authenticationRoutes);
app.use("/api/builds", buildRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/deploy", deployRoutes);
app.get("/api/ping", (req, res) => res.json({ message: "pong" }));

export { app };