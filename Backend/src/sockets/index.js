import geoSpatialModel from "../models/geoSpatial.model.js";
import socketMovement from "./userMovements.js";

const users = new Map();  //Server memory 
// socket.id -> { id, name, color, x, y, dir, meetingId }

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (u, meetingId) => {
      console.log(u, meetingId);
      
      const { ...user } = u;

      if (!meetingId || !user.id) return;

      users.set(socket.id, { ...user, meetingId });

      console.log(users.get(socket.id));
      
      socket.data.id = user.id;
      socket.data.meetingId = meetingId;

      socket.join(meetingId); // Join the Socket.io meeting room

      // Only send users from this meeting
      const meetingUsers = [...users.values()].filter((existingUser) => existingUser.meetingId === meetingId);
      socket.emit("presence:init", meetingUsers); // Send existing users to the new user
      socket.to(meetingId).emit("presence:join", user); // Tell everyone else in this meeting

      console.log(`User ${user.name} joined meeting ${meetingId}`);
    });

    socketMovement(socket, users);

    socket.on("disconnect", async () => {
      const u = users.get(socket.id);
      
      if (u) {
        socket.to(u.meetingId).emit("presence:leave", u.id);
        console.log(`User ${u.name} left meeting ${u.meetingId}`);
      }
      users.delete(socket.id);
      const user = await geoSpatialModel.findOneAndDelete({userId: u.id, meetingId: u.meetingId});
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export default registerSocketHandlers