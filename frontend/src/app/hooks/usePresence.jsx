import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Presence + coordinate broadcasting over Socket.IO.
 *
 * Server contract (adapt to your Node backend):
 *   client -> server  'join'          { id, name, color, x, y }
 *   client -> server  'move'          { x, y, dir }            (throttled ~15Hz)
 *   server -> client  'presence:init' [{ id, name, color, x, y, dir }]
 *   server -> client  'presence:join' { id, name, color, x, y, dir }
 *   server -> client  'presence:move' { id, x, y, dir }
 *   server -> client  'presence:leave' id
 *   server -> client  'proximity:update' [{ socketId, id, x, y }]
 *
 * Remote users live in a ref (a Map), NOT React state, so 60fps canvas
 * rendering never triggers React re-renders.
 */
export function usePresence({ url, me, meetingId, onProximityChange, enabled = true }) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const peersRef = useRef(new Map());
  const lastSent = useRef({ x: NaN, y: NaN, t: 0 });
  const proximityCallbackRef = useRef(onProximityChange);
  proximityCallbackRef.current = onProximityChange;

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

    newSocket.on('presence:leave', (id) => peers.delete(id));

    newSocket.on('proximity:update', (nearbyUsers) => {
      proximityCallbackRef.current?.(nearbyUsers);
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