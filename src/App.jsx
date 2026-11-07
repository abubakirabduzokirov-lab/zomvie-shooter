import { Component, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import "./App.css";
import { WeaponSprite, getZombieFrames, getEnemyTex, getProjTex, getTileTexture } from "./Sprites";

/* ========== MA'LUMOTLAR ========== */

const DMG_MAX = 150;
const RATE_MAX = 20;
const MAG_MAX = 100;

const WEAPONS = {
  pistol: { name: "Pistolet", shape: "pistol", price: 0, damage: 25, delay: 350, auto: false, mag: 12, reload: 1000, color: "#94a3b8", adsFov: 55, spread: 0.012 },
  revolver: { name: "Revolver", shape: "revolver", price: 300, damage: 50, delay: 600, auto: false, mag: 6, reload: 1400, color: "#f59e0b", adsFov: 55, spread: 0.01 },
  glock: { name: "Glock", shape: "pistol", price: 500, damage: 30, delay: 220, auto: false, mag: 17, reload: 1100, color: "#38bdf8", adsFov: 55, spread: 0.014 },
  deagle: { name: "Deagle", shape: "deagle", price: 900, damage: 60, delay: 450, auto: false, mag: 7, reload: 1300, color: "#f43f5e", adsFov: 55, spread: 0.012 },

  smg: { name: "Avtomat (SMG)", shape: "smg", price: 800, damage: 12, delay: 90, auto: true, mag: 30, reload: 1300, color: "#facc15", adsFov: 55, spread: 0.035 },
  uzi: { name: "Uzi", shape: "uzi", price: 1100, damage: 14, delay: 70, auto: true, mag: 32, reload: 1400, color: "#a3e635", adsFov: 55, spread: 0.035 },
  mp5: { name: "MP5", shape: "smg", price: 1400, damage: 16, delay: 100, auto: true, mag: 30, reload: 1300, color: "#22d3ee", adsFov: 50, spread: 0.025 },
  vector: { name: "Vector", shape: "smg", price: 1900, damage: 13, delay: 60, auto: true, mag: 25, reload: 1200, color: "#e879f9", adsFov: 52, spread: 0.03 },
  p90: { name: "P90", shape: "p90", price: 2200, damage: 15, delay: 70, auto: true, mag: 50, reload: 1600, color: "#fb7185", adsFov: 52, spread: 0.03 },

  pump: { name: "Miltiq", shape: "pump", price: 1500, damage: 14, pellets: 6, delay: 800, auto: false, mag: 6, reload: 1800, color: "#f97316", adsFov: 55, spread: 0.09 },
  sawed: { name: "Qisqa miltiq", shape: "pump", price: 1800, damage: 16, pellets: 6, delay: 650, auto: false, mag: 2, reload: 1500, color: "#ef4444", adsFov: 55, spread: 0.11 },
  auto12: { name: "Auto-12", shape: "pump", price: 2800, damage: 10, pellets: 4, delay: 250, auto: true, mag: 8, reload: 2000, color: "#fb923c", adsFov: 55, spread: 0.07 },

  ak: { name: "AK-47", shape: "ak", price: 2500, damage: 34, delay: 130, auto: true, mag: 30, reload: 1500, color: "#22c55e", adsFov: 48, spread: 0.02 },
  m4: { name: "M4", shape: "m4", price: 3000, damage: 40, delay: 150, auto: true, mag: 30, reload: 1500, color: "#84cc16", adsFov: 48, spread: 0.02 },
  famas: { name: "Famas", shape: "famas", price: 3400, damage: 45, delay: 180, auto: true, mag: 25, reload: 1500, color: "#14b8a6", adsFov: 48, spread: 0.02 },
  g3: { name: "G3", shape: "ak", price: 3800, damage: 60, delay: 260, auto: true, mag: 20, reload: 1700, color: "#0ea5e9", adsFov: 48, spread: 0.02 },
  scar: { name: "SCAR", shape: "ak", price: 4200, damage: 55, delay: 200, auto: true, mag: 20, reload: 1600, color: "#6366f1", adsFov: 48, spread: 0.02 },

  sniper: { name: "Snayper", shape: "sniper", price: 5000, damage: 120, delay: 1200, auto: false, mag: 5, reload: 2000, color: "#94a3b8", adsFov: 16, spread: 0.004, scope: true },
  awp: { name: "AWP", shape: "sniper", price: 7000, damage: 150, delay: 1500, auto: false, mag: 5, reload: 2200, color: "#fbbf24", adsFov: 14, spread: 0.003, scope: true },
  barrett: { name: "Barrett", shape: "sniper", price: 9000, damage: 140, delay: 1000, auto: false, mag: 10, reload: 2400, color: "#a855f7", adsFov: 15, spread: 0.004, scope: true },

  mg: { name: "Pulemyot", shape: "lmg", price: 6000, damage: 30, delay: 110, auto: true, mag: 60, reload: 2600, color: "#64748b", adsFov: 50, spread: 0.03 },
  minigun: { name: "Minigun", shape: "minigun", price: 12000, damage: 18, delay: 50, auto: true, mag: 100, reload: 3500, color: "#ef4444", adsFov: 52, spread: 0.045 },

  rpg: { name: "RPG", shape: "rpg", price: 8000, damage: 150, delay: 1400, auto: false, mag: 1, reload: 2000, color: "#f59e0b", adsFov: 50, spread: 0.005 },
  grenade: { name: "Granata otar", shape: "rpg", price: 10000, damage: 110, delay: 900, auto: false, mag: 4, reload: 2200, color: "#10b981", adsFov: 50, spread: 0.01 },

  crossbow: { name: "Arbalet", shape: "bow", price: 4500, damage: 90, delay: 900, auto: false, mag: 1, reload: 1200, color: "#b45309", adsFov: 30, spread: 0.004 },
  compound: { name: "Kompozit kamon", shape: "bow", price: 5500, damage: 75, delay: 550, auto: false, mag: 3, reload: 900, color: "#065f46", adsFov: 30, spread: 0.006 },

  plasma: { name: "Plazma", shape: "plasma", price: 11000, damage: 40, delay: 300, auto: true, mag: 20, reload: 1800, color: "#c084fc", adsFov: 50, spread: 0.012 },
  railgun: { name: "Relsa", shape: "plasma", price: 15000, damage: 130, delay: 1100, auto: false, mag: 6, reload: 2400, color: "#67e8f9", adsFov: 30, spread: 0.004, scope: true },
  tesla: { name: "Tesla", shape: "plasma", price: 17000, damage: 65, delay: 400, auto: false, mag: 15, reload: 2000, color: "#fde047", adsFov: 50, spread: 0.02 },
  permafrost: { name: "Permafrost", shape: "permafrost", price: 9000, damage: 28, delay: 260, auto: true, mag: 40, reload: 2000, color: "#67e8f9", adsFov: 50, spread: 0.03, freeze: 2500 },
};

const WEAPON_ORDER = Object.keys(WEAPONS);
const OLD_KEYS = { ar: "ak", shotgun: "pump" };

/* Stick-figure avatarlar (o'zimizning dizayn, boshqa kanal personajlari emas) */
const AVATARS = {
  classic: { name: "Klassik", price: 0, body: "#f8fafc", hat: null },
  red: { name: "Qizil qahramon", price: 500, body: "#ef4444", hat: "cap" },
  blue: { name: "Ko'k tez", price: 800, body: "#38bdf8", hat: "helmet" },
  gold: { name: "Oltin shoh", price: 1500, body: "#fbbf24", hat: "crown" },
  shadow: { name: "Soya", price: 2000, body: "#818cf8", hat: "hood" },
  neon: { name: "Neon", price: 3000, body: "#a3e635", hat: "antenna" },
};
const AVATAR_ORDER = Object.keys(AVATARS);

const ZOMBIES = {
  normal: { hp: 1, speed: 1.6, dmg: 10, value: 10, size: 1 },
  fast: { hp: 0.7, speed: 3.2, dmg: 8, value: 15, size: 0.9 },
  tank: { hp: 3, speed: 1.0, dmg: 20, value: 40, size: 1.4 },
  skeleton: { hp: 0.8, speed: 1.3, dmg: 0, value: 25, size: 1.05, enemy: true, ranged: { cd: 2.6, dmg: 12, range: 9, minRange: 5 } },
};

/* Bosslar: har 5-levelda. Navbat bilan almashadi. */
const BOSSES = [
  { key: "necro", name: "NEKROMANSER", speed: 0.7, summon: { type: "normal", count: 3, every: 6 }, fire: null },
  { key: "frost", name: "MUZ TITAN", speed: 0.6, summon: null, fire: { kind: "ice", dmg: 12, every: 2.5, slow: true } },
  { key: "demon", name: "OLOV IBLISI", speed: 0.9, summon: null, fire: { kind: "fire", dmg: 18, every: 2 } },
  { key: "spider", name: "ZAHAR O'RGIMCHAK", speed: 1.1, summon: { type: "fast", count: 2, every: 5 }, fire: null },
  { key: "knight", name: "QORA RITSAR", speed: 0.9, summon: { type: "skeleton", count: 2, every: 8 }, fire: { kind: "bone", dmg: 15, every: 3 } },
];

const CHAPTER_NAMES = [
  "Ilk qadamlar",
  "Qorong'i shahar",
  "Zaharli tuman",
  "Yo'qolgan qishloq",
  "Temir qal'a",
  "Qonli ko'chalar",
  "Sahro yo'llari",
  "Muzlik",
  "Tungi qal'a",
  "Oxirgi kun",
];

function levelConfig(chapter, level) {
  const idx = (chapter - 1) * 10 + level;
  const isBoss = idx % 5 === 0;
  const bossN = idx / 5 - 1;
  return {
    total: 6 + Math.floor(idx * 0.6),
    maxAlive: Math.min(4 + Math.floor(idx / 12), 14),
    baseHp: 50 + idx * 4,
    spawnDelay: Math.max(600, 1800 - idx * 12),
    fastChance: chapter >= 3 ? Math.min(0.15 + idx * 0.005, 0.5) : 0,
    tankChance: chapter >= 6 ? Math.min(0.05 + idx * 0.003, 0.25) : 0,
    skelChance: chapter >= 2 ? 0.2 : 0,
    reward: 100 + chapter * 20 + level * 5,
    boss: isBoss ? BOSSES[((bossN % 5) + 5) % 5] : null,
    bossHp: isBoss ? 1500 + bossN * 500 : 0,
  };
}

/* ========== O'YIN MUHITI ========== */

const ARENA = 45;
const WALK_R = 38;
const RANGE = 90;
const PROJ_MAX = 60;
const PILLARS = [[8, 8], [-10, 7], [12, -9], [-7, -12], [18, 6], [-16, -6], [4, -18], [-21, 14]];

const clampDt = (dt) => Math.min(dt, 0.05);

const zidOf = (o) => {
  while (o) {
    if (o.userData.zid !== undefined) return o.userData.zid;
    o = o.parent;
  }
  return null;
};

function pickType(cfg) {
  const r = Math.random();
  if (r < cfg.tankChance) return "tank";
  if (r < cfg.tankChance + cfg.fastChance) return "fast";
  if (r < cfg.tankChance + cfg.fastChance + cfg.skelChance) return "skeleton";
  return "normal";
}

function spawnPoint() {
  const a = Math.random() * Math.PI * 2;
  return { x: Math.cos(a) * 24, z: Math.sin(a) * 24 };
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) || "ontouchstart" in window;
}
const TOUCH = isTouchDevice();

