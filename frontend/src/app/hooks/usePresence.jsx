import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function usePresence({ url, me, meetingId, enabled = true }) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const peersRef = useRef(new Map());
  const lastSent = useRef({ x: NaN, y: NaN, t: 0 });

  useEffect(() => {
    if (!enabled || !meetingId) return;

    // Create socket only when effect runs
    const newSocket = io(url, {
      transports: ['websocket'],
      withCredentials: true,
      reconnectionAttempts: 5
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    const peers = peersRef.current;

    const upsert = (u) => {
      const prev = peers.get(u.id);

      peers.set(u.id, {
        ...prev,
        ...u,
        x: prev ? prev.x : u.x,
        y: prev ? prev.y : u.y,
        tx: u.x,
        ty: u.y
      });
    };

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join', me.current, meetingId);
    });

    newSocket.on('presence:init', (list) => {
      list
        .filter((u) => u.id !== me.current.id)
        .forEach(upsert);
    });

    newSocket.on('presence:join', (u) => {
      if (u.id !== me.current.id) upsert(u);
    });

    newSocket.on('presence:move', (u) => {
      const peer = peers.get(u.id);

      if (peer) {
        peer.tx = u.x;
        peer.ty = u.y;
        peer.dir = u.dir;
      }
    });

    newSocket.on('presence:leave', (id) => {
      peers.delete(id);
    });

    return () => {
      console.log('Cleaning up socket:', newSocket.id);

      newSocket.disconnect();

      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }

      peers.clear();
    };
  }, [url, enabled, me, meetingId]);

  const broadcast = useCallback((x, y, dir) => {
    const s = socketRef.current;
    if (!s?.connected) return;

    const now = performance.now();
    const last = lastSent.current;

    const moved =
      !Number.isFinite(last.x) ||
      !Number.isFinite(last.y) ||
      Math.abs(x - last.x) > 0.5 ||
      Math.abs(y - last.y) > 0.5;

    if (moved && now - last.t >= 66) {
      s.volatile.emit('move', {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        dir
      });

      lastSent.current = { x, y, t: now };
    }
  }, []);

  return {
    peersRef,
    broadcast,
    socketRef,
    socket
  };
}