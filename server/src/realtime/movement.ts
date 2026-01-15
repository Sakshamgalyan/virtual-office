import { getUsers } from "@/realtime/presence.js";

export function registerMovement(io: any, socket: any) {
    socket.on("move", (pos: { x: number; y: number; z: number }) => {
        const user = getUsers().get(socket.id);
        if (!user) return;

        user.x = pos.x;
        user.y = pos.y;
        user.z = pos.z;

        socket.broadcast.emit("player-move", user);
    });
}
