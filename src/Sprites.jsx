import * as THREE from "three";

/* ========== RANGLAR ========== */
const OUT = "#0b0716";

const BASE_PAL = {
  g: "#e2e8f0", G: "#94a3b8", d: "#475569", D: "#1e293b",
  w: "#b45309", W: "#78350f", y: "#fde68a", r: "#ef4444",
  c: "#67e8f9", l: "#38bdf8", p: "#27272a", P: "#3f3f46",
  h: "#ffffff", i: "#e0f2fe", I: "#7dd3fc", f: "#0c4a6e",
};

function darken(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

/* ========== QUROL SHAKLLARI (40x20) ========== */
const SHAPES = {
  pistol: [
    [4, 7, 22, 4, "g"], [4, 6, 22, 1, "h"], [26, 8, 4, 2, "d"],
    [2, 6, 3, 1, "y"], [22, 5, 3, 1, "y"], [6, 11, 6, 8, "p"],
    [7, 11, 4, 7, "P"], [9, 10, 4, 3, "d"], [13, 11, 1, 3, "d"],
    [14, 11, 4, 3, "D"], [6, 9, 16, 1, "a"], [11, 12, 2, 3, "D"],
  ],
  revolver: [
    [3, 6, 24, 5, "G"], [3, 5, 24, 1, "h"], [9, 9, 9, 7, "d"],
    [10, 8, 7, 1, "g"], [11, 10, 2, 3, "D"], [12, 13, 2, 2, "D"],
    [18, 8, 4, 3, "a"], [22, 8, 8, 3, "g"], [28, 9, 4, 2, "y"],
    [2, 8, 4, 2, "d"], [5, 11, 5, 9, "w"], [5, 11, 5, 1, "W"],
    [6, 15, 4, 1, "W"], [12, 12, 2, 4, "p"],
  ],
  deagle: [
    [3, 6, 24, 6, "g"], [3, 5, 24, 1, "h"], [8, 11, 6, 9, "d"],
    [9, 12, 4, 7, "D"], [6, 10, 4, 2, "p"], [22, 8, 6, 2, "d"],
    [2, 7, 3, 2, "y"], [10, 14, 3, 2, "a"], [5, 12, 3, 8, "p"],
    [24, 9, 4, 3, "a"],
  ],
  uzi: [
    [2, 6, 26, 5, "d"], [2, 6, 26, 1, "G"], [4, 4, 8, 2, "g"],
    [28, 7, 9, 2, "g"], [34, 6, 4, 4, "a"], [9, 11, 5, 8, "p"],
    [14, 11, 6, 3, "D"], [14, 13, 4, 2, "a"], [20, 10, 6, 2, "p"],
    [6, 10, 3, 1, "y"], [22, 3, 4, 2, "g"], [2, 11, 3, 3, "D"],
  ],
  smg: [
    [2, 7, 24, 4, "G"], [2, 7, 24, 1, "h"], [26, 8, 11, 2, "g"],
    [36, 8, 3, 2, "D"], [4, 11, 4, 8, "p"], [8, 11, 5, 7, "d"],
    [9, 18, 3, 1, "d"], [14, 11, 5, 3, "a"], [0, 8, 3, 4, "p"],
    [0, 8, 3, 1, "P"], [20, 4, 4, 3, "d"], [21, 3, 2, 1, "y"],
    [12, 11, 3, 2, "D"], [30, 9, 3, 1, "y"],
  ],
  p90: [
    [2, 8, 28, 5, "P"], [2, 8, 28, 1, "h"], [30, 9, 8, 2, "p"],
    [6, 13, 4, 6, "p"], [10, 13, 6, 3, "D"], [16, 11, 4, 2, "a"],
    [4, 6, 5, 2, "y"], [2, 12, 3, 1, "d"], [20, 6, 8, 2, "d"],
  ],
  pump: [
    [1, 8, 30, 2, "d"], [1, 7, 30, 1, "G"], [31, 7, 3, 4, "d"],
    [10, 10, 8, 4, "G"], [11, 10, 5, 1, "h"], [18, 11, 8, 3, "w"],
    [18, 11, 8, 1, "W"], [26, 11, 13, 5, "w"], [26, 11, 13, 1, "W"],
    [5, 12, 4, 6, "p"], [4, 6, 3, 1, "y"], [14, 13, 2, 2, "D"],
    [11, 14, 3, 2, "a"], [28, 15, 10, 1, "W"],
  ],
  ak: [
    [2, 6, 30, 4, "d"], [2, 5, 30, 1, "G"], [8, 9, 18, 2, "G"],
    [30, 7, 8, 2, "g"], [36, 7, 2, 2, "y"], [10, 3, 6, 2, "d"],
    [12, 4, 2, 1, "y"], [13, 10, 4, 8, "d"], [14, 11, 2, 6, "p"],
    [7, 10, 4, 7, "p"], [0, 8, 4, 5, "w"], [0, 8, 4, 1, "W"],
    [20, 9, 8, 3, "a"], [18, 12, 2, 2, "D"], [24, 6, 3, 1, "y"],
  ],
  m4: [
    [0, 7, 36, 4, "d"], [0, 6, 36, 1, "G"], [4, 9, 10, 2, "D"],
    [14, 11, 4, 7, "p"], [12, 4, 10, 3, "p"], [24, 8, 8, 2, "g"],
    [32, 8, 4, 2, "y"], [12, 12, 4, 3, "a"], [30, 10, 6, 4, "D"],
    [34, 4, 2, 3, "d"], [18, 13, 2, 4, "p"], [1, 7, 2, 2, "y"],
  ],
  famas: [
    [2, 7, 34, 5, "d"], [2, 6, 34, 1, "G"], [8, 12, 8, 4, "p"],
    [10, 12, 4, 7, "p"], [16, 12, 4, 6, "D"], [26, 9, 8, 3, "a"],
    [24, 5, 6, 2, "y"], [4, 4, 5, 2, "P"], [0, 8, 2, 2, "y"],
    [34, 8, 2, 2, "D"],
  ],
  sniper: [
    [1, 8, 34, 2, "d"], [1, 7, 28, 1, "G"], [34, 7, 6, 4, "D"],
    [6, 5, 12, 3, "p"], [6, 4, 12, 1, "g"], [4, 4, 2, 4, "D"],
    [18, 4, 2, 4, "D"], [9, 6, 6, 1, "c"], [12, 10, 6, 4, "G"],
    [6, 12, 4, 6, "p"], [16, 10, 3, 6, "p"], [22, 10, 8, 4, "w"],
    [22, 10, 8, 1, "W"], [24, 11, 6, 2, "a"], [2, 10, 2, 2, "D"],
  ],
  lmg: [
    [2, 6, 26, 6, "d"], [2, 6, 26, 1, "G"], [28, 8, 8, 3, "g"],
    [34, 8, 4, 3, "D"], [6, 12, 6, 6, "p"], [12, 12, 6, 4, "a"],
    [14, 10, 10, 2, "y"], [6, 3, 4, 3, "G"], [18, 11, 2, 6, "d"],
    [0, 9, 2, 4, "D"], [14, 6, 6, 1, "h"], [26, 14, 1, 5, "G"],
    [29, 14, 1, 5, "G"],
  ],
  minigun: [
    [4, 4, 18, 11, "d"], [6, 5, 14, 1, "h"], [22, 5, 6, 10, "D"],
    [24, 6, 2, 8, "a"], [22, 7, 6, 1, "G"], [28, 6, 8, 1, "g"],
    [28, 9, 8, 1, "g"], [28, 12, 8, 1, "g"], [2, 6, 2, 2, "G"],
    [6, 15, 4, 4, "p"], [12, 15, 4, 4, "p"], [10, 15, 2, 4, "d"],
    [1, 14, 4, 2, "y"], [0, 16, 6, 3, "r"],
  ],
  rpg: [
    [2, 6, 30, 6, "G"], [2, 6, 30, 1, "h"], [2, 11, 30, 1, "d"],
    [32, 5, 3, 8, "D"], [33, 7, 4, 4, "a"], [8, 4, 12, 2, "d"],
    [20, 4, 2, 2, "y"], [4, 12, 5, 6, "p"], [12, 12, 4, 4, "w"],
    [18, 12, 3, 4, "p"], [6, 2, 6, 3, "a"], [7, 3, 4, 1, "h"],
  ],
  bow: [
    [4, 4, 3, 12, "d"], [33, 4, 3, 12, "d"], [6, 9, 28, 1, "h"],
    [9, 10, 22, 3, "w"], [9, 10, 22, 1, "W"], [27, 7, 4, 4, "a"],
    [12, 13, 5, 3, "p"], [24, 13, 3, 3, "p"], [10, 8, 2, 2, "y"],
    [4, 4, 2, 1, "G"], [33, 4, 2, 1, "G"],
  ],
  plasma: [
    [2, 7, 28, 6, "p"], [2, 7, 28, 1, "P"], [30, 8, 8, 4, "a"],
    [33, 9, 5, 2, "c"], [6, 13, 5, 6, "p"], [14, 4, 8, 3, "c"],
    [16, 5, 4, 1, "h"], [10, 10, 3, 2, "c"], [8, 9, 8, 1, "a"],
    [20, 10, 6, 2, "P"], [2, 6, 4, 1, "c"],
  ],
  permafrost: [
    [2, 6, 30, 7, "f"], [2, 6, 30, 1, "l"], [4, 3, 12, 3, "i"],
    [6, 2, 4, 2, "h"], [9, 1, 2, 2, "I"], [32, 8, 6, 5, "I"],
    [36, 9, 4, 3, "i"], [33, 9, 2, 2, "h"], [8, 13, 5, 6, "p"],
    [16, 13, 6, 4, "I"], [17, 14, 4, 2, "c"], [24, 7, 6, 2, "c"],
    [10, 10, 5, 2, "i"], [20, 8, 4, 4, "I"],
  ],
};

export function WeaponSprite({ shape = "pistol", accent = "#ffffff", px = 4 }) {
  const parts = SHAPES[shape] || SHAPES.pistol;
  const pal = { ...BASE_PAL, a: accent, A: darken(accent, 0.55) };
  const outlines = parts.map(([x, y, w, h], i) => (
    <rect key={`o${i}`} x={x - 1} y={y - 1} width={w + 2} height={h + 2} fill={OUT} />
  ));
  const fills = parts.map(([x, y, w, h, c], i) => (
    <rect key={`f${i}`} x={x} y={y} width={w} height={h} fill={pal[c] || accent} />
  ));
  return (
    <svg
      viewBox="0 0 40 20"
      width={40 * px}
      height={20 * px}
      shapeRendering="crispEdges"
      style={{ display: "block", imageRendering: "pixelated" }}
    >
      {outlines}
      {fills}
    </svg>
  );
}

/* ========== ZOMBI KADRLARI ========== */
const ZOMBIE_A = [
  "....kkkkkk....",
  "...kggggggk...",
  "..kggggggggk..",
  "..kgwrggrwgk..",
  "..kggggggggk..",
  "..kgGknnkGgk..",
  "...kTTTTTTk...",
  "...kbbbbbbk...",
  ".kgbbsbbsbbgk.",
  ".kgbbbbxbbbgk.",
  ".kgbbsbbbbbgk.",
  "...kBBBBBBk...",
  "...kpppkpppk..",
  "...kPPPkPPPk..",
  "...kPkk.kkPk..",
  "...kffk.kffk..",
];

const ZOMBIE_B = [
  "....kkkkkk....",
  "...kggggggk...",
  "..kggggggggk..",
  "..kgwrggrwgk..",
  "..kggggggggk..",
  "..kgGknnkGgk..",
  "...kTTTTTTk...",
  "...kbbbbbbk...",
  ".kgbbsbbsbbgk.",
  ".kgbbbbxbbbgk.",
  ".kgbbsbbbbbgk.",
  "...kBBBBBBk...",
  "..kpppk.kpppk.",
  "..kPPPk.kPPPk.",
  "...kPk..kkPk..",
  "..kffk...kffk.",
];

const ZOMBIE_PAL = {
  normal: {
    k: "#0b0716", g: "#7bbf5a", G: "#4a7d35", w: "#f8fafc", r: "#dc2626",
    n: "#1a0d0d", T: "#f1f5f9", b: "#3b4d6b", s: "#52688f", B: "#27334a",
    x: "#7f1d1d", p: "#2e2a4a", P: "#1c1830", f: "#1a0d0d",
  },
  fast: {
    k: "#0b0716", g: "#c4f562", G: "#84c23a", w: "#fefce8", r: "#16a34a",
    n: "#1a0d0d", T: "#f1f5f9", b: "#7c2d2d", s: "#a33b3b", B: "#4a1a1a",
    x: "#450a0a", p: "#2b1d3d", P: "#1a1028", f: "#1a0d0d",
  },
  tank: {
    k: "#0b0716", g: "#94a38a", G: "#56664a", w: "#f8fafc", r: "#facc15",
    n: "#1a0d0d", T: "#e2e8f0", b: "#2f3d2c", s: "#44583f", B: "#1d2719",
    x: "#7f1d1d", p: "#262a33", P: "#14171f", f: "#0f1110",
  },
};

/* ========== SKELET VA BOSSLAR (16x16) ========== */
const ENEMY_ART = {
  skeleton: [
    "...kkkkkk",
    "..kbbbbbbk",
    ".kbbbbbbbbk",
    ".kbeebbeebk",
    ".kbbbbbbbbk",
    "..kbkkkkbk",
    "...kbbbbk",
    "..kkbkbbkbkk",
    ".kbbkbbbbkbbk",
    ".kbbkbbbbkbbk",
    "..kkbkbbkkk",
    "...kbbbbk",
    "..kbk..kbk",
    "..kbk..kbk",
    ".kkkk..kkkk",
  ],
  necro: [
    "....kkkkkk....",
    "...kppppppk..W",
    "..kppppppppk.W",
    "..kpgpppgpk..W",
    "..kppppppppk.W",
    "..kpwwwwwwpk.W",
    "..kppkkkkppk.W",
    "...kPppppPk..W",
    "..kPPPPPPPPk.W",
    ".kPPPPPPPPPPk.",
    ".kPPPPPPPPPPk.",
    ".kPPPPPPPPPPk.",
    "..kPPPPPPPPk..",
    "..kPPPPPPPPk..",
    "..kkkkkkkkkk..",
  ],
  frost: [
    "...kkkkkkkk...",
    "..kiiiiiiiik..",
    ".kiiwiiiiwiik.",
    ".kiiiiiiiiiik",
    "kIiiiiiiiiiIk",
    "kIIiiiiiiiIIk",
    "kIIIiiiiiiIIk",
    "kIIIIiiiiIIIk",
    "kIIIIIIIIIIIk",
    "..kIIIIIIIIk..",
    "..kIIfIIfIIk..",
    "..kIfIIIIfIk..",
    "...kffk.kffk.",
    "...kffk.kffk.",
    "..kkkk...kkkk",
  ],
  demon: [
    "hh.kkkkkkk.hh.",
    ".hkrrrrrrrkh..",
    "..kryrrryrk...",
    "..krrrrrrrk...",
    "..krRRRRRrk...",
    "...kRkkkRk....",
    "..krrrrrrrk...",
    ".krrrrrrrrrk..",
    ".krrRRRRRrrk..",
    ".krrRRRRRrrk..",
    "..krrrrrrrk...",
    "..krr.kr.rk...",
    "..kkk...kkk...",
  ],
  spider: [
    "l.l.kkkkkk.l.l",
    ".l.kBBBBBBk.l.",
    "l.kBBrBBrBBk.l",
    ".kBBBBBBBBBk..",
    "kBBrBBBBrBBBk.",
    "kBBBBBBBBBBBk.",
    "kkBBBBBBBBBBkk",
    ".kBBBBBBBBBk..",
    "l.kbbbbbbbbk.l",
    ".lkbbbbbbbbkl.",
    "l.kbbbbbbbbk.l",
    ".l.kkkkkkkk.l.",
  ],
  knight: [
    "...kkkkkkkk...",
    "..kAAAAAAAAk..",
    "..kAAAAAAAAk..",
    "..kAvvvvvvAk..",
    "..kAAAAAAAAk..",
    "ccckAyAAAAyAkcc",
    "ccckAAAAAAAkccc",
    "ccckaaaaaakccc",
    "ccckaaaaaakccc",
    "..ckaAaaAakc..",
    "...kAAkkAAk...",
    "...kAk..kAk...",
    "...kAk..kAk...",
    "..kkkk..kkkk..",
  ],
};

const ENEMY_PAL = {
  skeleton: { k: "#0b0716", b: "#e5e7eb", e: "#dc2626" },
  necro: { k: "#0b0716", p: "#581c87", P: "#3b0764", g: "#4ade80", w: "#e5e7eb", W: "#78350f" },
  frost: { k: "#0b0716", i: "#bae6fd", I: "#38bdf8", f: "#0ea5e9", w: "#ffffff" },
  demon: { k: "#0b0716", r: "#b91c1c", R: "#7f1d1d", y: "#facc15", h: "#1f2937" },
  spider: { k: "#0b0716", b: "#1f2937", B: "#374151", r: "#dc2626", l: "#6b7280" },
  knight: { k: "#0b0716", A: "#334155", a: "#64748b", c: "#7f1d1d", v: "#0b0716", y: "#facc15" },
};

const PROJ_ART = {
  bone: [
    "..kk.kk.",
    ".kbbkbbk",
    "kbbbbbbk",
    ".kbbbbk.",
    ".kbbbbk.",
    "kbbbbbbk",
    ".kbbkbbk",
    "..kk.kk.",
  ],
  fire: [
    "..kkkk..",
    ".kffffk.",
    "kffyyffk",
    "kfyyyyfk",
    "kfyyyyfk",
    "kffyyffk",
    ".kffffk.",
    "..kkkk..",
  ],
  ice: [
    "...kk...",
    "..kiik..",
    ".kiiiik.",
    "kiiwiiik",
    "kiiiiiik",
    ".kIIIIk.",
    "..kIIk..",
    "...kk...",
  ],
};
const PROJ_PAL = {
  bone: { k: "#0b0716", b: "#f5f5f4" },
  fire: { k: "#0b0716", f: "#f97316", y: "#fde047" },
  ice: { k: "#0b0716", i: "#7dd3fc", I: "#0ea5e9", w: "#ffffff" },
};

const cache = {};

function paint(rows, pal, w = 16) {
  const h = rows.length;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  rows.forEach((row, y) => {
    [...row.padEnd(w, ".")].forEach((ch, x) => {
      const col = pal[ch];
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    });
  });
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function getZombieFrames(type) {
  const key = `z-${type}`;
  if (!cache[key]) {
    const pal = ZOMBIE_PAL[type] || ZOMBIE_PAL.normal;
    cache[key] = [paint(ZOMBIE_A, pal), paint(ZOMBIE_B, pal)];
  }
  return cache[key];
}

export function getEnemyTex(key) {
  const k = `e-${key}`;
  if (!cache[k]) cache[k] = paint(ENEMY_ART[key] || ENEMY_ART.skeleton, ENEMY_PAL[key] || ENEMY_PAL.skeleton);
  return cache[k];
}

export function getProjTex(kind) {
  const k = `p-${kind}`;
  if (!cache[k]) cache[k] = paint(PROJ_ART[kind] || PROJ_ART.bone, PROJ_PAL[kind] || PROJ_PAL.bone, 8);
  return cache[k];
}

export function getTileTexture() {
  if (!cache.tile) {
    const size = 16;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#3a3f8f";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#4a51a8";
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if ((x * 3 + y * 5) % 17 === 0) ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.fillStyle = "#2a2f70";
    ctx.fillRect(0, 0, size, 1);
    ctx.fillRect(0, 0, 1, size);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(12, 12);
    cache.tile = t;
  }
  return cache.tile;
}