/* ========== SAHNA ========== */

function Sky() {
  const dome = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#03020a");
    gr.addColorStop(0.55, "#120c2a");
    gr.addColorStop(1, "#3b1d5e");
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <>
      <mesh>
        <sphereGeometry args={[140, 24, 16]} />
        <meshBasicMaterial map={dome} side={THREE.BackSide} fog={false} depthWrite={false} />
      </mesh>
      <Stars radius={90} depth={50} count={1200} factor={4} saturation={0} fade speed={0.6} />
      <mesh position={[-45, 42, -80]}>
        <sphereGeometry args={[4.5, 20, 20]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[-45, 42, -81]}>
        <sphereGeometry args={[8, 20, 20]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.12} />
      </mesh>
    </>
  );
}

function Arena() {
  const tile = getTileTexture();
  return (
    <group>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[ARENA * 0.9, ARENA * 0.95, 0.6, 48]} />
        <meshStandardMaterial color="#2b2f6e" metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[ARENA * 0.9, 48]} />
        <meshStandardMaterial map={tile} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[ARENA * 0.88, ARENA * 0.92, 48]} />
        <meshBasicMaterial color="#e11d48" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Sparks({ fxRef }) {
  const N = 120;
  const { geo, pos, col, vel, life } = useMemo(() => {
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geo, pos, col, vel: new Float32Array(N * 3), life: new Float32Array(N) };
  }, []);
  const next = useRef(0);

  useEffect(() => {
    fxRef.current.spawn = (x, y, z, color, count) => {
      const c = new THREE.Color(color);
      for (let n = 0; n < count; n++) {
        const i = next.current;
        next.current = (next.current + 1) % N;
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
        vel[i * 3] = (Math.random() - 0.5) * 4;
        vel[i * 3 + 1] = Math.random() * 3 + 1;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 4;
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
        life[i] = 0.5 + Math.random() * 0.4;
      }
      geo.attributes.color.needsUpdate = true;
    };
    return () => {
      fxRef.current.spawn = null;
    };
  }, [fxRef, geo, pos, col, vel, life]);

  useFrame((_, dt) => {
    const d = clampDt(dt);
    for (let i = 0; i < N; i++) {
      if (life[i] <= 0) continue;
      life[i] -= d;
      vel[i * 3 + 1] -= 9 * d;
      pos[i * 3] += vel[i * 3] * d;
      pos[i * 3 + 1] += vel[i * 3 + 1] * d;
      pos[i * 3 + 2] += vel[i * 3 + 2] * d;
      if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 0;
      if (life[i] <= 0) pos[i * 3 + 1] = -999;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points geometry={geo}>
      <pointsMaterial size={0.14} vertexColors transparent opacity={0.95} depthWrite={false} sizeAttenuation />
    </points>
  );
}

/* Suyak va olov/muz o'qlari: oldindan yaratilgan pool */
function Projectiles({ projRef, playerRef, dmgRef, slowRef }) {
  const sprites = useRef([]);
  const texes = useMemo(
    () => ({ bone: getProjTex("bone"), fire: getProjTex("fire"), ice: getProjTex("ice") }),
    []
  );

  useFrame((_, dt) => {
    const d = clampDt(dt);
    const p = playerRef.current;
    const list = projRef.current;
    for (let i = 0; i < list.length; i++) {
      const pr = list[i];
      const sp = sprites.current[i];
      if (pr.active) {
        pr.t += d;
        if (pr.kind === "bone") {
          const tx = pr.phase === 0 ? pr.tx : pr.owner.x;
          const tz = pr.phase === 0 ? pr.tz : pr.owner.z;
          const dx = tx - pr.x;
          const dz = tz - pr.z;
          const dd = Math.hypot(dx, dz);
          if (pr.phase === 0 && dd < 0.6) pr.phase = 1;
          else if (pr.phase === 1 && dd < 1) pr.active = false;
          else if (dd > 0) {
            pr.x += (dx / dd) * 9 * d;
            pr.z += (dz / dd) * 9 * d;
          }
          pr.rot += d * 18;
          if (pr.t > 8) pr.active = false;
        } else {
          pr.x += pr.vx * d;
          pr.z += pr.vz * d;
          if (pr.t > pr.life || Math.abs(pr.x) > ARENA || Math.abs(pr.z) > ARENA) pr.active = false;
        }
        if (pr.active && !pr.hit && Math.hypot(pr.x - p.x, pr.z - p.z) < 0.7) {
          dmgRef.current += pr.dmg;
          if (pr.slow) slowRef.current = performance.now() + 1800;
          pr.hit = true;
          if (pr.kind !== "bone") pr.active = false;
        }
      }
      if (sp) {
        sp.visible = pr.active;
        if (pr.active) {
          if (sp.userData.kind !== pr.kind) {
            sp.userData.kind = pr.kind;
            sp.material.map = texes[pr.kind];
            sp.material.needsUpdate = true;
          }
          sp.position.set(pr.x, 1.1, pr.z);
          sp.material.rotation = pr.kind === "bone" ? pr.rot : 0;
        }
      }
    }
  });

  return (
    <group>
      {projRef.current.map((_, i) => (
        <sprite
          key={i}
          ref={(el) => { sprites.current[i] = el; }}
          scale={[0.8, 0.8, 1]}
          visible={false}
          userData={{ kind: null }}
        >
          <spriteMaterial transparent alphaTest={0.2} />
        </sprite>
      ))}
    </group>
  );
}

const SKIN = "#ef4468";
const FACE = "#f3d3b0";
const HAIR = "#1c1a1f";
const BLACK = "#14101a";
const BELT = "#f5f5f5";

function Arm({ side }) {
  return (
    <group position={[side * 0.4, 1.32, 0]} rotation={[0, 0, side * 0.12]}>
      <mesh position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.09, 0.22, 6, 10]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <group position={[0, -0.42, 0]}>
        <mesh position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.08, 0.2, 6, 10]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
        <mesh position={[0, -0.36, 0]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={BLACK} />
        </mesh>
      </group>
    </group>
  );
}

