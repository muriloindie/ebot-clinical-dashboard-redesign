// One-off generator: WhatsApp-style doodle tile (light + dark variants)
// Run: node scripts/generate-chat-doodle.mjs
import { writeFileSync } from "node:fs";

// Simple line-art doodles drawn in a 24x24 box (stroke only, round caps).
const DOODLES = {
  heart: "M12 20C5 14 3 10.5 4.5 8 6 5.5 9.5 6 12 9c2.5-3 6-3.5 7.5-1 1.5 2.5-.5 6-7.5 12Z",
  bubble: "M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-5 4v-4H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z",
  phone: "M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z",
  cross: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z",
  star: "M12 3l2.7 5.9 6.3.7-4.7 4.3 1.3 6.1-5.6-3.2-5.6 3.2 1.3-6.1L3 9.6l6.3-.7L12 3Z",
  smile: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 10h.01M15 10h.01M8.5 14.5s1.2 1.5 3.5 1.5 3.5-1.5 3.5-1.5",
  cam: "M3 8a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm13 3 5-3v8l-5-3",
  bell: "M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 19a2 2 0 0 0 4 0",
  music: "M9 18V6l10-2v11M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-3a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  clip: "M21 12l-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8L13 4.4a3.7 3.7 0 0 1 5.2 5.2L10 17.8a1.8 1.8 0 0 1-2.6-2.6L15 7.5",
  plane: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z",
  moon: "M20 14A8.5 8.5 0 0 1 10 4a8 8 0 1 0 10 10Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  cloud: "M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 1.7A4 4 0 0 0 7 19h10.5Z",
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Zm10 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  lock: "M5 11h14v10H5V11Zm2 0V7a5 5 0 0 1 10 0v4",
  pill: "M10.5 20.5a5 5 0 0 1-7-7l7-7a5 5 0 0 1 7 7l-7 7ZM7 10l7 7",
  mail: "M3 6h18v12H3V6Zm0 0 9 7 9-7",
  cup: "M7 3h10v7a5 5 0 0 1-10 0V3ZM4 5h3M17 5h3M7 21h10M12 15v6",
  gamepad: "M6 9h12a4 4 0 0 1 4 4c0 3-1.6 6-4 6-1.5 0-2.3-1-3-2h-6c-.7 1-1.5 2-3 2-2.4 0-4-3-4-6a4 4 0 0 1 4-4Zm2 3v4m-2-2h4m8-1h.01M15 15h.01",
  leaf: "M5 21c0-9 5-14 14-14 0 9-5 14-14 14Zm0 0c4-6 7-9 11-11",
  key: "M14 10a4 4 0 1 0-3.5 4L9 15.5V18H6.5v2H4v-2.5l6.5-6.5A4 4 0 0 1 14 10Zm1.5 1.5L21 6",
  cake: "M5 12h14v9H5v-9Zm0 0c0-2 1.5-3 3.5-3S12 10 12 12c0-2 1.5-3 3.5-3S19 10 19 12M12 6V4M12 9V7.5",
  gift: "M4 11h16v10H4V11Zm-1-4h18v4H3V7Zm9 0v14M8 7a2.5 2.5 0 1 1 2-4c1 1.2 2 4 2 4M16 7a2.5 2.5 0 1 0-2-4c-1 1.2-2 4-2 4",
  bike: "M5.5 18a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm13 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM9 11l4-7 3 8m-7-1 4 1 3-3 3.5 4M13 4h-2",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 3",
  ball: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-18c-2.5 2.4-4 5.6-4 9s1.5 6.6 4 9c2.5-2.4 4-5.6 4-9s-1.5-6.6-4-9ZM3.5 9h17M3.5 15h17",
  cat: "M4 5h16v9a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7V5ZM4 9H2m20 0h2M9 13h.01M15 13h.01M10 17h4",
  flower: "M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0-5c0-2-1-4-2.5-4S7 4.5 9.5 7m2.5 0c0-2 1-4 2.5-4S17 4.5 14.5 7M12 12c-2 0-4 1-4 2.5S9.5 17 12 14.5m0-2.5c2 0 4 1 4 2.5S14.5 17 12 14.5M12 14.5V21",
  anchor: "M12 21a8 8 0 0 0 8-8h-3M12 21a8 8 0 0 1-8-8h3m5 8V8m-3 0h6a3 3 0 1 0-6 0Z",
  ghost: "M5 21V11a7 7 0 0 1 14 0v10l-2.3-2-2.4 2-2.3-2-2.3 2-2.4-2L5 21ZM9.5 11h.01M14.5 11h.01"
};

// Deterministic PRNG so the tile is stable across runs.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260921);
const NAMES = Object.keys(DOODLES);
const SIZE = 620;
const BASE = 24; // doodles are drawn in a 24x24 box
const GAP = 14; // min space between doodle edges

const placed = []; // { x, y, r }
function fits(x, y, r) {
  for (const p of placed) {
    const dx = p.x - x;
    const dy = p.y - y;
    if (Math.hypot(dx, dy) < p.r + r + GAP) return false;
  }
  return true;
}

const parts = [];

// 1) Big doodles first (~56 icons, varied sizes like WhatsApp)
for (let i = 0; i < 340; i += 1) {
  if (placed.length >= 56) break;
  const s = 0.75 + rand() * 0.85; // 18px..38px effective
  const r = (BASE * s) / 2;
  const x = r + rand() * (SIZE - 2 * r);
  const y = r + rand() * (SIZE - 2 * r);
  if (!fits(x, y, r)) continue;
  placed.push({ x, y, r });
  const name = NAMES[Math.floor(rand() * NAMES.length)];
  const rot = Math.round(rand() * 56 - 28);
  parts.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)}) translate(-12 -12)"><path d="${DOODLES[name]}"/></g>`);
}

// 2) Small fillers: tiny doodles and outline circles squeezed between the big ones
for (let i = 0; i < 800; i += 1) {
  if (placed.length >= 160) break;
  const kind = rand();
  const s = kind < 0.7 ? 0.35 + rand() * 0.25 : 0.18 + rand() * 0.2; // small doodle or micro circle
  const r = (BASE * s) / 2;
  const x = r + rand() * (SIZE - 2 * r);
  const y = r + rand() * (SIZE - 2 * r);
  if (!fits(x, y, r)) continue;
  placed.push({ x, y, r });
  const rot = Math.round(rand() * 70 - 35);
  if (kind < 0.7) {
    const name = NAMES[Math.floor(rand() * NAMES.length)];
    parts.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)}) translate(-12 -12)"><path d="${DOODLES[name]}"/></g>`);
  } else {
    const cr = 1.5 + rand() * 3;
    parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${cr.toFixed(1)}"/>`);
  }
}

function build(stroke, opacity) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n${parts.join("\n")}\n</svg>\n`;
}

writeFileSync("public/chat-doodle-light.svg", build("#3a5a50", "0.15"));
writeFileSync("public/chat-doodle-dark.svg", build("#cfe3f2", "0.09"));
console.log(`ok: ${placed.length} elements, tile ${SIZE}px`);
