import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerPresence } from "./presence.js";
import { registerMovement } from "./movement.js";
import { registerRooms } from "./rooms.js";

export function initSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // 🔐 AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", socket => {
    registerPresence(io, socket);
    registerMovement(io, socket);
    registerRooms(io, socket);
  });

  return io;
}
