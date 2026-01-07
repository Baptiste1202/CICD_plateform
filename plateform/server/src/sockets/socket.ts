import { Server as SocketIOServer } from "socket.io";
import http from "http";

export let io: SocketIOServer | undefined;

export function initSockets(httpServer: http.Server) {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "http://localhost:5173", credentials: true }
  });

  io.on("connection", (socket) => {
    console.log("🔌 Un client s'est connecté au socket:", socket.id);
  });

  return io;
}