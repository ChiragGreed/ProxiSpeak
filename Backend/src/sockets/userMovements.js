import MeetingParticipant from "../models/geoSpatial.model.js";
import { isWithinProximity } from "../utils/proximity.js";

let positionSaveTimers = new Map();

const getNearbyUsers = (currentSocketId, users) => {
  const currentUser = users.get(currentSocketId);

  if (!currentUser) return [];

  return [...users.entries()]
    .filter(([socketId, otherUser]) => {
      // Exclude the current user
      if (socketId === currentSocketId) return false;

      // Only consider users in the same meeting
      if (otherUser.meetingId !== currentUser.meetingId) {
        return false;
      }

      // Check the distance
      return isWithinProximity(currentUser, otherUser);
    })
    .map(([socketId, user]) => ({
      socketId,
      id: user.id,
      x: user.x,
      y: user.y,
    }));
};

export const savePosition = async (u) => {
  try {
    await MeetingParticipant.updateOne(
      {
        userId: u.id,
        meetingId: u.meetingId,
      },
      {
        $set: {
          position: {
            x: u.x,
            y: u.y,
          },
          isActive: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Failed to save position:", error);
  }
};

export const broadcastProximity = (io, users, meetingId) => {
  for (const [socketId, user] of users.entries()) {
    if (user.meetingId !== meetingId) continue;

    const nearbyUsers = getNearbyUsers(socketId, users);

    io.to(socketId).emit("proximity:update", nearbyUsers);
  }
};

function socketMovements(socket, users, io) {
  socket.on("move", (m) => {
    const u = users.get(socket.id);
    if (!u || !m) return;

    if (typeof m.x === "number") u.x = m.x;
    if (typeof m.y === "number") u.y = m.y;
    if (typeof m.dir === "number") u.dir = m.dir;

    socket.to(u.meetingId).emit("presence:move", {
      id: u.id,
      x: u.x,
      y: u.y,
      dir: u.dir
    });

    if (!positionSaveTimers.has(socket.id)) {
      const timer = setTimeout(async () => {
        positionSaveTimers.delete(socket.id);

        const latestUser = users.get(socket.id);
        if (latestUser) await savePosition(latestUser);
      }, 1000);

      positionSaveTimers.set(socket.id, timer);
    }

    broadcastProximity(io, users, u.meetingId);
  });
}

export default socketMovements;