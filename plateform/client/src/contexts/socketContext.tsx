import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext doit être utilisé à l'intérieur d'un SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const newSocket = io("http://localhost:5001", {
      withCredentials: true,
      transports: ["websocket"],
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("🚀 Connecté au serveur Socket.io avec l'ID:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      console.log("🔌 Déconnexion du socket...");
      newSocket.close();
    };
  }, []);

  return (
      <SocketContext.Provider value={{ socket, onlineUsers }}>
        {children}
      </SocketContext.Provider>
  );
};