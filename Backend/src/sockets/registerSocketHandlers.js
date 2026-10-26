const users = new Map();

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', (u, meetingIdArg) => {
      const meetingId = meetingIdArg || u?.meetingId;
      const user = u && { ...u };

      if (!meetingId || !user?.id) return;

      delete user.meetingId;

      const old = users.get(socket.id);
      if (old) { 
        socket.leave(old.meetingId);
      }

      users.set(socket.id, { ...user, meetingId, audioReady: false });

      socket.data.id = user.id;
      socket.data.meetingId = meetingId;
      socket.join(meetingId);

      const meetingUsers = [...users.values()]
        .filter((p) => p.meetingId === meetingId)
        .map(({ audioReady, meetingId: _m, ...p }) => p);

      socket.emit('presence:init', meetingUsers);
      socket.to(meetingId).emit('presence:join', user);

      console.log(`User ${user.name} joined meeting ${meetingId}`);
    });

    socket.on('webrtc:ready', () => {
      const sender = users.get(socket.id);
      if (!sender) return;

      sender.audioReady = true;

      const readyUsers = [...users.entries()]
        .filter(([sid, u]) => sid !== socket.id && u.meetingId === sender.meetingId && u.audioReady)
        .map(([, u]) => u.id);

      socket.emit('webrtc:ready-users', readyUsers);
      socket.to(sender.meetingId).emit('webrtc:user-ready', { userId: sender.id });
    });

    socket.on('webrtc:not-ready', () => {
      const sender = users.get(socket.id);
      if (!sender) return;

      sender.audioReady = false;

      socket.to(sender.meetingId).emit('webrtc:user-not-ready', { userId: sender.id });
    });

    const forward = (event, payload, field) => {
      const sender = users.get(socket.id);
      if (!sender?.audioReady || !payload?.targetUserId || !payload?.[field]) return;

      const target = [...users.entries()].find(
        ([, u]) => u.id === payload.targetUserId && u.meetingId === sender.meetingId && u.audioReady
      );
      if (!target) return;

      io.to(target[0]).emit(event, { fromUserId: sender.id, [field]: payload[field] });
    };

    socket.on('webrtc:offer', (payload) => forward('webrtc:offer', payload, 'offer'));
    socket.on('webrtc:answer', (payload) => forward('webrtc:answer', payload, 'answer'));
    socket.on('webrtc:ice-candidate', (payload) => forward('webrtc:ice-candidate', payload, 'candidate'));

    socket.on('move', (m) => {
      const u = users.get(socket.id);
      if (!u || !m) return;

      const { x, y, dir } = m;
      if (typeof x === 'number') u.x = x;
      if (typeof y === 'number') u.y = y;
      if (typeof dir === 'number') u.dir = dir;

      socket.to(u.meetingId).emit('presence:move', { id: u.id, x: u.x, y: u.y, dir: u.dir });
    });

    socket.on('disconnect', () => {
      const u = users.get(socket.id);
      if (u) {
        socket.to(u.meetingId).emit('presence:leave', u.id);
        socket.to(u.meetingId).emit('webrtc:user-not-ready', { userId: u.id });
      }

      users.delete(socket.id);
      console.log('Socket disconnected:', socket.id);
    });
  });
};

export default registerSocketHandlers;
