const users = new Map(); // socket.id -> { id, name, color, x, y, dir }

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (u) => {
      users.set(socket.id, u);
      socket.data.id = u.id;
      socket.emit("presence:init", [...users.values()]);
      socket.broadcast.emit("presence:join", u);
    });

    socket.on("move", (m) => {
      const u = users.get(socket.id);
      if (!u) return;
      Object.assign(u, m);
      socket.broadcast.emit("presence:move", { id: u.id, ...m });
    });

    socket.on("disconnect", () => {
      io.emit("presence:leave", socket.data.id);
      users.delete(socket.id);
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export default registerSocketHandlers;