function Leg({ side }) {
  return (
    <group position={[side * 0.14, 0.9, 0]}>
      <mesh position={[0, -0.24, 0]}>
        <capsuleGeometry args={[0.11, 0.26, 6, 10]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <group position={[0, -0.48, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.09, 0.22, 6, 10]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
        <mesh position={[0, -0.44, 0.04]}>
          <boxGeometry args={[0.14, 0.1, 0.26]} />
          <meshStandardMaterial color={BLACK} />
        </mesh>
      </group>
    </group>
  );
}

function Hero({ groupRef }) {
  return (
    <group ref={groupRef} visible={false}>
      <mesh position={[0, 1.15, 0]} scale={[1, 1.25, 0.75]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.285, 0.27, 0.09, 16]} />
        <meshStandardMaterial color={BELT} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={FACE} />
      </mesh>
      <mesh position={[0, 1.71, -0.01]} scale={[1.02, 0.55, 1.05]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={HAIR} />
      </mesh>
      <mesh position={[-0.07, 1.6, 0.18]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      <mesh position={[0.07, 1.6, 0.18]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      <Arm side={-1} />
      <Arm side={1} />
      <Leg side={-1} />
      <Leg side={1} />
    </group>
  );
}

/* Oddiy zombi va skelet. Skelet uzoqdan suyak otadi. */
function Zombie({ z, aimed, playerRef, dmgRef, freezeRef, apiRef }) {
  const group = useRef();
  const spriteRef = useRef();
  const matRef = useRef();
  const pos = useRef(new THREE.Vector3(z.x, 0, z.z));
  const cd = useRef(0);
  const t = ZOMBIES[z.type];
  const frames = t.enemy ? [getEnemyTex(z.type), getEnemyTex(z.type)] : getZombieFrames(z.type);
  const phase = useRef(Math.random() * 2);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const d_ = clampDt(dt);
    const frozen = (freezeRef.current.get(z.id) || 0) > performance.now();
    const sp = t.speed * (frozen ? 0.35 : 1);
    const p = playerRef.current;
    const dx = p.x - pos.current.x;
    const dz = p.z - pos.current.z;
    const d = Math.hypot(dx, dz) || 0.001;
    const rg = t.ranged;

    if (rg) {
      if (d > rg.range) {
        pos.current.x += (dx / d) * sp * d_;
        pos.current.z += (dz / d) * sp * d_;
      } else if (d < rg.minRange) {
        pos.current.x -= (dx / d) * sp * 0.8 * d_;
        pos.current.z -= (dz / d) * sp * 0.8 * d_;
      }
      cd.current += d_;
      if (cd.current >= rg.cd && d <= rg.range + 3) {
        cd.current = 0;
        apiRef.current.fire("bone", pos.current.x, pos.current.z, pos.current, rg.dmg, false);
      }
    } else if (d > 1.1) {
      pos.current.x += (dx / d) * sp * d_;
      pos.current.z += (dz / d) * sp * d_;
    } else {
      dmgRef.current += t.dmg * d_;
    }
    g.position.copy(pos.current);

    const time = state.clock.elapsedTime + phase.current;
    if (matRef.current) {
      if (!t.enemy) {
        const f = Math.floor(time * 4) % 2;
        if (matRef.current.map !== frames[f]) {
          matRef.current.map = frames[f];
          matRef.current.needsUpdate = true;
        }
      }
      matRef.current.color.set(frozen ? "#7dd3fc" : "#ffffff");
    }
    if (spriteRef.current) {
      spriteRef.current.position.y = 0.8 + Math.abs(Math.sin(time * 8)) * 0.05;
    }
  });

  return (
    <group ref={group} position={[z.x, 0, z.z]} scale={t.size} userData={{ zid: z.id }}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.45, 12]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <sprite ref={spriteRef} position={[0, 0.8, 0]} scale={[1.4, 1.6, 1]}>
        <spriteMaterial ref={matRef} map={frames[0]} transparent alphaTest={0.5} />
      </sprite>
      {aimed && (
        <Html position={[0, 1.9, 0]} center>
          <div className="hp-tag">
            {Math.max(0, Math.ceil(z.hp))} / {z.maxHp} HP
          </div>
        </Html>
      )}
    </group>
  );
}

/* Boss: o'z qobiliyatlarini ishlatadi (zombi chaqirish yoki o'q otish) */
function Boss({ def, posRef, playerRef, apiRef, dmgRef }) {
  const group = useRef();
  const spriteRef = useRef();
  const matRef = useRef();
  const tex = getEnemyTex(def.key);
  const tm = useRef({ t: 0, summon: 0, fire: 0, flash: 0 });

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const d_ = clampDt(dt);
    const p = playerRef.current;
    const pos = posRef.current;
    const dx = p.x - pos.x;
    const dz = p.z - pos.z;
    const d = Math.hypot(dx, dz) || 0.001;
    const sp = def.speed * 1.6;
    if (d > 7) {
      pos.x += (dx / d) * sp * d_;
      pos.z += (dz / d) * sp * d_;
    } else if (d < 4) {
      pos.x -= (dx / d) * sp * d_;
      pos.z -= (dz / d) * sp * d_;
    }
    const rr = Math.hypot(pos.x, pos.z);
    if (rr > WALK_R - 2) {
      pos.x = (pos.x * (WALK_R - 2)) / rr;
      pos.z = (pos.z * (WALK_R - 2)) / rr;
    }
    g.position.set(pos.x, 0, pos.z);

    const s = tm.current;
    s.t += d_;
    if (def.summon && s.t - s.summon >= def.summon.every) {
      s.summon = s.t;
      s.flash = 0.4;
      apiRef.current.summon(def.summon.type, def.summon.count, pos.x, pos.z);
    }
    if (def.fire && s.t - s.fire >= def.fire.every) {
      s.fire = s.t;
      s.flash = 0.25;
      apiRef.current.fire(def.fire.kind, pos.x, pos.z, pos, def.fire.dmg, def.fire.slow);
    }
    if (d < 2.2) dmgRef.current += 18 * d_;

    s.flash = Math.max(0, s.flash - d_);
    if (matRef.current) matRef.current.color.set(s.flash > 0 ? "#fca5a5" : "#ffffff");
    if (spriteRef.current) spriteRef.current.position.y = 1.5 + Math.sin(s.t * 3) * 0.08;
  });

  return (
    <group ref={group} position={[posRef.current.x, 0, posRef.current.z]} userData={{ zid: 0 }}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.2, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <sprite ref={spriteRef} position={[0, 1.5, 0]} scale={[2.8, 2.8, 1]}>
        <spriteMaterial ref={matRef} map={tex} transparent alphaTest={0.5} />
      </sprite>
    </group>
  );
}

