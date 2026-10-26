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

function socketMovements(socket, users) {
    socket.on("move", (m) => {
      const u = users.get(socket.id);
      if (!u) return;

      Object.assign(u, m);
      socket.to(u.meetingId).emit("presence:move", { id: u.id, ...m });

      if (!positionSaveTimers.has(socket.id)) {
        const timer = setTimeout(async () => {
          positionSaveTimers.delete(socket.id);

          const latestUser = users.get(socket.id);

          if (latestUser) {
            await savePosition(latestUser);
          }
        }, 1000);

        positionSaveTimers.set(socket.id, timer);
      }

        const nearbyUsers = getNearbyUsers(socket.id, users);

        // Inform the current user about proximity
        socket.emit("proximity:update", nearbyUsers);
    });
}

export default socketMovements;