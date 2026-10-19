// import "./officeLayout.css"

// World layout in world units (1 unit = 1 px at zoom 1). Shared with the backend if you want.
export const WORLD = { w: 1600, h: 1000 };
export const AVATAR_R = 20;
export const HEAR_RADIUS = 260;   // beyond this: silence
export const FULL_RADIUS = 90;    // inside this: full volume

// Distance -> 0..1 gain (smooth crossfade curve). Use this to drive WebRTC GainNodes.
export function proximityGain(d) {
  if (d >= HEAR_RADIUS) return 0;
  if (d <= FULL_RADIUS) return 1;
  const t = 1 - (d - FULL_RADIUS) / (HEAR_RADIUS - FULL_RADIUS);
  return t * t * (3 - 2 * t); // smoothstep
}

// Named zones (drawn as floor tints + labels)
export const ZONES = [
  { name: 'Meeting Room',   x: 40,   y: 40,  w: 340, h: 220, tint: 'rgba(120,170,220,0.28)', label: [210, 70] },
  { name: 'Focus Booths',   x: 560,  y: 30,  w: 300, h: 140, tint: 'rgba(90,70,50,0.12)',    label: [710, 190] },
  { name: 'Lounge',         x: 1160, y: 40,  w: 400, h: 260, tint: 'rgba(120,150,170,0.25)', label: [1360, 70] },
  { name: 'Work Pods',      x: 40,   y: 380, w: 420, h: 300, tint: 'rgba(0,0,0,0.04)',       label: [160, 520] },
  { name: 'Collaboration Area', x: 1100, y: 600, w: 440, h: 330, tint: 'rgba(160,140,120,0.22)', label: [1320, 560] },
  { name: 'Cafeteria',      x: 40,   y: 720, w: 420, h: 240, tint: 'rgba(0,0,0,0.05)',       label: [240, 700] },
  { name: 'Reception',      x: 600,  y: 760, w: 380, h: 190, tint: 'rgba(0,0,0,0.05)',       label: [800, 800] },
];

// Solid obstacles (AABB). Avatars slide along them.
export const OBSTACLES = [
  // outer walls
  { x: 0, y: -20, w: 1600, h: 20 }, { x: 0, y: 1000, w: 1600, h: 20 },
  { x: -20, y: 0, w: 20, h: 1000 }, { x: 1600, y: 0, w: 20, h: 1000 },
  // meeting room table + glass wall w/ doorway
  { x: 100, y: 100, w: 220, h: 90, kind: 'table' },
  { x: 380, y: 40, w: 8, h: 130, kind: 'wall' }, { x: 380, y: 220, w: 8, h: 40, kind: 'wall' },
  // focus booths
  { x: 560, y: 30, w: 8, h: 120, kind: 'wall' }, { x: 660, y: 30, w: 8, h: 120, kind: 'wall' },
  { x: 760, y: 30, w: 8, h: 120, kind: 'wall' }, { x: 856, y: 30, w: 8, h: 120, kind: 'wall' },
  // lounge sofas
  { x: 1220, y: 120, w: 160, h: 50, kind: 'sofa' }, { x: 1180, y: 120, w: 40, h: 120, kind: 'sofa' },
  // work pods desks
  { x: 80, y: 430, w: 90, h: 36, kind: 'desk' }, { x: 200, y: 430, w: 90, h: 36, kind: 'desk' },
  { x: 80, y: 560, w: 90, h: 36, kind: 'desk' }, { x: 200, y: 560, w: 90, h: 36, kind: 'desk' },
  { x: 340, y: 380, w: 30, h: 200, kind: 'desk' },
  // collaboration table
  { x: 1260, y: 650, w: 110, h: 220, kind: 'table' },
  // reception desk
  { x: 700, y: 800, w: 180, h: 60, kind: 'desk' },
  // cafeteria round tables
  { x: 140, y: 840, w: 50, h: 50, kind: 'round' }, { x: 300, y: 840, w: 50, h: 50, kind: 'round' },
];

export const PLANTS = [
  [360, 90], [470, 70], [900, 90], [1500, 80], [1480, 330], [210, 330], [70, 340], [470, 560],
  [60, 960], [1560, 960], [1500, 850], [1050, 700], [980, 960], [560, 960], [1560, 520],
];

export const KIND_COLORS = {
  table: '#9a7048', wall: '#6d8aa8', sofa: '#4c5c70', desk: '#7d5d3b', round: '#c9b79a',
};