/* Kamera, harakat, moljal, nishon tekshiruvi va otish */
function Rig({ R, weapon, setAds, setAimed }) {
  const { camera, scene } = useThree();
  const bodyRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const adsShown = useRef(false);
  const fovNow = useRef(70);

  useFrame((_, rawDt) => {
    const dt = clampDt(rawDt);
    const k = R.keys.current;
    const st = R.stick.current;
    const p = R.player.current;
    const yaw = R.yaw.current;
    const pitch = R.pitch.current;
    const sy = Math.sin(yaw);
    const cy = Math.cos(yaw);
    const aim = R.aiming.current;
    const slowF = performance.now() < R.slow.current ? 0.5 : 1;

    let mx = 0, mz = 0;
    if (k.KeyW) { mx -= sy; mz -= cy; }
    if (k.KeyS) { mx += sy; mz += cy; }
    if (k.KeyD) { mx += cy; mz -= sy; }
    if (k.KeyA) { mx -= cy; mz += sy; }
    mx += cy * st.x - sy * st.y;
    mz += -sy * st.x - cy * st.y;

    const len = Math.hypot(mx, mz);
    if (len > 0) {
      const s = (Math.min(1, len) / len) * (aim ? 2.8 : 5) * slowF * dt;
      let nx = p.x + mx * s;
      let nz = p.z + mz * s;
      const rr = Math.hypot(nx, nz);
      if (rr > WALK_R) {
        nx = (nx * WALK_R) / rr;
        nz = (nz * WALK_R) / rr;
      }
      p.x = nx;
      p.z = nz;
    }

    const dir = new THREE.Vector3(-sy * Math.cos(pitch), Math.sin(pitch), -cy * Math.cos(pitch));
    const eye = new THREE.Vector3(p.x, 1.6, p.z);
    const tp = R.tp.current;
    const camPos = tp ? eye.clone().add(new THREE.Vector3(sy * 3.5, 0.8, cy * 3.5)) : eye.clone();
    camera.position.copy(camPos);
    camera.lookAt(eye.clone().add(dir.clone().multiplyScalar(50)));

    const fovTarget = aim ? weapon.adsFov : 70;
    fovNow.current += (fovTarget - fovNow.current) * Math.min(1, dt * 12);
    if (Math.abs(camera.fov - fovNow.current) > 0.01) {
      camera.fov = fovNow.current;
      camera.updateProjectionMatrix();
    }
    if (aim !== adsShown.current) {
      adsShown.current = aim;
      setAds(aim);
    }

    const rayHit = (o, d) => {
      raycaster.current.camera = camera;
      raycaster.current.set(o, d);
      raycaster.current.far = RANGE;
      const targets = scene.children.filter((x) => x.userData.zid !== undefined || x.userData.pillar);
      const f = raycaster.current.intersectObjects(targets, true)[0];
      if (!f) return null;
      return { id: zidOf(f.object), point: f.point.clone() };
    };

    R.cast.current = (spread) => {
      const sp = spread * (R.aiming.current ? 0.45 : 1);
      const d = dir
        .clone()
        .add(new THREE.Vector3((Math.random() - 0.5) * sp * 2, (Math.random() - 0.5) * sp * 2, (Math.random() - 0.5) * sp * 2))
        .normalize();
      return rayHit(camPos, d);
    };

    const center = rayHit(camPos, dir.clone().normalize());
    const hitId = center && center.id !== null ? center.id : null;
    if (hitId !== R.aimed.current) {
      R.aimed.current = hitId;
      setAimed(hitId);
    }

    if (R.firing.current) R.shoot.current?.();

    if (bodyRef.current) {
      bodyRef.current.visible = tp;
      bodyRef.current.position.set(p.x, 0, p.z);
      bodyRef.current.rotation.y = yaw;
    }

    R.recoil.current = Math.max(0, R.recoil.current - dt * 6);
    R.flash.current = Math.max(0, R.flash.current - dt);

    let reloadPct = 0;
    if (R.reloadAt.current) {
      reloadPct = Math.min(1, (performance.now() - R.reloadAt.current) / R.reloadDur.current);
    }
    const lift = reloadPct > 0 ? Math.sin(reloadPct * Math.PI) : 0;

    const gun = R.gunRef.current;
    if (gun) {
      const scoped = aim && weapon.scope;
      gun.style.display = tp || scoped ? "none" : "block";
      const kick = R.recoil.current * 18;
      gun.style.transform = `translate(${aim ? -36 : 0}vw, ${-kick + lift * 160}px) rotate(${lift * -18}deg)`;
    }
    const fl = R.flashEl.current;
    if (fl) fl.style.opacity = R.flash.current > 0 ? "1" : "0";
  });

  return <Hero groupRef={bodyRef} />;
}

function Joystick({ stickRef }) {
  const baseRef = useRef(null);
  const idRef = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const move = (e) => {
    const r = baseRef.current.getBoundingClientRect();
    const max = r.width / 2;
    let dx = e.clientX - (r.left + max);
    let dy = e.clientY - (r.top + max);
    const l = Math.hypot(dx, dy);
    if (l > max) {
      dx = (dx * max) / l;
      dy = (dy * max) / l;
    }
    stickRef.current = { x: dx / max, y: -dy / max };
    setKnob({ x: dx, y: dy });
  };
  const up = () => {
    idRef.current = null;
    stickRef.current = { x: 0, y: 0 };
    setKnob({ x: 0, y: 0 });
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={(e) => {
        idRef.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => {
        if (idRef.current === e.pointerId) move(e);
      }}
      onPointerUp={up}
      onPointerCancel={up}
      style={{
        position: "absolute",
        left: 18,
        bottom: 18,
        width: 130,
        height: 130,
        borderRadius: "50%",
        background: "rgba(10, 6, 20, 0.45)",
        border: "3px solid rgba(168, 85, 247, 0.5)",
        touchAction: "none",
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 56,
          height: 56,
          marginLeft: -28,
          marginTop: -28,
          borderRadius: "50%",
          background: "rgba(225, 29, 72, 0.85)",
          border: "2px solid #fff",
          transform: `translate(${knob.x}px, ${knob.y}px)`,
        }}
      />
    </div>
  );
}

function TouchButton({ label, style, onDown, onUp }) {
  return (
    <div
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onDown?.();
      }}
      onPointerUp={() => onUp?.()}
      onPointerCancel={() => onUp?.()}
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--pixel)",
        fontSize: 9,
        color: "#fff",
        background: "rgba(10, 6, 20, 0.7)",
        border: "3px solid rgba(168, 85, 247, 0.6)",
        borderRadius: "50%",
        touchAction: "none",
        zIndex: 5,
        userSelect: "none",
        ...style,
      }}
    >
      {label}
    </div>
  );
}

