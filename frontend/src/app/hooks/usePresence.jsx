import { useCallback, useEffect, useRef } from 'react';
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
  const peersRef = useRef(new Map());       // id -> { id,name,color,x,y,tx,ty,dir }
  const lastSent = useRef({ x: NaN, y: NaN, t: 0 });
  const proximityCallbackRef = useRef(onProximityChange);
  proximityCallbackRef.current = onProximityChange;

  useEffect(() => {
    if (!enabled) return;
    console.log(url);


    const socket = io(url, {
      transports: ['websocket'],
      withCredentials: true,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;
    const peers = peersRef.current;

    const upsert = (u) => {
      const prev = peers.get(u.id);
      peers.set(u.id, {
        ...prev, ...u,
        x: prev ? prev.x : u.x, y: prev ? prev.y : u.y, // render pos (interpolated)
        tx: u.x, ty: u.y,                                // network target
      });
    };

    socket.on('connect', () => socket.emit('join', me.current, meetingId));
    socket.on('presence:init', (list) => list.filter((u) => u.id !== me.current.id).forEach(upsert));
    socket.on('presence:join', (u) => u.id !== me.current.id && upsert(u));
    socket.on('presence:move', (u) => {
      console.log('REMOTE MOVE:', u);
      const p = peers.get(u.id);
      if (p) { p.tx = u.x; p.ty = u.y; p.dir = u.dir; }
    });
    socket.on('presence:leave', (id) => peers.delete(id));
    socket.on('proximity:update', (nearbyUsers) => {
      proximityCallbackRef.current?.(nearbyUsers);
    });

    return () => { socket.disconnect(); peers.clear(); };
  }, [url, enabled, me, meetingId]);

  // Call every frame; only sends when moved and >= 66ms since the last packet.
  const broadcast = useCallback((x, y, dir) => {
    const s = socketRef.current;
    if (!s?.connected) return;
    const now = performance.now();
    const l = lastSent.current;

    const moved = !Number.isFinite(l.x) || !Number.isFinite(l.y) || Math.abs(x - l.x) > 0.5 || Math.abs(y - l.y) > 0.5;

    if (moved && now - l.t >= 66) {
      s.volatile.emit('move', { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, dir });
      lastSent.current = { x, y, t: now };
    }
  }, []);


  return { peersRef, broadcast, socketRef };
}