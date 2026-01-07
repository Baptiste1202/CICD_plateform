import "dotenv/config";
import mongoose from "mongoose";
import http from "http";
import { app } from "./app.js";
import { initSockets } from "./sockets/socket.js";

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

initSockets(server);

mongoose.connect(process.env.MONG_URI!)
    .then(() => {
        server.listen(PORT, () => {
        });
    })
    .catch((err) => {
        process.exit(1);
    });