/* range = true bo'lsa trenirovka */
function Game({ chapter, level, weaponKey, onEnd, onExit, range }) {
  const cfg = levelConfig(chapter, level);
  const weapon = WEAPONS[weaponKey];
  const isBoss = !range && !!cfg.boss;

  const [zombies, setZombies] = useState([]);
  const [aimed, setAimed] = useState(null);
  const [ads, setAds] = useState(false);
  const [hp, setHp] = useState(100);
  const [ammo, setAmmo] = useState(weapon.mag);
  const [reloading, setReloading] = useState(false);
  const [kills, setKills] = useState(0);
  const [money, setMoney] = useState(0);
  const [locked, setLocked] = useState(TOUCH);
  const [result, setResult] = useState(null);
  const [bossHp, setBossHp] = useState(cfg.bossHp);
  const [bossAlive, setBossAlive] = useState(isBoss);

  const playerRef = useRef({ x: 0, z: 0 });
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const keysRef = useRef({});
  const stickRef = useRef({ x: 0, y: 0 });
  const lookRef = useRef({ id: null, x: 0, y: 0 });
  const firingRef = useRef(false);
  const aimingRef = useRef(false);
  const recoilRef = useRef(0);
  const flashRef = useRef(0);
  const flashElRef = useRef(null);
  const gunRef = useRef(null);
  const castRef = useRef(null);
  const aimedRef = useRef(null);
  const tpRef = useRef(false);
  const lockedRef = useRef(TOUCH);
  const zHpRef = useRef(new Map());
  const killedRef = useRef(new Set());
  const freezeRef = useRef(new Map());
  const ammoRef = useRef(weapon.mag);
  const reloadingRef = useRef(false);
  const reloadAtRef = useRef(0);
  const reloadDurRef = useRef(weapon.reload);
  const lastShotRef = useRef(0);
  const killsRef = useRef(0);
  const earnedRef = useRef(0);
  const hpRef = useRef(100);
  const shownHpRef = useRef(100);
  const dmgRef = useRef(0);
  const doneRef = useRef(false);
  const spawnedRef = useRef(0);
  const idRef = useRef(1);
  const shootRef = useRef(null);
  const fxRef = useRef({ spawn: null });
  const reloadFillRef = useRef(null);
  const bossPosRef = useRef({ x: 0, z: -24 });
  const bossDeadRef = useRef(false);
  const projRef = useRef(Array.from({ length: PROJ_MAX }, () => ({ active: false })));
  const slowRef = useRef(0);
  const apiRef = useRef({ fire: () => {}, summon: () => {} });

  const R = {
    player: playerRef,
    yaw: yawRef,
    pitch: pitchRef,
    keys: keysRef,
    stick: stickRef,
    firing: firingRef,
    aiming: aimingRef,
    recoil: recoilRef,
    flash: flashRef,
    flashEl: flashElRef,
    gunRef,
    cast: castRef,
    aimed: aimedRef,
    tp: tpRef,
    shoot: shootRef,
    reloadAt: reloadAtRef,
    reloadDur: reloadDurRef,
    slow: slowRef,
  };

  const startReload = () => {
    if (range) return;
    if (reloadingRef.current || doneRef.current || ammoRef.current === weapon.mag) return;
    reloadingRef.current = true;
    reloadDurRef.current = weapon.reload;
    reloadAtRef.current = performance.now();
    setReloading(true);
    setTimeout(() => {
      ammoRef.current = weapon.mag;
      setAmmo(weapon.mag);
      reloadingRef.current = false;
      reloadAtRef.current = 0;
      setReloading(false);
    }, weapon.reload);
  };

  useEffect(() => {
    if (reloading && reloadFillRef.current) {
      const anim = reloadFillRef.current.animate(
        [{ width: "0%" }, { width: "100%" }],
        { duration: weapon.reload, fill: "forwards" }
      );
      return () => anim.cancel();
    }
  }, [reloading, weapon.reload]);

  const finish = (win) => {
    if (doneRef.current) return;
    doneRef.current = true;
    firingRef.current = false;
    aimingRef.current = false;
    if (document.pointerLockElement) document.exitPointerLock();
    const h = hpRef.current;
    const stars = win ? (h >= 60 ? 3 : h >= 30 ? 2 : 1) : 0;
    const bonus = win && isBoss ? 500 : 0;
    setResult({ win, stars, money: earnedRef.current + (win ? cfg.reward : 0) + bonus });
  };

  /* Har 100 ms: zarar, HP va g'alaba/mag'lubiyat tekshiruvi */
  useEffect(() => {
    const tick = setInterval(() => {
      if (doneRef.current) return;
      const d = dmgRef.current;
      dmgRef.current = 0;
      if (!range && d > 0) {
        hpRef.current = Math.max(0, hpRef.current - d);
        const shown = Math.ceil(hpRef.current);
        if (shown !== shownHpRef.current) {
          shownHpRef.current = shown;
          setHp(shown);
        }
      }
      if (hpRef.current <= 0) finish(false);
      else if (!range && (isBoss ? bossDeadRef.current : killsRef.current >= cfg.total)) finish(true);
    }, 100);
    return () => clearInterval(tick);
  }, []);

  const applyDamage = (id, dmg, freeze) => {
    if (killedRef.current.has(id)) return;
    const info = zHpRef.current.get(id);
    if (!info) return;
    if (freeze) freezeRef.current.set(id, performance.now() + freeze);
    const left = info.hp - dmg;

    if (id === 0) {
      if (left <= 0) {
        killedRef.current.add(0);
        zHpRef.current.delete(0);
        bossDeadRef.current = true;
        earnedRef.current += 0;
        setBossHp(0);
        setBossAlive(false);
      } else {
        zHpRef.current.set(0, { ...info, hp: left });
        setBossHp(Math.ceil(left));
      }
      return;
    }

    if (left <= 0) {
      killedRef.current.add(id);
      zHpRef.current.delete(id);
      earnedRef.current += ZOMBIES[info.type].value;
      setMoney(earnedRef.current);
      killsRef.current += 1;
      setKills(killsRef.current);
      setZombies((zs) => zs.filter((x) => x.id !== id));
    } else {
      zHpRef.current.set(id, { ...info, hp: left });
      setZombies((zs) => zs.map((x) => (x.id === id ? { ...x, hp: left } : x)));
    }
  };

  const spawnZombie = (type, x, z) => {
    if (doneRef.current || zHpRef.current.size > 25) return;
    const zid = idRef.current++;
    const hpMax = Math.round(cfg.baseHp * ZOMBIES[type].hp);
    zHpRef.current.set(zid, { hp: hpMax, type });
    setZombies((zs) => [...zs, { id: zid, type, x, z, hp: hpMax, maxHp: hpMax }]);
  };

  /* Dushman o'qi: suyak (qaytib keladi), olov yoki muz */
  const fireEnemy = (kind, fx, fz, owner, dmg, slow) => {
    const slot = projRef.current.find((p) => !p.active);
    if (!slot) return;
    const pl = playerRef.current;
    slot.active = true;
    slot.kind = kind;
    slot.x = fx;
    slot.z = fz;
    slot.owner = owner;
    slot.dmg = dmg;
    slot.slow = !!slow;
    slot.hit = false;
    slot.t = 0;
    slot.phase = 0;
    slot.tx = pl.x;
    slot.tz = pl.z;
    slot.rot = 0;
    slot.life = 4;
    if (kind !== "bone") {
      const dx = pl.x - fx;
      const dz = pl.z - fz;
      const dd = Math.hypot(dx, dz) || 1;
      const spd = kind === "ice" ? 6 : 9;
      slot.vx = (dx / dd) * spd;
      slot.vz = (dz / dd) * spd;
    }
  };

  apiRef.current = {
    fire: fireEnemy,
    summon: (type, count, x, z) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        spawnZombie(type, x + Math.cos(a) * 2.5, z + Math.sin(a) * 2.5);
      }
    },
  };

  const shoot = () => {
    if (doneRef.current || reloadingRef.current) return;
    const now = performance.now();
    if (now - lastShotRef.current < weapon.delay) return;
    if (!range) {
      if (ammoRef.current <= 0) {
        startReload();
        return;
      }
      ammoRef.current -= 1;
      setAmmo(ammoRef.current);
    }
    lastShotRef.current = now;
    R.recoil.current = 1;
    R.flash.current = 0.06;

    const cast = castRef.current;
    if (!cast) return;

    const dmgMap = new Map();
    let fx = null;
    for (let i = 0; i < (weapon.pellets || 1); i++) {
      const h = cast(weapon.spread);
      if (!h) continue;
      if (!fx) fx = h.point;
      if (h.id !== null) dmgMap.set(h.id, (dmgMap.get(h.id) || 0) + weapon.damage);
    }
    if (fx) fxRef.current.spawn?.(fx.x, fx.y, fx.z, "#fde68a", 5);
    dmgMap.forEach((d, id) => applyDamage(id, d, weapon.freeze));
  };
  shootRef.current = shoot;

  /* Boss levelida boss o'zi paydo bo'ladi */
  useEffect(() => {
    if (isBoss) zHpRef.current.set(0, { hp: cfg.bossHp, type: "boss" });
  }, []);

  useEffect(() => {
    if (isBoss) return undefined;
    const maxAlive = range ? 6 : cfg.maxAlive;
    const delay = range ? 1200 : cfg.spawnDelay;
    const id = setInterval(() => {
      if (doneRef.current) return;
      if (!range && spawnedRef.current >= cfg.total) return;
      if (zHpRef.current.size >= maxAlive) return;
      spawnedRef.current += 1;
      const type = range ? "normal" : pickType(cfg);
      const sp = spawnPoint();
      spawnZombie(type, sp.x, sp.z);
    }, delay);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === "KeyR") startReload();
      if (e.code === "KeyV") tpRef.current = !tpRef.current;
    };
    const onKeyUp = (e) => { keysRef.current[e.code] = false; };
    const onBlur = () => {
      keysRef.current = {};
      firingRef.current = false;
      aimingRef.current = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    let onMouseMove, onMouseDown, onMouseUp, onLockChange, onContext;
    if (!TOUCH) {
      onMouseMove = (e) => {
        if (!lockedRef.current) return;
        yawRef.current -= e.movementX * 0.0022;
        pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - e.movementY * 0.0022, -1.2, 1.2);
      };
      onMouseDown = (e) => {
        if (!lockedRef.current) {
          if (e.button === 0) document.body.requestPointerLock();
          return;
        }
        if (e.button === 2) {
          aimingRef.current = true;
          return;
        }
        if (e.button !== 0) return;
        if (weapon.auto) firingRef.current = true;
        shootRef.current?.();
      };
      onMouseUp = (e) => {
        if (e.button === 0) firingRef.current = false;
        if (e.button === 2) aimingRef.current = false;
      };
      onContext = (e) => e.preventDefault();
      onLockChange = () => {
        const l = document.pointerLockElement === document.body;
        lockedRef.current = l;
        setLocked(l);
        if (!l) {
          firingRef.current = false;
          aimingRef.current = false;
          keysRef.current = {};
        }
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("contextmenu", onContext);
      document.addEventListener("pointerlockchange", onLockChange);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      if (!TOUCH) {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("contextmenu", onContext);
        document.removeEventListener("pointerlockchange", onLockChange);
      }
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, []);

  const hud = TOUCH ? { fontSize: 9 } : {};
  const bossPct = cfg.bossHp ? Math.max(0, (bossHp / cfg.bossHp) * 100) : 0;

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none", userSelect: "none" }}>
      {TOUCH && (
        <div
          onPointerDown={(e) => {
            lookRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const l = lookRef.current;
            if (l.id !== e.pointerId) return;
            const dx = e.clientX - l.x;
            const dy = e.clientY - l.y;
            l.x = e.clientX;
            l.y = e.clientY;
            yawRef.current -= dx * 0.006;
            pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - dy * 0.006, -1.2, 1.2);
          }}
          onPointerUp={(e) => { if (lookRef.current.id === e.pointerId) lookRef.current.id = null; }}
          onPointerCancel={(e) => { if (lookRef.current.id === e.pointerId) lookRef.current.id = null; }}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60%", touchAction: "none", zIndex: 1 }}
        />
      )}

      <Canvas
        dpr={TOUCH ? [1, 1.25] : [1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 70, position: [0, 1.6, 0] }}
      >
        <color attach="background" args={["#07050f"]} />
        <fog attach="fog" args={["#0d0a1a", 25, 80]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[10, 20, 5]} intensity={0.9} color="#c7d2fe" />
        <Sky />
        <Arena />
        {PILLARS.map(([x, z], i) => (
          <mesh key={i} position={[x, 1.5, z]} userData={{ pillar: true }}>
            <boxGeometry args={[2, 3, 2]} />
            <meshStandardMaterial color="#3d4270" roughness={0.8} />
          </mesh>
        ))}
        <Sparks fxRef={fxRef} />
        <Projectiles projRef={projRef} playerRef={playerRef} dmgRef={dmgRef} slowRef={slowRef} />
        <Rig R={R} weapon={weapon} setAds={setAds} setAimed={setAimed} />
        {isBoss && bossAlive && (
          <Boss def={cfg.boss} posRef={bossPosRef} playerRef={playerRef} apiRef={apiRef} dmgRef={dmgRef} />
        )}
        {zombies.map((z) => (
          <Zombie
            key={z.id}
            z={z}
            aimed={aimed === z.id}
            playerRef={playerRef}
            dmgRef={dmgRef}
            freezeRef={freezeRef}
            apiRef={apiRef}
          />
        ))}
      </Canvas>

      {isBoss && bossAlive && (
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: "min(420px, 60vw)", pointerEvents: "none", zIndex: 4 }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: 10, color: "#fff", textAlign: "center", marginBottom: 6, textShadow: "2px 2px 0 #000" }}>
            {cfg.boss.name} · {bossHp} HP
          </div>
          <div style={{ height: 16, background: "#1a0505", border: "3px solid #7f1d1d", boxShadow: "3px 3px 0 #0b0716" }}>
            <div style={{ width: `${bossPct}%`, height: "100%", background: "#dc2626", transition: "width 0.15s" }} />
          </div>
        </div>
      )}

      <div className="abk-hud" style={{ top: isBoss ? 70 : 12, left: 12, ...hud, pointerEvents: "none" }}>
        {range ? (
          <>
            <div>TRENIROVKA</div>
            <div className="abk-hud-muted">ZOMBI: {kills} · O'Q: CHEKSIZ</div>
          </>
        ) : (
          <>
            <div>{chapter}-BOB · {level}-LEVEL{isBoss ? " · BOSS" : ""}</div>
            <div className="abk-hud-muted">
              {isBoss ? `ZOMBI ${kills} · PUL ${money}` : `ZOMBI ${kills}/${cfg.total} · PUL ${money}`}
            </div>
          </>
        )}
      </div>

      {range && onExit && (
        <div
          onClick={() => {
            if (document.pointerLockElement) document.exitPointerLock();
            onExit();
          }}
          className="abk-hud"
          style={{ top: 78, left: 12, cursor: "pointer", pointerEvents: "auto", ...hud }}
        >
          ← QURAL TANLASH
        </div>
      )}

      {!TOUCH && (
        <div className="abk-hud abk-hud-muted" style={{ top: 12, right: 12 }}>
          CHAP: OTISH · O'NG: MOLJAL · R: YUKLASH · V: KAMERA
        </div>
      )}

      {!(ads && weapon.scope) && <div className="abk-crosshair" style={{ zIndex: 2 }} />}

      {ads && weapon.scope && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2,
            background:
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0, rgba(0,0,0,0) min(28vw, 42vh), #000 calc(min(28vw, 42vh) + 3px))",
          }}
        >
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.55)" }} />
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.55)" }} />
        </div>
      )}

      <div ref={gunRef} style={{ position: "absolute", right: "2%", bottom: "4%", pointerEvents: "none", zIndex: 3 }}>
        <WeaponSprite shape={weapon.shape} accent={weapon.color} px={TOUCH ? 5 : 8} />
        <div
          ref={flashElRef}
          style={{
            position: "absolute",
            right: -10,
            top: "28%",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "radial-gradient(circle, #ffffff 0%, #fde68a 35%, rgba(253,230,138,0) 70%)",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      </div>

      <div className="abk-hud" style={{ bottom: TOUCH ? "auto" : 12, top: TOUCH ? 74 : "auto", left: 12, width: TOUCH ? 150 : 240, ...hud, pointerEvents: "none" }}>
        <div>HP {hp}</div>
        <div className="abk-hud-bar" style={{ marginTop: 6 }}>
          <div className="abk-hud-bar-fill" style={{ width: `${hp}%` }} />
        </div>
      </div>

      <div
        className="abk-hud"
        style={{
          bottom: TOUCH ? "auto" : 12,
          top: TOUCH ? 74 : "auto",
          right: 12,
          textAlign: "right",
          minWidth: TOUCH ? 130 : 180,
          ...hud,
          pointerEvents: "none",
        }}
      >
        <div className="abk-hud-muted">{weapon.name}</div>
        <div>{range ? "∞" : reloading ? "YUKLANMOQDA..." : `${ammo} / ${weapon.mag}`}</div>
        <div className="abk-hud-bar" style={{ marginTop: 6, display: reloading ? "block" : "none" }}>
          <div ref={reloadFillRef} className="abk-hud-bar-fill" style={{ width: "0%", background: "#fbbf24" }} />
        </div>
      </div>

      {TOUCH && (
        <>
          <Joystick stickRef={stickRef} />
          <TouchButton
            label="OTISH"
            style={{ right: 18, bottom: 18, width: 92, height: 92 }}
            onDown={() => {
              if (weapon.auto) firingRef.current = true;
              shootRef.current?.();
            }}
            onUp={() => { firingRef.current = false; }}
          />
          <TouchButton
            label="MOLJAL"
            style={{ right: 124, bottom: 118, width: 64, height: 64 }}
            onDown={() => { aimingRef.current = !aimingRef.current; }}
          />
          <TouchButton label="R" style={{ right: 124, bottom: 30, width: 60, height: 60 }} onDown={() => startReload()} />
          <TouchButton
            label="V"
            style={{ right: 200, bottom: 30, width: 60, height: 60 }}
            onDown={() => { tpRef.current = !tpRef.current; }}
          />
        </>
      )}

      {!locked && !result && !TOUCH && (
        <div className="abk-overlay" style={{ pointerEvents: "none" }}>
          <p className="abk-overlay-title" style={{ fontSize: 16 }}>DAVOM ETISH UCHUN BOSING</p>
          <p className="abk-overlay-text">WASD · CHAP TUGMA · O'NG TUGMA · R · V</p>
        </div>
      )}

      {result && (
        <div className="abk-overlay abk-overlay-result">
          <h2 className="abk-overlay-title">{result.win ? "G'ALABA!" : "MAG'LUBIYAT"}</h2>
          <p className="abk-overlay-stars">
            {"★".repeat(result.stars)}{"☆".repeat(3 - result.stars)}
          </p>
          <p className="abk-overlay-text">PUL: +{result.money}</p>
          <button className="abk-btn abk-primary" onClick={() => onEnd(result)}>
            Davom etish
          </button>
        </div>
      )}
    </div>
  );
}

class GameBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    console.error("O'yin xatosi:", err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div className="abk-page">
          <div className="abk-card abk-col" style={{ maxWidth: 640 }}>
            <h2 className="abk-h2">XATO CHIQDI</h2>
            <p className="abk-msg" style={{ wordBreak: "break-word" }}>
              {String(this.state.err?.message || this.state.err)}
            </p>
            <button className="abk-btn abk-primary" onClick={this.props.onBack}>
              Menyuga qaytish
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ========== SAQLASH ========== */

const SAVE_KEY = "abk-save-v2";
const OLD_SAVE_KEY = "abk-save-v1";

function loadSave() {
  let raw = null;
  try {
    raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(OLD_SAVE_KEY);
  } catch {
    raw = null;
  }
  let s = {};
  try {
    s = JSON.parse(raw) || {};
  } catch {
    s = {};
  }
  const map = (k) => (WEAPONS[k] ? k : OLD_KEYS[k] && WEAPONS[OLD_KEYS[k]] ? OLD_KEYS[k] : null);
  let owned = Array.isArray(s.owned) ? s.owned.map(map).filter(Boolean) : [];
  owned = [...new Set(owned)];
  if (!owned.includes("pistol")) owned = ["pistol", ...owned];
  const selected = map(s.selected) || "pistol";
  let ownedAvatars = Array.isArray(s.ownedAvatars) ? s.ownedAvatars.filter((k) => AVATARS[k]) : [];
  if (!ownedAvatars.includes("classic")) ownedAvatars = ["classic", ...ownedAvatars];
  const avatar = AVATARS[s.avatar] ? s.avatar : "classic";
  const chapter = Math.min(10, Math.max(1, Number(s.chapter) || 1));
  const level = Math.min(10, Math.max(1, Number(s.level) || 1));
  return {
    name: typeof s.name === "string" ? s.name : "",
    money: Number(s.money) || 0,
    owned,
    selected,
    progress: s.progress && typeof s.progress === "object" ? s.progress : {},
    chapter,
    level,
    avatar,
    ownedAvatars,
  };
}

/* ========== UI ========== */

function StickAvatar({ id, size = 64 }) {
  const a = AVATARS[id] || AVATARS.classic;
  const c = a.body;
  return (
    <svg viewBox="0 0 60 84" width={size} height={size * 1.4} style={{ display: "block" }}>
      <g stroke={c} strokeWidth="4" strokeLinecap="round" fill="none">
        <circle cx="30" cy="20" r="10" fill="#0b0716" />
        <line x1="30" y1="30" x2="30" y2="54" />
        <line x1="30" y1="36" x2="17" y2="48" />
        <line x1="30" y1="36" x2="43" y2="48" />
        <line x1="30" y1="54" x2="20" y2="76" />
        <line x1="30" y1="54" x2="40" y2="76" />
      </g>
      {a.hat === "cap" && <rect x="19" y="10" width="22" height="6" fill={c} />}
      {a.hat === "helmet" && <path d="M19 20 A11 11 0 0 1 41 20 Z" fill={c} />}
      {a.hat === "crown" && <polygon points="20,13 24,4 30,11 36,4 40,13" fill={c} />}
      {a.hat === "hood" && <path d="M18 22 A12 12 0 0 1 42 22 L42 14 A12 12 0 0 0 18 14 Z" fill={c} />}
      {a.hat === "antenna" && (
        <>
          <line x1="30" y1="10" x2="30" y2="0" stroke={c} strokeWidth="2" />
          <circle cx="30" cy="0" r="3" fill={c} />
        </>
      )}
    </svg>
  );
}

function Chip({ children }) {
  return <div className="abk-chip">{children}</div>;
}

function Header({ onBack, money, title }) {
  return (
    <div className="abk-header">
      <button className="abk-btn abk-ghost" onClick={onBack}>← Orqaga</button>
      {title && <h2 className="abk-h2">{title}</h2>}
      <Chip>◉ {money}</Chip>
    </div>
  );
}

function Bar({ label, value, max, color }) {
  const n = Math.max(0, Math.min(10, Math.round((value / max) * 10)));
  return (
    <div className="abk-bar">
      <span className="abk-bar-label">{label}</span>
      <div className="abk-bar-track">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="abk-bar-seg"
            style={{ background: i < n ? color : "rgba(255, 255, 255, 0.08)" }}
          />
        ))}
      </div>
    </div>
  );
}

