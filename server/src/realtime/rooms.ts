export function registerRooms(io: any, socket: any) {
    socket.on("enter-cabin", (cabinId: string) => {
        socket.join(`cabin:${cabinId}`);
    });

    socket.on("leave-cabin", (cabinId: string) => {
        socket.leave(`cabin:${cabinId}`);
    });
}
