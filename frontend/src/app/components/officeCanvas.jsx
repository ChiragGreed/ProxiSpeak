import { useEffect, useRef } from 'react';
import {
  WORLD, AVATAR_R, HEAR_RADIUS, FULL_RADIUS, ZONES, OBSTACLES, PLANTS,
  KIND_COLORS, proximityGain,
} from '../libs/officeLayout.jsx';
import { usePresence } from '../hooks/usePresence.jsx';
import './officeCanvas.css';

const SPEED = 230;      // world units / sec
const ACCEL = 1400;     // how fast we reach SPEED
const FRICTION = 1100;  // how fast we stop
const KEY_DIRS = {
  ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0],
};

/* ---------- static background, drawn once to an offscreen canvas ---------- */
function buildBackground() {
  const c = document.createElement('canvas');
  c.width = WORLD.w; c.height = WORLD.h;
  const g = c.getContext('2d');

  // wood planks
  for (let y = 0; y < WORLD.h; y += 26) {
    for (let x = -(y % 3) * 60; x < WORLD.w; x += 180) {
      const v = 190 + ((x * 7 + y * 13) % 22);
      g.fillStyle = `rgb(${v + 12},${v - 22},${v - 70})`;
      g.fillRect(x, y, 179, 25);
    }
  }
  // zone tints + borders
  ZONES.forEach((z) => {
    g.fillStyle = z.tint; g.fillRect(z.x, z.y, z.w, z.h);
    g.strokeStyle = 'rgba(60,40,20,0.15)'; g.lineWidth = 2; g.strokeRect(z.x, z.y, z.w, z.h);
  });
  // obstacles
  OBSTACLES.forEach((o) => {
    if (!o.kind) return;
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(o.x + 4, o.y + 6, o.w, o.h); // shadow
    g.fillStyle = KIND_COLORS[o.kind] || '#777';
    if (o.kind === 'round') { g.beginPath(); g.arc(o.x + o.w / 2, o.y + o.h / 2, o.w / 2, 0, Math.PI * 2); g.fill(); }
    else { g.beginPath(); g.roundRect(o.x, o.y, o.w, o.h, o.kind === 'wall' ? 2 : 6); g.fill(); }
  });
  // plants
  PLANTS.forEach(([x, y]) => {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      g.fillStyle = i % 2 ? '#2f7a3a' : '#3f9a4a';
      g.beginPath(); g.ellipse(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 11, 6, a, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#255f2e'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill();
  });
  return c;
}

/* ---------- collision: circle vs AABB, axis-separated so we slide ---------- */
function hitsAny(x, y, r) {
  for (const o of OBSTACLES) {
    if (o.kind === 'round' || o.kind === 'table' || o.kind === 'desk' || o.kind === 'sofa' || o.kind === 'wall' || !o.kind) {
      const cx = Math.max(o.x, Math.min(x, o.x + o.w));
      const cy = Math.max(o.y, Math.min(y, o.y + o.h));
      if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
    }
  }
  return false;
}

function drawAvatar(g, u, { isMe, speaking, avatarImage }) {
  const r = AVATAR_R;

  // shadow
  g.fillStyle = 'rgba(0,0,0,0.22)';
  g.beginPath();
  g.ellipse(u.x + 2, u.y + 5, r, r * 0.85, 0, 0, Math.PI * 2);
  g.fill();

  // speaking ring
  if (speaking) {
    g.strokeStyle = 'rgba(80,200,255,0.9)';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(u.x, u.y, r + 5, 0, Math.PI * 2);
    g.stroke();
  }

  /*
   * Avatar
   */
  if (avatarImage && avatarImage.complete && avatarImage.naturalWidth > 0) {
    g.save();

    // Clip the image into a circle
    g.beginPath();
    g.arc(u.x, u.y, r, 0, Math.PI * 2);
    g.clip();

    // Cover the circular area with the image
    const size = r * 2;

    g.drawImage(avatarImage, u.x - r, u.y - r, size, size);
    g.restore();
  } else {
    // Fallback when no avatar is available
    g.fillStyle = u.color || '#7aa2ff';
    g.beginPath();
    g.arc(u.x, u.y, r, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#0d1b3a';
    g.font = '700 15px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';

    g.fillText((u.name || '?')[0].toUpperCase(), u.x, u.y + 1);
  }

  // avatar border
  g.lineWidth = 3;
  g.strokeStyle = isMe ? '#2f6bff' : '#fff';
  g.beginPath();
  g.arc(u.x, u.y, r, 0, Math.PI * 2);
  g.stroke();

  // facing nub
  g.fillStyle = '#fff';
  g.beginPath();
  g.arc(u.x + Math.cos(u.dir || 0) * (r - 6), u.y + Math.sin(u.dir || 0) * (r - 6), 4, 0, Math.PI * 2);
  g.fill();

  // online dot
  g.fillStyle = '#2ecc71';
  g.beginPath();
  g.arc(u.x + r * 0.75, u.y - r * 0.75, 5, 0, Math.PI * 2);
  g.fill();

  // name pill
  g.font = '600 12px system-ui, sans-serif';
  const label = u.name || '?';
  const w = g.measureText(label).width + 14;

  g.fillStyle = 'rgba(20,28,48,0.85)';
  g.beginPath();
  g.roundRect(u.x - w / 2, u.y + r + 6, w, 18, 9);
  g.fill();

  g.fillStyle = '#fff';
  g.fillText(label, u.x, u.y + r + 15.5);
}

export default function OfficeCanvas({
  serverUrl = 'http://localhost:3000',
  user,
  meetingId,
  meetingUsers,
  onNearbyChange,          // ([{id, distance, gain}]) => void  -> drive WebRTC gain nodes
  className = '',
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const avatarImageRef = useRef(null);
  const canvasUser = {
    id: user?._id,
    name: user?.fullName,
    color: user?.color || '#7aa2ff',
    avtar: user?.avtar,
  };

  useEffect(() => {
    const image = new Image();

    image.onload = () => {
      avatarImageRef.current = image;
    };

    image.src = canvasUser.avtar;
  }, [canvasUser.avtar]);

  const meRef = useRef({ ...canvasUser, x: 760, y: 440, vx: 0, vy: 0, dir: 0, });
  const identity = useRef(canvasUser);
  const { peersRef, broadcast } = usePresence({ url: serverUrl, me: identity });
  const cbRef = useRef(onNearbyChange);
  cbRef.current = onNearbyChange;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const g = canvas.getContext('2d');
    const bg = buildBackground();
    const keys = new Set();
    let target = null;           // click-to-move destination
    let view = { s: 1, ox: 0, oy: 0, dpr: 1 };
    let raf, last = performance.now(), lastNearby = 0, clickFx = 0;

    /* ----- sizing: fit the whole office into the container ----- */
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = wrap.getBoundingClientRect();

      // Ignore invalid dimensions.
      if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0
      ) {
        return;
      }

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      // Resize only when the backing buffer actually changes.
      if (canvas.width !== pixelWidth) {
        canvas.width = pixelWidth;
      }

      if (canvas.height !== pixelHeight) {
        canvas.height = pixelHeight;
      }

      const s = Math.min(
        width / WORLD.w,
        height / WORLD.h
      );

      view = {
        s,
        dpr,
        ox: (width - WORLD.w * s) / 2,
        oy: (height - WORLD.h * s) / 2
      };
    };
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    /* ----- input ----- */
    const onKeyDown = (e) => {
      if (/input|textarea/i.test(e.target.tagName)) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (KEY_DIRS[k]) { keys.add(k); target = null; e.preventDefault(); }
    };
    const onKeyUp = (e) => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const onBlur = () => keys.clear();
    const onPointer = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left - view.ox) / view.s;
      const y = (e.clientY - r.top - view.oy) / view.s;
      if (x < 0 || y < 0 || x > WORLD.w || y > WORLD.h) return;
      target = { x, y }; clickFx = 1;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    canvas.addEventListener('pointerdown', onPointer);

    /* ----- simulation ----- */
    const step = (dt) => {
      const me = meRef.current;
      let ix = 0, iy = 0;
      keys.forEach((k) => { ix += KEY_DIRS[k][0]; iy += KEY_DIRS[k][1]; });

      if (!ix && !iy && target) {            // mouse: steer toward click
        const dx = target.x - me.x, dy = target.y - me.y, d = Math.hypot(dx, dy);
        if (d < 6) target = null; else { ix = dx / d; iy = dy / d; }
      }
      const len = Math.hypot(ix, iy);
      if (len) { ix /= len; iy /= len; }

      // accelerate toward desired velocity, or apply friction
      const tvx = ix * SPEED, tvy = iy * SPEED;
      const rate = (len ? ACCEL : FRICTION) * dt;
      const approach = (v, t) => (Math.abs(t - v) <= rate ? t : v + Math.sign(t - v) * rate);
      me.vx = approach(me.vx, tvx); me.vy = approach(me.vy, tvy);

      // axis-separated move => slide along walls
      const nx = me.x + me.vx * dt;
      if (!hitsAny(nx, me.y, AVATAR_R)) me.x = nx; else { me.vx = 0; if (target) target = null; }
      const ny = me.y + me.vy * dt;
      if (!hitsAny(me.x, ny, AVATAR_R)) me.y = ny; else { me.vy = 0; if (target) target = null; }

      if (Math.hypot(me.vx, me.vy) > 8) me.dir = Math.atan2(me.vy, me.vx);

      // smooth remote avatars toward their last network position
      const k = 1 - Math.exp(-12 * dt);
      peersRef.current.forEach((p) => { p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; });

      broadcast(me.x, me.y, me.dir);
    };

    /* ----- proximity (feeds audio crossfade) ----- */
    const computeNearby = (now) => {
      const me = meRef.current, list = [];
      peersRef.current.forEach((p) => {
        const d = Math.hypot(p.x - me.x, p.y - me.y);
        p.near = d < HEAR_RADIUS;
        if (p.near) list.push({ id: p.id, distance: d, gain: proximityGain(d) });
      });
      if (now - lastNearby > 100) { lastNearby = now; cbRef.current?.(list); }
    };

    /* ----- render ----- */
    const draw = (now) => {
      const me = meRef.current;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#16233f'; g.fillRect(0, 0, canvas.width, canvas.height);
      g.setTransform(view.s * view.dpr, 0, 0, view.s * view.dpr, view.ox * view.dpr, view.oy * view.dpr);

      g.drawImage(bg, 0, 0);

      // zone labels
      g.font = '600 14px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      ZONES.forEach((z) => {
        const w = g.measureText(z.name).width + 22;
        g.fillStyle = 'rgba(20,32,58,0.78)';
        g.beginPath(); g.roundRect(z.label[0] - w / 2, z.label[1] - 13, w, 26, 6); g.fill();
        g.fillStyle = '#fff'; g.fillText(z.name, z.label[0], z.label[1]);
      });

      // hearing range: soft outer ring + full-volume core
      const pulse = 1 + Math.sin(now / 500) * 0.015;
      const grad = g.createRadialGradient(me.x, me.y, FULL_RADIUS * 0.4, me.x, me.y, HEAR_RADIUS * pulse);
      grad.addColorStop(0, 'rgba(70,150,255,0.22)'); grad.addColorStop(1, 'rgba(70,150,255,0)');
      g.fillStyle = grad; g.beginPath(); g.arc(me.x, me.y, HEAR_RADIUS * pulse, 0, Math.PI * 2); g.fill();
      g.setLineDash([6, 8]); g.strokeStyle = 'rgba(70,150,255,0.45)'; g.lineWidth = 2;
      g.beginPath(); g.arc(me.x, me.y, FULL_RADIUS, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);

      // click marker
      if (target) {
        clickFx = Math.max(0, clickFx - 0.02);
        g.strokeStyle = `rgba(47,107,255,${0.4 + clickFx * 0.6})`; g.lineWidth = 3;
        g.beginPath(); g.arc(target.x, target.y, 10 + clickFx * 8, 0, Math.PI * 2); g.stroke();
      }

      // links to nearby people, opacity = audio gain
      peersRef.current.forEach((p) => {
        if (!p.near) return;
        const gain = proximityGain(Math.hypot(p.x - me.x, p.y - me.y));
        g.setLineDash([5, 6]); g.strokeStyle = `rgba(60,140,255,${0.15 + gain * 0.6})`; g.lineWidth = 2;
        g.beginPath(); g.moveTo(me.x, me.y); g.lineTo(p.x, p.y); g.stroke(); g.setLineDash([]);
      });

      // avatars, depth-sorted by y
      const drawList = [...peersRef.current.values(), me].sort((a, b) => a.y - b.y);
      drawList.forEach((u) =>
        drawAvatar(g, u, {
          isMe: u === me,
          speaking: u !== me && u.near,
          avatarImage: u === me ? avatarImageRef.current : null,
        })
      );

      // minimap (screen space)
      g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      const mw = 150, mh = mw * (WORLD.h / WORLD.w), mx = 14, my = canvas.height / view.dpr - mh - 14;
      g.fillStyle = 'rgba(12,22,44,0.85)'; g.beginPath(); g.roundRect(mx - 4, my - 4, mw + 8, mh + 8, 10); g.fill();
      g.drawImage(bg, mx, my, mw, mh);
      const mk = mw / WORLD.w;
      peersRef.current.forEach((p) => { g.fillStyle = '#ffd24a'; g.beginPath(); g.arc(mx + p.x * mk, my + p.y * mk, 2.5, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = '#2f6bff'; g.beginPath(); g.arc(mx + me.x * mk, my + me.y * mk, 4, 0, Math.PI * 2); g.fill();
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      step(dt); computeNearby(now); draw(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointerdown', onPointer);
    };
  }, [peersRef, broadcast]);

  return (
    <div
      ref={wrapRef}
      className={`office-canvas ${className}`}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        className="office-canvas__surface"
      />
    </div>
  );
}