function WeaponArt({ w, big }) {
  return (
    <div className={big ? "abk-art abk-art-big" : "abk-art"} style={{ "--accent": w.color }}>
      <WeaponSprite shape={w.shape} accent={w.color} px={big ? 6 : 3} />
    </div>
  );
}

function WeaponStats({ w }) {
  return (
    <>
      <Bar label="Zarar" value={w.damage} max={DMG_MAX} color={w.color} />
      <Bar label="Tezlik" value={1000 / w.delay} max={RATE_MAX} color={w.color} />
      <Bar label="Magazin" value={w.mag} max={MAG_MAX} color={w.color} />
      <p className="abk-muted" style={{ fontSize: 12 }}>
        {w.auto ? "Avtomat" : "Yakka"} · {w.scope ? "Prizel" : "Moljal"}
        {w.freeze ? " · Muzlatadi" : ""}
        {w.pellets ? ` · ${w.pellets} ta sachratgich` : ""}
      </p>
    </>
  );
}

export default function App() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState("menu");
  const [playing, setPlaying] = useState(null);
  const [runId, setRunId] = useState(0);
  const [msg, setMsg] = useState("");
  const [shopKey, setShopKey] = useState(save.selected);
  const [rangeKey, setRangeKey] = useState(save.selected);

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {
      /* saqlab bo'lmasa o'yin davom etadi */
    }
  }, [save]);

  const starsOf = (c, l) => save.progress[`${c}-${l}`] || 0;
  const unlocked = (c, l) => {
    if (l > 1) return starsOf(c, l - 1) > 0;
    if (c > 1) return starsOf(c - 1, 10) > 0;
    return true;
  };

  const setPos = (c, l) => setSave((p) => ({ ...p, chapter: c, level: l }));

  const buy = (key) => {
    const w = WEAPONS[key];
    if (save.owned.includes(key)) {
      setSave((p) => ({ ...p, selected: key }));
      setMsg(`${w.name} tanlandi`);
      return;
    }
    if (save.money < w.price) {
      setMsg("Pul yetarli emas");
      return;
    }
    setSave((p) => ({ ...p, money: p.money - w.price, owned: [...p.owned, key], selected: key }));
    setMsg(`${w.name} sotib olindi`);
  };

  const buyAvatar = (key) => {
    const a = AVATARS[key];
    if (save.ownedAvatars.includes(key)) {
      setSave((p) => ({ ...p, avatar: key }));
      setMsg(`${a.name} tanlandi`);
      return;
    }
    if (save.money < a.price) {
      setMsg("Pul yetarli emas");
      return;
    }
    setSave((p) => ({
      ...p,
      money: p.money - a.price,
      ownedAvatars: [...p.ownedAvatars, key],
      avatar: key,
    }));
    setMsg(`${a.name} sotib olindi`);
  };

  const handleEnd = ({ win, stars, money }) => {
    if (playing && !playing.range) {
      const key = `${playing.chapter}-${playing.level}`;
      setSave((prev) => ({
        ...prev,
        money: prev.money + money,
        progress: { ...prev.progress, [key]: Math.max(prev.progress[key] || 0, stars) },
      }));
      setMsg(win ? "Level o'tildi" : "Mag'lubiyat, qayta urinib ko'ring");
      setPlaying(null);
      setScreen("levels");
      return;
    }
    setPlaying(null);
    setScreen("menu");
  };

  const startRange = () => {
    setPlaying({ chapter: 1, level: 1, range: true });
    setRunId((n) => n + 1);
    setScreen("game");
  };

  if (screen === "game" && playing) {
    const isRange = !!playing.range;
    const weaponKey = isRange ? rangeKey : save.selected;
    return (
      <div style={{ position: "fixed", inset: 0 }}>
        <GameBoundary onBack={() => { setPlaying(null); setScreen("menu"); }}>
          <Game
            key={runId}
            chapter={playing.chapter}
            level={playing.level}
            weaponKey={weaponKey}
            range={isRange}
            onEnd={handleEnd}
            onExit={isRange ? () => { setPlaying(null); setScreen("range"); } : undefined}
          />
        </GameBoundary>
      </div>
    );
  }

  if (screen === "profile") {
    return (
      <div className="abk-page">
        <Header onBack={() => setScreen("menu")} money={save.money} title="PROFIL" />
        <div className="abk-grid-shop">
          <div className="abk-card abk-col" style={{ alignItems: "center" }}>
            <StickAvatar id={save.avatar} size={150} />
            <h3 className="abk-h3">{AVATARS[save.avatar].name}</h3>
            <input
              className="abk-input"
              placeholder="Ismingiz"
              value={save.name}
              onChange={(e) => setSave((p) => ({ ...p, name: e.target.value }))}
            />
            {msg && <p className="abk-msg">{msg}</p>}
          </div>

          <div className="abk-weapon-grid">
            {AVATAR_ORDER.map((k) => {
              const a = AVATARS[k];
              const owned = save.ownedAvatars.includes(k);
              const sel = save.avatar === k;
              return (
                <button
                  key={k}
                  onClick={() => buyAvatar(k)}
                  className={`abk-card abk-weapon-tile ${sel ? "abk-active" : ""}`}
                  style={{ textAlign: "center" }}
                >
                  <StickAvatar id={k} size={70} />
                  <div className="abk-tile-name">{a.name}</div>
                  <div className="abk-tile-state" style={{ color: sel ? "#34d399" : owned ? "#a1a1c2" : "#fbbf24" }}>
                    {sel ? "Tanlangan" : owned ? "Sotib olingan" : `${a.price} ◉`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "range") {
    const w = WEAPONS[rangeKey];
    return (
      <div className="abk-page">
        <Header onBack={() => setScreen("menu")} money={save.money} title="TRENIROVKA" />
        <div className="abk-grid-shop">
          <div className="abk-card abk-col">
            <WeaponArt w={w} big />
            <h3 className="abk-h3">{w.name}</h3>
            <WeaponStats w={w} />
            <p className="abk-muted" style={{ fontSize: 12 }}>
              Barcha qurollar ochiq. O'q cheksiz, zarar yo'q, natija saqlanmaydi.
            </p>
            <button className="abk-btn abk-primary" onClick={startRange}>
              ▶ Boshlash
            </button>
          </div>

          <div className="abk-weapon-grid">
            {WEAPON_ORDER.map((k) => {
              const t = WEAPONS[k];
              const active = rangeKey === k;
              return (
                <button
                  key={k}
                  onClick={() => setRangeKey(k)}
                  className={`abk-card abk-weapon-tile ${active ? "abk-active" : ""}`}
                >
                  <WeaponArt w={t} />
                  <div className="abk-tile-name">{t.name}</div>
                  <div className="abk-tile-state" style={{ color: "#a1a1c2" }}>
                    {t.auto ? "Avtomat" : "Yakka"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "shop") {
    const w = WEAPONS[shopKey];
    const owned = save.owned.includes(shopKey);
    const sel = save.selected === shopKey;
    return (
      <div className="abk-page">
        <Header onBack={() => setScreen("menu")} money={save.money} title="GARAJ" />
        <div className="abk-grid-shop">
          <div className="abk-card abk-col">
            <WeaponArt w={w} big />
            <h3 className="abk-h3">{w.name}</h3>
            <WeaponStats w={w} />
            <button
              className={owned ? "abk-btn abk-ghost" : "abk-btn abk-primary"}
              onClick={() => buy(shopKey)}
            >
              {sel ? "✓ Tanlangan" : owned ? "Tanlash" : `Sotib olish · ${w.price}`}
            </button>
            {msg && <p className="abk-msg">{msg}</p>}
          </div>

          <div className="abk-weapon-grid">
            {WEAPON_ORDER.map((k) => {
              const t = WEAPONS[k];
              const o = save.owned.includes(k);
              const s = save.selected === k;
              const active = shopKey === k;
              return (
                <button
                  key={k}
                  onClick={() => setShopKey(k)}
                  className={`abk-card abk-weapon-tile ${active ? "abk-active" : ""}`}
                >
                  <WeaponArt w={t} />
                  <div className="abk-tile-name">{t.name}</div>
                  <div
                    className="abk-tile-state"
                    style={{ color: s ? "#34d399" : o ? "#a1a1c2" : "#fbbf24" }}
                  >
                    {s ? "Tanlangan" : o ? "Sotib olingan" : `${t.price} ◉`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "levels") {
    const chapter = save.chapter;
    const level = save.level;
    const cfg = levelConfig(chapter, level);
    return (
      <div className="abk-page">
        <Header onBack={() => setScreen("menu")} money={save.money} title="SYUJET" />
        <div className="abk-container">
          <div className="abk-chapters">
            {CHAPTER_NAMES.map((n, i) => {
              const c = i + 1;
              const ok = unlocked(c, 1);
              return (
                <button
                  key={c}
                  disabled={!ok}
                  onClick={() => setPos(c, 1)}
                  className={`abk-btn abk-chapter ${chapter === c ? "abk-primary" : "abk-ghost"}`}
                >
                  {c}-bob
                </button>
              );
            })}
          </div>

          <div className="abk-grid-levels">
            <div className="abk-card">
              <h2 className="abk-h2 abk-left">
                {chapter}-bob: {CHAPTER_NAMES[chapter - 1]}
              </h2>
              <div className="abk-level-grid">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => {
                  const ok = unlocked(chapter, l);
                  const s = starsOf(chapter, l);
                  const active = level === l;
                  const boss = (chapter - 1) * 10 + l;
                  return (
                    <button
                      key={l}
                      disabled={!ok}
                      onClick={() => setPos(chapter, l)}
                      className={`abk-btn abk-level ${active ? "abk-primary" : "abk-ghost"}`}
                    >
                      <div className="abk-level-num">{l}</div>
                      <div className="abk-level-stars">
                        {boss % 5 === 0 ? "BOSS" : "★".repeat(s) + "☆".repeat(3 - s)}
                      </div>
                      {!ok && <div className="abk-level-lock">Qulflangan</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="abk-card abk-col">
              <WeaponArt w={WEAPONS[save.selected]} big />
              <h3 className="abk-h3">{chapter}-bob, {level}-level</h3>
              {cfg.boss ? (
                <p className="abk-muted" style={{ color: "#f87171" }}>
                  BOSS: {cfg.boss.name} · {cfg.bossHp} HP
                </p>
              ) : (
                <p className="abk-muted">Zombilar: {cfg.total}</p>
              )}
              <p className="abk-muted">Mukofot: {cfg.reward} ◉</p>
              <p className="abk-muted">Qurol: {WEAPONS[save.selected].name}</p>
              <button
                className="abk-btn abk-primary"
                onClick={() => {
                  setPlaying({ chapter, level, range: false });
                  setRunId((n) => n + 1);
                  setMsg("");
                  setScreen("game");
                }}
              >
                ▶ Boshlash
              </button>
              {msg && <p className="abk-msg">{msg}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="abk-page">
      <div className="abk-corner">
        <Chip>◉ {save.money}</Chip>
      </div>

      <div className="abk-hero">
        <div>
          <div className="abk-tag">ZOMBI SHOOTER</div>
          <h1 className="abk-title">A_B_K</h1>
          <p className="abk-lead">
            10 bob, har bobda 10 ta level. Har 5-levelda boss bor. Zombilarni o'ldiring, pul ishlang va yangi qurollar oching.
          </p>

          <div className="abk-row" style={{ alignItems: "center", marginTop: 0 }}>
            <StickAvatar id={save.avatar} size={56} />
            <div>
              <div className="abk-h3" style={{ fontSize: 11 }}>{save.name || "Mehmon"}</div>
              <div className="abk-muted" style={{ fontSize: 12 }}>
                Joy: {save.chapter}-bob, {save.level}-level
              </div>
            </div>
          </div>

          <div className="abk-row">
            <button className="abk-btn abk-primary abk-grow" onClick={() => { setMsg(""); setScreen("levels"); }}>
              ▶ Syujet
            </button>
            <button
              className="abk-btn abk-ghost abk-grow"
              onClick={() => { setShopKey(save.selected); setMsg(""); setScreen("shop"); }}
            >
              🔫 Garaj
            </button>
          </div>
          <div className="abk-row">
            <button
              className="abk-btn abk-ghost abk-grow"
              onClick={() => { setRangeKey(save.selected); setScreen("range"); }}
            >
              🎯 Trenirovka
            </button>
            <button className="abk-btn abk-ghost abk-grow" onClick={() => { setMsg(""); setScreen("profile"); }}>
              👤 Profil
            </button>
          </div>

          <div className="abk-stats">
            <span>Bob: {Object.keys(save.progress).length}</span>
            <span>Qurollar: {save.owned.length}/{WEAPON_ORDER.length}</span>
            {save.name && <span>Salom, {save.name}!</span>}
          </div>
          {msg && <p className="abk-msg">{msg}</p>}
        </div>

        <div className="abk-card abk-col abk-hero-card">
          <WeaponArt w={WEAPONS[save.selected]} big />
          <h3 className="abk-h3">{WEAPONS[save.selected].name}</h3>
          <WeaponStats w={WEAPONS[save.selected]} />
        </div>
      </div>
    </div>
  );
}