const users = new Map<string, any>();

export function registerPresence(io: any, socket: any) {
  const { userId, name } = socket.data.user;

  users.set(socket.id, {
    socketId: socket.id,
    userId,
    name,
    x: 0,
    y: 0,
    z: 0,
  });

  io.emit("presence", Array.from(users.values()));

  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.emit("user-left", socket.id);
  });
}

export function getUsers() {
  return users;
}
