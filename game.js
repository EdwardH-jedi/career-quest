/* =========================================================================
   EDWARD'S CAREER QUEST — a playable resume platformer
   World 1: Jeju Island (high school, Arduino coffee machine, Samsung prize)
   World 2: University of Sydney (CS degree, coursework skills)
   World 3: Sensorway @ Ecopro, Hungary (industrial IoT deployment)
   ========================================================================= */
"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE = 36;
const ROWS = 15;
const VIEW_W = canvas.width;
const VIEW_H = canvas.height;

const GRAVITY = 0.55;
const MAX_FALL = 14;
const MOVE_SPEED = 3.6;
const JUMP_VEL = -12.6;

const SOLID = "#B?X=D";

/* ------------------------------------------------------------------ audio */
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { audioCtx = null; }
  }
}
function beep(freq, dur, type, vol, slideTo) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || "square";
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(vol || 0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}
const sfx = {
  jump()  { beep(320, 0.18, "square", 0.10, 640); },
  coin()  { beep(988, 0.07, "triangle", 0.14); setTimeout(() => beep(1319, 0.12, "triangle", 0.14), 60); },
  skill() { beep(660, 0.08, "square", 0.12); setTimeout(() => beep(880, 0.08, "square", 0.12), 80);
            setTimeout(() => beep(1175, 0.14, "square", 0.12), 160); },
  stomp() { beep(220, 0.12, "sawtooth", 0.14, 110); },
  shoot() { beep(1250, 0.07, "square", 0.08, 480); },
  hurt()  { beep(180, 0.25, "sawtooth", 0.16, 70); },
  bump()  { beep(140, 0.07, "square", 0.10); },
  clear() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.16, "square", 0.12), i * 110)); },
  win()   { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => beep(f, 0.2, "triangle", 0.13), i * 130)); },
  over()  { [392, 311, 233, 196].forEach((f, i) => setTimeout(() => beep(f, 0.22, "sawtooth", 0.12), i * 160)); }
};

/* ------------------------------------------------------------- level maps */
function newGrid(width) {
  const g = [];
  for (let y = 0; y < ROWS; y++) g.push(new Array(width).fill(" "));
  return g;
}
function row(g, ch, y, x1, x2) { for (let x = x1; x <= x2; x++) g[y][x] = ch; }
function col(g, ch, x, y1, y2) { for (let y = y1; y <= y2; y++) g[y][x] = ch; }
function put(g, ch, x, y) { g[y][x] = ch; }
function ground(g, x1, x2) { row(g, "#", 13, x1, x2); row(g, "#", 14, x1, x2); }
function stairs(g, x, h) { // ascending staircase ending at column x+h-1
  for (let i = 0; i < h; i++) col(g, "#", x + i, 12 - i, 12);
}

function buildLevel1() {
  const W = 150, g = newGrid(W);
  ground(g, 0, 39); ground(g, 43, 69); ground(g, 73, 108); ground(g, 112, 149);
  put(g, "P", 2, 12);
  put(g, "c", 6, 12);                       // the famous contactless coffee machine
  put(g, "?", 12, 9); put(g, "B", 13, 9); put(g, "?", 14, 9);
  row(g, "o", 12, 18, 21);
  row(g, "=", 9, 24, 27);
  row(g, "o", 8, 24, 27);
  put(g, "?", 26, 5);
  put(g, "E", 20, 12); put(g, "M", 33, 12);
  row(g, "o", 9, 40, 42);                   // coins arcing over the pit
  put(g, "?", 48, 9); put(g, "B", 50, 9); put(g, "?", 52, 9);
  put(g, "E", 55, 12); put(g, "M", 62, 12);
  row(g, "o", 12, 58, 61);
  row(g, "o", 9, 70, 72);
  row(g, "#", 12, 84, 88); row(g, "#", 11, 85, 87);   // volcanic hill
  row(g, "o", 9, 84, 88);
  put(g, "E", 80, 12); put(g, "M", 95, 12);
  row(g, "o", 12, 98, 102);
  row(g, "o", 9, 109, 111);
  put(g, "M", 120, 12);
  row(g, "o", 12, 122, 126);
  stairs(g, 130, 4);
  put(g, "F", 142, 12);
  return {
    name: "WORLD 1-1",
    place: "JEJU ISLAND — ORIGINS (2017–2022)",
    hudPlace: "JEJU ISLAND",
    intro: "Where it all began: a contactless coffee machine,\nan Arduino, and a Samsung Grand Prize.",
    theme: "jeju",
    map: g.map(r => r.join("")),
    skills: ["Arduino (C)", "Sensor Integration", "Embedded Systems", "Leadership", "Samsung Grand Prize"]
  };
}

function buildLevelSeoul() {
  const W = 160, g = newGrid(W);
  ground(g, 0, 29); ground(g, 33, 59); ground(g, 63, 99); ground(g, 104, 159);
  put(g, "P", 2, 12);
  put(g, "f", 7, 12);                       // lab glassware
  put(g, "?", 12, 9); put(g, "B", 13, 9); put(g, "?", 14, 9);
  put(g, "E", 18, 12);
  row(g, "o", 12, 21, 24);
  row(g, "=", 9, 25, 28);
  row(g, "o", 8, 25, 28);
  row(g, "o", 9, 30, 32);
  put(g, "S", 38, 12);
  put(g, "?", 42, 9); put(g, "?", 44, 9);
  row(g, "o", 12, 48, 52);
  put(g, "G", 55, 6);
  row(g, "o", 9, 60, 62);
  put(g, "f", 68, 12);
  put(g, "E", 72, 12);
  row(g, "#", 12, 78, 82); row(g, "#", 11, 79, 81);   // lab bench mound
  row(g, "o", 9, 78, 82);
  put(g, "G", 92, 5);
  put(g, "S", 95, 12);
  row(g, "o", 9, 100, 103);
  put(g, "E", 112, 12);
  row(g, "o", 12, 116, 120);
  put(g, "G", 126, 6);
  row(g, "o", 12, 130, 134);
  stairs(g, 142, 4);
  put(g, "F", 152, 12);
  return {
    name: "WORLD 1-2",
    place: "SEOUL — SNU RESEARCH LAB (2021)",
    hudPlace: "SNU, SEOUL",
    intro: "Summer internship: Materials Science lab,\nSeoul National University. Finish ahead of schedule!",
    theme: "seoul",
    map: g.map(r => r.join("")),
    skills: ["Research Workflow", "Data Collection", "Data Analysis", "Self-Direction"]
  };
}

function buildLevel2() {
  const W = 170, g = newGrid(W);
  ground(g, 0, 29); ground(g, 33, 54); ground(g, 59, 89);
  ground(g, 93, 123); ground(g, 128, 169);
  put(g, "P", 2, 12);
  put(g, "?", 10, 9); put(g, "B", 11, 9); put(g, "?", 12, 9);
  put(g, "E", 18, 12);
  row(g, "o", 12, 22, 25);
  row(g, "o", 9, 30, 32);
  row(g, "=", 9, 36, 39);
  row(g, "o", 8, 36, 39);
  put(g, "?", 40, 5);
  put(g, "K", 45, 12);
  put(g, "G", 50, 6);
  row(g, "=", 10, 56, 57);                  // hop across the harbour
  row(g, "o", 9, 56, 57);
  put(g, "?", 62, 9); put(g, "?", 64, 9); put(g, "?", 66, 9);
  put(g, "E", 70, 12); put(g, "K", 75, 12);
  row(g, "o", 12, 80, 84);
  row(g, "o", 9, 90, 92);
  put(g, "G", 96, 5);
  put(g, "?", 100, 9); put(g, "B", 102, 9); put(g, "?", 104, 9);
  put(g, "E", 108, 12);
  row(g, "#", 12, 112, 116); row(g, "#", 11, 113, 115);   // sandstone quad
  row(g, "o", 9, 112, 116);
  put(g, "?", 118, 9); put(g, "?", 120, 9);
  put(g, "E", 121, 12);
  row(g, "o", 9, 124, 127);
  put(g, "K", 134, 12);
  put(g, "G", 138, 6);
  row(g, "o", 12, 140, 144);
  stairs(g, 150, 4);
  put(g, "F", 158, 12);
  return {
    name: "WORLD 1-3",
    place: "UNIVERSITY OF SYDNEY (2022–2026)",
    hudPlace: "USYD, SYDNEY",
    intro: "Bachelor of Advanced Computing.\nMind the null ghosts during exam season.",
    theme: "sydney",
    map: g.map(r => r.join("")),
    skills: ["Python", "Java", "SQL", "C++", "Bash Scripting", "Git", "Algorithms", "Operating Systems", "Computer Networks", "Artificial Intelligence"]
  };
}

function buildLevel3() {
  const W = 180, g = newGrid(W);
  ground(g, 0, 24); ground(g, 28, 49); ground(g, 54, 79);
  ground(g, 83, 107); ground(g, 113, 139); ground(g, 143, 179);
  put(g, "P", 2, 12);
  put(g, "v", 6, 12);
  put(g, "?", 8, 9); put(g, "?", 10, 9);
  put(g, "W", 16, 12);
  row(g, "o", 12, 19, 22);
  row(g, "o", 9, 25, 27);
  put(g, "E", 30, 12);
  put(g, "?", 34, 9); put(g, "B", 35, 9); put(g, "?", 36, 9);
  put(g, "W", 40, 12);
  put(g, "G", 45, 5);
  row(g, "o", 9, 50, 53);
  row(g, "=", 9, 60, 63);
  row(g, "o", 8, 60, 63);
  put(g, "?", 64, 5);
  put(g, "v", 58, 12);
  put(g, "H", 56, 12);
  put(g, "W", 70, 12);
  put(g, "G", 75, 6);
  row(g, "o", 9, 80, 82);
  row(g, "=", 8, 88, 91);
  row(g, "o", 7, 88, 91);
  put(g, "H", 90, 12);
  put(g, "?", 96, 9);
  put(g, "W", 100, 12);
  row(g, "=", 10, 109, 110);                // platform over the wide pit
  row(g, "o", 9, 109, 110);
  put(g, "G", 118, 5);
  put(g, "?", 120, 9);
  put(g, "v", 116, 12);
  put(g, "W", 125, 12);
  put(g, "H", 130, 12);
  row(g, "o", 12, 133, 137);
  row(g, "o", 9, 140, 142);
  put(g, "G", 146, 6);
  put(g, "W", 150, 12);
  put(g, "?", 154, 9); put(g, "?", 156, 9);
  row(g, "o", 12, 154, 158);
  stairs(g, 162, 5);
  put(g, "F", 172, 12);
  return {
    name: "WORLD 1-4",
    place: "SENSORWAY — ECOPRO, HUNGARY (2025–2026)",
    hudPlace: "SENSORWAY, HUNGARY",
    intro: "~750 sensors. Live rollout. Rogue containers on the loose.\nValidate the pipeline and reach the offer flag!",
    theme: "factory",
    map: g.map(r => r.join("")),
    skills: ["Docker", "Linux CLI", "REST API QA", "Data Pipelines", "PID Middleware", "Computer Vision", "System Monitoring", "CI/CD", "TCP/IP"]
  };
}

function buildBossLevel() {
  const W = 60, g = newGrid(W);
  ground(g, 0, 59);
  put(g, "P", 2, 12);
  put(g, "?", 10, 9); put(g, "?", 12, 9); put(g, "?", 14, 9);   // emergency skills
  col(g, "D", 48, 4, 12);                                       // the offer gate
  put(g, "F", 54, 12);
  return {
    name: "FINAL STAGE",
    place: "BOSS: THE JOB",
    hudPlace: "FINAL BOSS: THE JOB",
    intro: "Every graduate's final boss: THE JOB.\nStomps won't work — it only takes damage from skills (X / J)!",
    theme: "boss",
    map: g.map(r => r.join("")),
    skills: ["Technical Documentation", "Agile Workflows", "Cross-team Coordination"],
    boss: true
  };
}

const LEVELS = [buildLevel1(), buildLevelSeoul(), buildLevel2(), buildLevel3(), buildBossLevel()];

/* ------------------------------------------------------------------ state */
const game = {
  state: "title",          // title | card | play | clear | gameover | win
  levelIndex: 0,
  lives: 3,
  commits: 0,
  bugsFixed: 0,            // ticket counter
  shotIndex: 0,            // which skill gets thrown next
  skills: [],              // collected skill names, in order
  stateTimer: 0,
  frame: 0
};

let grid = [];             // mutable copy of current level map
let mapW = 0;
let skillQueue = [];
let enemies = [];
let shots = [];            // skills in flight
let boss = null;           // THE JOB
let bossShots = [];        // rejection letters
let floaters = [];         // rising "+SKILL" texts
let particles = [];
let banner = null;         // big "SKILL UNLOCKED" banner
let cameraX = 0;
let flagX = 0;

const player = {
  x: 0, y: 0, w: 24, h: 30,
  vx: 0, vy: 0,
  facing: 1,
  onGround: false,
  invuln: 0,
  atkCd: 0,
  animPhase: 0
};

function loadLevel(index) {
  const lvl = LEVELS[index];
  grid = lvl.map.map(r => r.split(""));
  mapW = grid[0].length;
  skillQueue = lvl.skills.slice();
  enemies = [];
  shots = [];
  bossShots = [];
  boss = lvl.boss
    ? { x: 34 * TILE, y: 8 * TILE, w: 92, h: 72, vx: -1.2, vy: 0,
        hp: 10, maxHp: 10, t: 0, hurtT: 0, alive: true, onGround: false, hintShown: false }
    : null;
  floaters = [];
  particles = [];
  banner = null;
  cameraX = 0;
  flagX = 0;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < mapW; x++) {
      const ch = grid[y][x];
      if (ch === "P") {
        grid[y][x] = " ";
        player.x = x * TILE + 6;
        player.y = (y + 1) * TILE - player.h;
      } else if ("EWGMKSH".indexOf(ch) !== -1) {
        grid[y][x] = " ";
        enemies.push(makeEnemy(ch, x, y));
      } else if (ch === "F") {
        grid[y][x] = " ";
        flagX = x * TILE + TILE / 2;
      }
    }
  }
  player.vx = 0; player.vy = 0;
  player.invuln = 0;
}

const MOB_DEFS = {
  E: { label: "API BUG", w: 26, h: 20, speed: 1.0 },
  W: { label: "ROGUE CONTAINER", w: 30, h: 26, speed: 0.7 },
  M: { label: "WILD MANDARIN", w: 24, h: 24, speed: 1.1, hop: 85 },
  K: { label: "DROP BEAR", w: 28, h: 26, speed: 0.6, nap: true },
  S: { label: "UNSTABLE SAMPLE", w: 24, h: 26, speed: 0.8, hop: 115 },
  H: { label: "SPICY PAPRIKA", w: 22, h: 26, speed: 1.5 }
};

function makeEnemy(type, tx, ty) {
  if (type === "G") {
    return {
      type: "G", label: "null",
      x: tx * TILE, y: ty * TILE, baseY: ty * TILE,
      w: 28, h: 26, vx: 0, vy: 0, dir: -1,
      dead: false, deadTimer: 0, t: Math.PI * 2 * ((tx % 7) / 7)
    };
  }
  const def = MOB_DEFS[type];
  return {
    type, label: def.label, def,
    x: tx * TILE + 4, y: (ty + 1) * TILE - def.h,
    w: def.w, h: def.h,
    vx: -def.speed, vy: 0, dir: -1,
    dead: false, deadTimer: 0, t: 0, frames: 0, napT: 0, napping: false
  };
}

/* -------------------------------------------------------------- collision */
function tileAt(tx, ty) {
  if (tx < 0 || tx >= mapW) return "#";   // walls at level edges
  if (ty < 0) return " ";
  if (ty >= ROWS) return " ";
  return grid[ty][tx];
}
function isSolid(ch) { return SOLID.indexOf(ch) !== -1; }

function collideX(b) {
  const top = Math.floor(b.y / TILE);
  const bottom = Math.floor((b.y + b.h - 1) / TILE);
  if (b.vx > 0) {
    const tx = Math.floor((b.x + b.w) / TILE);
    for (let ty = top; ty <= bottom; ty++) {
      if (isSolid(tileAt(tx, ty))) {
        b.x = tx * TILE - b.w - 0.01;
        return true;
      }
    }
  } else if (b.vx < 0) {
    const tx = Math.floor(b.x / TILE);
    for (let ty = top; ty <= bottom; ty++) {
      if (isSolid(tileAt(tx, ty))) {
        b.x = (tx + 1) * TILE + 0.01;
        return true;
      }
    }
  }
  return false;
}

function collideY(b, isPlayer) {
  const left = Math.floor(b.x / TILE);
  const right = Math.floor((b.x + b.w - 1) / TILE);
  if (b.vy > 0) {
    const ty = Math.floor((b.y + b.h) / TILE);
    for (let tx = left; tx <= right; tx++) {
      if (isSolid(tileAt(tx, ty))) {
        b.y = ty * TILE - b.h - 0.01;
        b.vy = 0;
        b.onGround = true;
        return true;
      }
    }
  } else if (b.vy < 0) {
    const ty = Math.floor(b.y / TILE);
    let bumped = false;
    for (let tx = left; tx <= right; tx++) {
      const ch = tileAt(tx, ty);
      if (isSolid(ch)) {
        b.y = (ty + 1) * TILE + 0.01;
        b.vy = 0;
        bumped = true;
        if (isPlayer && ch === "?") activateBlock(tx, ty);
        else if (isPlayer) sfx.bump();
      }
    }
    return bumped;
  }
  return false;
}

function activateBlock(tx, ty) {
  grid[ty][tx] = "X";
  const px = tx * TILE + TILE / 2;
  const py = ty * TILE;
  if (skillQueue.length > 0) {
    const skill = skillQueue.shift();
    game.skills.push(skill);
    banner = { skill, t: 0, hint: game.skills.length === 1 };
    floaters.push({ x: px, y: py - 6, text: "+ " + skill.toUpperCase(), t: 0, life: 130, color: "#ffd95e", size: 19 });
    sfx.skill();
  } else {
    game.commits++;
    floaters.push({ x: px, y: py - 6, text: "+1 COMMIT", t: 0, life: 70, color: "#ffe9a8" });
    sfx.coin();
  }
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: px, y: py,
      vx: (i - 2.5) * 0.9, vy: -3 - (i % 3),
      t: 0, life: 28, color: "#ffd95e"
    });
  }
}

/* ----------------------------------------------------------------- combat */
const TICKET_LINES = {
  E: ["closed: could not reproduce", "resolved: off-by-one error", "squashed in code review", "closed: works on my machine"],
  G: ["NullPointerException handled", "null check added", "fixed: undefined is not a function"],
  W: ["docker stop → exit code 0", "rogue container OOM-killed", "re-orchestrated. it's fine now."],
  M: ["peeled and shipped", "juiced: vitamin C restored", "merged into marmalade"],
  K: ["dropped from the tree, not from prod", "rebased onto a eucalyptus branch", "naps rescheduled off-sprint"],
  S: ["experiment now reproducible", "lab results: stable", "documented in the lab notebook"],
  H: ["de-spiced: severity mild", "seasoning rolled back", "goulash deployed to prod"]
};

function killEnemy(e, skill) {
  e.dead = true;
  e.deadTimer = 0;
  game.commits += 2;
  game.bugsFixed++;
  const id = "BUG-" + String(game.bugsFixed).padStart(3, "0");
  const lines = TICKET_LINES[e.type];
  const msg = skill
    ? id + " fixed with " + skill.toUpperCase()
    : id + " " + lines[game.bugsFixed % lines.length];
  floaters.push({ x: e.x + e.w / 2, y: e.y - 4, text: msg, t: 0, life: 95, color: "#9be564", size: 15 });
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: e.x + e.w / 2, y: e.y + e.h / 2,
      vx: Math.cos(i * 0.785) * 2.4, vy: Math.sin(i * 0.785) * 2.4 - 1,
      t: 0, life: 24, color: "#9be564"
    });
  }
  sfx.stomp();
}

function defeatBoss() {
  boss.alive = false;
  game.bugsFixed++;   // the biggest bug of all: unemployment
  floaters.push({
    x: boss.x + boss.w / 2, y: boss.y - 20,
    text: "OFFER EXTENDED — GATE UNLOCKED!", t: 0, life: 150, color: "#ffd95e", size: 18
  });
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: boss.x + boss.w / 2, y: boss.y + boss.h / 2,
      vx: Math.cos(i * 0.157) * (2 + (i % 4)), vy: Math.sin(i * 0.157) * (2 + (i % 4)) - 2,
      t: 0, life: 50, color: i % 2 ? "#ffd95e" : "#9be564"
    });
  }
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < mapW; x++) {
      if (grid[y][x] === "D") {
        grid[y][x] = " ";
        particles.push({ x: x * TILE + 18, y: y * TILE + 18, vx: (x % 3) - 1, vy: -2, t: 0, life: 32, color: "#ffd95e" });
      }
    }
  }
  sfx.clear();
}

/* ----------------------------------------------------------------- update */
function updatePlay() {
  // --- player input
  let move = 0;
  if (input.left) move -= 1;
  if (input.right) move += 1;
  player.vx = move * MOVE_SPEED;
  if (move !== 0) {
    player.facing = move;
    player.animPhase += 0.25;
  }
  if (input.jump && player.onGround) {
    player.vy = JUMP_VEL;
    player.onGround = false;
    sfx.jump();
  }
  if (!input.jump && player.vy < -4) player.vy = -4;   // variable jump height

  // --- player physics
  player.x += player.vx;
  collideX(player);
  if (player.x < 0) player.x = 0;
  player.vy += GRAVITY;
  if (player.vy > MAX_FALL) player.vy = MAX_FALL;
  player.y += player.vy;
  player.onGround = false;
  collideY(player, true);
  if (player.invuln > 0) player.invuln--;

  // --- throw a collected skill at the bugs (X / J)
  if (player.atkCd > 0) player.atkCd--;
  if (input.attack && player.atkCd <= 0) {
    if (game.skills.length > 0) {
      const skill = game.skills[game.shotIndex % game.skills.length];
      game.shotIndex++;
      shots.push({
        x: player.x + (player.facing > 0 ? player.w + 2 : -12 - skill.length * 7),
        y: player.y + 8, vx: player.facing * 9.5,
        w: 12 + skill.length * 7, skill, t: 0, life: 60
      });
      player.atkCd = 24;
      sfx.shoot();
    } else {
      player.atkCd = 80;
      floaters.push({
        x: player.x + player.w / 2, y: player.y - 10,
        text: "no skills equipped — hit a ? block!", t: 0, life: 75, color: "#9aa3c0", size: 12
      });
    }
  }
  for (const s of shots) {
    s.t++;
    s.x += s.vx;
    const edgeX = s.vx > 0 ? s.x + s.w : s.x;
    if (isSolid(tileAt(Math.floor(edgeX / TILE), Math.floor((s.y + 8) / TILE)))) {
      s.t = s.life;
      continue;
    }
    for (const e of enemies) {
      if (!e.dead && s.x < e.x + e.w && s.x + s.w > e.x &&
          s.y < e.y + e.h && s.y + 16 > e.y) {
        killEnemy(e, s.skill);
        s.t = s.life;
        break;
      }
    }
    if (boss && boss.alive && s.t < s.life &&
        s.x < boss.x + boss.w && s.x + s.w > boss.x &&
        s.y < boss.y + boss.h && s.y + 16 > boss.y) {
      s.t = s.life;
      boss.hp--;
      boss.hurtT = 18;
      sfx.stomp();
      floaters.push({
        x: boss.x + boss.w / 2, y: boss.y - 10,
        text: "REQUIREMENT MET: " + s.skill.toUpperCase() + " ✓",
        t: 0, life: 80, color: "#9be564", size: 15
      });
      if (boss.hp <= 0) defeatBoss();
    }
  }
  shots = shots.filter(s => s.t < s.life);

  // --- fell into a pit (production incident)
  if (player.y > ROWS * TILE + 80) { loseLife(true); return; }

  // --- coins
  const cl = Math.floor(player.x / TILE), cr = Math.floor((player.x + player.w - 1) / TILE);
  const ct = Math.floor(player.y / TILE), cb = Math.floor((player.y + player.h - 1) / TILE);
  for (let ty = ct; ty <= cb; ty++) {
    for (let tx = cl; tx <= cr; tx++) {
      if (tileAt(tx, ty) === "o") {
        grid[ty][tx] = " ";
        game.commits++;
        sfx.coin();
        floaters.push({ x: tx * TILE + TILE / 2, y: ty * TILE, text: "+1", t: 0, life: 40, color: "#ffe9a8" });
      }
    }
  }

  // --- enemies
  for (const e of enemies) {
    if (e.dead) { e.deadTimer++; continue; }
    if (e.type === "G") {
      e.t += 0.05;
      e.y = e.baseY + Math.sin(e.t) * 22;
      const dx = (player.x + player.w / 2) - (e.x + e.w / 2);
      if (Math.abs(dx) < 360) {
        e.x += Math.sign(dx) * 0.55;
        e.dir = Math.sign(dx) || e.dir;
      }
    } else {
      e.frames++;
      if (e.def && e.def.nap) {                       // koalas nap on the job
        e.napT = (e.napT + 1) % 330;
        e.napping = e.napT >= 230;
      }
      if (e.def && e.def.hop && e.onGround && e.frames % e.def.hop === 0) e.vy = -7;
      e.vy += GRAVITY;
      if (e.vy > MAX_FALL) e.vy = MAX_FALL;
      if (!e.napping) e.x += e.vx;
      if (collideX(e)) { e.vx = -e.vx; e.dir = -e.dir; }
      e.y += e.vy;
      e.onGround = false;
      collideY(e, false);
      // turn around at platform edges
      if (e.onGround) {
        const aheadX = e.vx > 0 ? e.x + e.w + 2 : e.x - 2;
        const below = tileAt(Math.floor(aheadX / TILE), Math.floor((e.y + e.h + 4) / TILE));
        if (!isSolid(below)) { e.vx = -e.vx; e.dir = -e.dir; }
      }
      if (e.y > ROWS * TILE + 120) { e.dead = true; e.deadTimer = 999; }
      e.t += 0.2;
    }

    // --- player vs enemy
    if (player.invuln === 0 &&
        player.x < e.x + e.w && player.x + player.w > e.x &&
        player.y < e.y + e.h && player.y + player.h > e.y) {
      const falling = player.vy > 0;
      const fromAbove = (player.y + player.h) - e.y < 16;
      if (falling && fromAbove) {
        killEnemy(e, null);
        player.vy = -7.5;
      } else {
        loseLife(false);
        if (game.state !== "play") return;
      }
    }
  }
  enemies = enemies.filter(e => !e.dead || e.deadTimer < 40);

  // --- THE JOB (final boss)
  if (boss && boss.alive) {
    boss.t++;
    if (boss.hurtT > 0) boss.hurtT--;
    const toPlayer = Math.sign((player.x + player.w / 2) - (boss.x + boss.w / 2)) || 1;
    if (boss.onGround) {
      boss.vx = toPlayer * 1.25;
      if (boss.t % 110 === 0) boss.vy = -9.5;
    }
    boss.x += boss.vx;
    collideX(boss);
    boss.vy += GRAVITY;
    if (boss.vy > MAX_FALL) boss.vy = MAX_FALL;
    boss.y += boss.vy;
    boss.onGround = false;
    collideY(boss, false);
    // rejection letters
    if (boss.t % 130 === 65) {
      for (const speed of [2.2, 3.6]) {
        bossShots.push({ x: boss.x + boss.w / 2, y: boss.y + 14, vx: toPlayer * speed, vy: -7.5, t: 0 });
      }
      sfx.bump();
    }
    // contact
    if (player.invuln === 0 &&
        player.x < boss.x + boss.w && player.x + player.w > boss.x &&
        player.y < boss.y + boss.h && player.y + player.h > boss.y) {
      if (player.vy > 0 && (player.y + player.h) - boss.y < 18) {
        player.vy = -10;
        if (!boss.hintShown) {
          boss.hintShown = true;
          floaters.push({
            x: boss.x + boss.w / 2, y: boss.y - 16,
            text: "THE JOB ignores stomps — throw your skills! (X / J)",
            t: 0, life: 120, color: "#ffd95e", size: 14
          });
        }
      } else {
        loseLife(false);
        if (game.state !== "play") return;
      }
    }
  }
  for (const p of bossShots) {
    p.t++;
    p.x += p.vx;
    p.vy += 0.38;
    p.y += p.vy;
    if (player.invuln === 0 &&
        p.x > player.x - 9 && p.x < player.x + player.w + 9 &&
        p.y > player.y - 7 && p.y < player.y + player.h + 7) {
      p.t = 9999;
      loseLife(false);
      if (game.state !== "play") return;
    }
  }
  bossShots = bossShots.filter(p => p.t < 9999 && p.y < ROWS * TILE + 60);

  // --- flag
  if (flagX > 0 && player.x + player.w > flagX - 10) {
    game.state = "clear";
    game.stateTimer = 0;
    sfx.clear();
  }

  // --- effects
  for (const f of floaters) { f.t++; f.y -= 0.55; }
  floaters = floaters.filter(f => f.t < f.life);
  for (const p of particles) { p.t++; p.x += p.vx; p.y += p.vy; p.vy += 0.25; }
  particles = particles.filter(p => p.t < p.life);

  // --- camera
  const target = player.x + player.w / 2 - VIEW_W / 2;
  cameraX = Math.max(0, Math.min(target, mapW * TILE - VIEW_W));
}

function loseLife(fellInPit) {
  game.lives--;
  sfx.hurt();
  if (game.lives <= 0) {
    game.state = "gameover";
    game.stateTimer = 0;
    sfx.over();
    return;
  }
  if (fellInPit) {
    loadLevel(game.levelIndex);   // respawn at the start of the level
  } else {
    player.invuln = 100;
    player.vy = -8;
    player.x -= player.facing * 24;
    if (player.x < 0) player.x = 0;
  }
}

/* --------------------------------------------------------------- controls */
const input = { left: false, right: false, jump: false, attack: false };
const KEYMAP = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "jump", KeyW: "jump", Space: "jump",
  KeyX: "attack", KeyJ: "attack"
};

window.addEventListener("keydown", e => {
  ensureAudio();
  if (KEYMAP[e.code]) { input[KEYMAP[e.code]] = true; e.preventDefault(); }
  if (e.code === "Enter") {
    if (game.state === "title" || game.state === "gameover" || game.state === "win") startGame();
  }
  if (e.code === "KeyR") startGame();
});
window.addEventListener("keyup", e => {
  if (KEYMAP[e.code]) { input[KEYMAP[e.code]] = false; e.preventDefault(); }
});

// touch controls
function bindTouch(id, prop) {
  const el = document.getElementById(id);
  const on = e => { ensureAudio(); input[prop] = true; e.preventDefault();
                    if (game.state !== "play" && game.state !== "card" && prop === "jump") startGame(); };
  const off = e => { input[prop] = false; e.preventDefault(); };
  el.addEventListener("touchstart", on, { passive: false });
  el.addEventListener("touchend", off, { passive: false });
  el.addEventListener("touchcancel", off, { passive: false });
}
if ("ontouchstart" in window) {
  document.getElementById("touch").style.display = "flex";
  bindTouch("btnL", "left");
  bindTouch("btnR", "right");
  bindTouch("btnJ", "jump");
  bindTouch("btnA", "attack");
  canvas.addEventListener("touchstart", e => {
    ensureAudio();
    if (game.state === "title" || game.state === "gameover" || game.state === "win") startGame();
    e.preventDefault();
  }, { passive: false });
}

function startGame() {
  game.levelIndex = 0;
  game.lives = 3;
  game.commits = 0;
  game.bugsFixed = 0;
  game.shotIndex = 0;
  game.skills = [];
  game.state = "card";
  game.stateTimer = 0;
  loadLevel(0);
}

/* -------------------------------------------------------------- rendering */
function drawBackground(theme) {
  const f = game.frame;
  if (theme === "jeju") {
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#69bcdc"); sky.addColorStop(1, "#cdeffd");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // tangerine sun
    ctx.fillStyle = "#ff9f43";
    ctx.beginPath(); ctx.arc(120, 90, 38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(112, 48, 16, 8); // tangerine leaf
    // Hallasan
    const mx = -cameraX * 0.2;
    ctx.fillStyle = "#3c6e47";
    ctx.beginPath();
    ctx.moveTo(mx + 250, 430); ctx.lineTo(mx + 540, 200); ctx.lineTo(mx + 830, 430);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#2a4d33";
    ctx.beginPath();
    ctx.moveTo(mx + 470, 255); ctx.lineTo(mx + 540, 200); ctx.lineTo(mx + 610, 255);
    ctx.closePath(); ctx.fill();
    // sea
    ctx.fillStyle = "#2f7fa8";
    ctx.fillRect(0, 430, VIEW_W, VIEW_H - 430);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 6; i++) {
      const wx = ((i * 210 - cameraX * 0.4 + f * 0.4) % (VIEW_W + 120)) - 60;
      ctx.fillRect(wx, 445 + (i % 3) * 24, 56, 3);
    }
    // palms
    for (let i = 0; i < 4; i++) {
      const px = ((i * 420 + 90 - cameraX * 0.5) % (VIEW_W + 300)) - 150;
      ctx.fillStyle = "#6d4c2f";
      ctx.fillRect(px, 360, 10, 72);
      ctx.fillStyle = "#3f9b4f";
      for (let a = 0; a < 5; a++) {
        ctx.beginPath();
        ctx.ellipse(px + 5, 358, 34, 9, (a - 2) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (theme === "seoul") {
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#28335f"); sky.addColorStop(1, "#e8927c");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // far skyline with lit windows
    const bx = -cameraX * 0.2;
    for (let i = 0; i < 9; i++) {
      const h = 90 + ((i * 67) % 110);
      const sx = bx + i * 150;
      ctx.fillStyle = "#222c52";
      ctx.fillRect(sx, 430 - h, 80, h);
      ctx.fillStyle = "#ffd97a";
      for (let wy = 0; wy < Math.floor(h / 26); wy++)
        for (let wx = 0; wx < 3; wx++)
          if ((i * 7 + wy * 3 + wx) % 3 === 0)
            ctx.fillRect(sx + 12 + wx * 24, 438 - h + wy * 26, 6, 8);
    }
    // Namsan hill + N Seoul Tower
    const mx = -cameraX * 0.3;
    ctx.fillStyle = "#1d2b3f";
    ctx.beginPath();
    ctx.moveTo(mx + 420, 430); ctx.quadraticCurveTo(mx + 640, 250, mx + 860, 430);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#37474f";
    ctx.fillRect(mx + 634, 195, 12, 115);
    ctx.fillStyle = "#546e7a";
    ctx.fillRect(mx + 622, 215, 36, 16);
    ctx.fillRect(mx + 627, 231, 26, 8);
    ctx.fillStyle = "#37474f";
    ctx.fillRect(mx + 638, 165, 4, 30);
    ctx.fillStyle = (f % 70) < 35 ? "#ff5252" : "#5a2030";
    ctx.beginPath(); ctx.arc(mx + 640, 162, 4, 0, Math.PI * 2); ctx.fill();
    // Han river
    ctx.fillStyle = "#33456e";
    ctx.fillRect(0, 430, VIEW_W, VIEW_H - 430);
    ctx.fillStyle = "rgba(255,217,122,0.25)";
    for (let i = 0; i < 6; i++) {
      const wx = ((i * 210 - cameraX * 0.4 + f * 0.3) % (VIEW_W + 120)) - 60;
      ctx.fillRect(wx, 448 + (i % 3) * 22, 52, 3);
    }
  } else if (theme === "sydney") {
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#3a6ea5"); sky.addColorStop(1, "#ffd9a0");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    const bx = -cameraX * 0.25;
    // Harbour Bridge
    ctx.strokeStyle = "#37474f"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(bx - 40, 330);
    ctx.quadraticCurveTo(bx + 230, 110, bx + 500, 330); ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(bx - 40, 330); ctx.lineTo(bx + 500, 330); ctx.stroke();
    ctx.lineWidth = 2;
    for (let i = 1; i < 10; i++) {
      const sx = bx - 40 + i * 54;
      const t = i / 10;
      const arcY = 330 - 440 * t * (1 - t) * 2 * 0.5 - 110 * Math.sin(Math.PI * t) * 0.55;
      ctx.beginPath(); ctx.moveTo(sx, 330); ctx.lineTo(sx, arcY + 40); ctx.stroke();
    }
    // Opera House
    const ox = -cameraX * 0.35 + 560;
    ctx.fillStyle = "#f5f0e6";
    for (let i = 0; i < 4; i++) {
      const sx = ox + i * 62, h = 96 - i * 14;
      ctx.beginPath();
      ctx.moveTo(sx, 400);
      ctx.quadraticCurveTo(sx + 50, 400 - h - 36, sx + 86, 400);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#cabfa8"; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.fillStyle = "#2f5f8f";
    ctx.fillRect(0, 400, VIEW_W, VIEW_H - 400);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    for (let i = 0; i < 5; i++) {
      const wx = ((i * 240 - cameraX * 0.45 + f * 0.35) % (VIEW_W + 120)) - 60;
      ctx.fillRect(wx, 418 + (i % 3) * 22, 50, 3);
    }
  } else if (theme === "boss") {
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#0e0f24"); sky.addColorStop(1, "#2a2444");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // corporate towers
    const bx = -cameraX * 0.25;
    for (let i = 0; i < 7; i++) {
      const h = 160 + ((i * 97) % 180);
      const sx = bx + i * 190;
      ctx.fillStyle = "#1a1f3d";
      ctx.fillRect(sx, 470 - h, 120, h);
      ctx.fillStyle = "#ffe9a8";
      for (let wy = 0; wy < Math.floor(h / 30); wy++)
        for (let wx = 0; wx < 4; wx++)
          if ((i * 11 + wy * 5 + wx) % 4 === 0)
            ctx.fillRect(sx + 14 + wx * 26, 480 - h + wy * 30, 8, 10);
    }
    // searchlight beams sweeping the sky
    for (const [ox, phase] of [[200, 0], [720, 2.1]]) {
      const ang = -Math.PI / 2 + Math.sin(f * 0.012 + phase) * 0.7;
      ctx.fillStyle = "rgba(255,217,94,0.10)";
      ctx.beginPath();
      ctx.moveTo(ox, 480);
      ctx.lineTo(ox + Math.cos(ang - 0.09) * 620, 480 + Math.sin(ang - 0.09) * 620);
      ctx.lineTo(ox + Math.cos(ang + 0.09) * 620, 480 + Math.sin(ang + 0.09) * 620);
      ctx.closePath(); ctx.fill();
    }
    // NOW HIRING sign
    const hx = -cameraX * 0.4 + 540;
    ctx.fillStyle = "#11122c";
    ctx.fillRect(hx, 130, 230, 64);
    ctx.strokeStyle = (f >> 4) % 2 === 0 ? "#ff5e8a" : "#7ec8e3";
    ctx.lineWidth = 4;
    ctx.strokeRect(hx + 4, 134, 222, 56);
    ctx.fillStyle = (f >> 4) % 2 === 0 ? "#ff5e8a" : "#7ec8e3";
    ctx.font = "bold 24px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("NOW HIRING", hx + 115, 170);
  } else { // factory
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#1b1b35"); sky.addColorStop(1, "#4a3f63");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // stars
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 26; i++) {
      const sx = (i * 137 + 31) % VIEW_W;
      const sy = (i * 79 + 17) % 200;
      if ((f >> 4) % 7 !== i % 7) ctx.fillRect(sx, sy, 2, 2);
    }
    // factory silhouettes
    const fx = -cameraX * 0.25;
    ctx.fillStyle = "#23233f";
    for (let i = 0; i < 6; i++) {
      const sx = fx + i * 300;
      ctx.fillRect(sx, 280, 200, 200);
      ctx.fillRect(sx + 30, 220, 26, 70);
      ctx.fillRect(sx + 120, 240, 26, 50);
      ctx.fillStyle = "#11112a";
      ctx.beginPath();
      ctx.moveTo(sx + 200, 300); ctx.lineTo(sx + 250, 280); ctx.lineTo(sx + 250, 480);
      ctx.lineTo(sx + 200, 480); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#23233f";
    }
    // sensor towers with blinking lights
    const tx2 = -cameraX * 0.45;
    for (let i = 0; i < 7; i++) {
      const sx = tx2 + i * 260 + 60;
      ctx.fillStyle = "#39395c";
      ctx.fillRect(sx, 310, 8, 170);
      ctx.fillRect(sx - 8, 310, 24, 10);
      const blink = (f + i * 20) % 90 < 45;
      ctx.fillStyle = blink ? "#ff5252" : "#5a2030";
      ctx.beginPath(); ctx.arc(sx + 4, 304, 5, 0, Math.PI * 2); ctx.fill();
    }
    // stacked shipping containers (docker blue)
    const cx2 = -cameraX * 0.6;
    for (let i = 0; i < 5; i++) {
      const sx = cx2 + i * 430 + 140;
      ctx.fillStyle = "#1d63aa"; ctx.fillRect(sx, 440, 90, 34);
      ctx.fillStyle = "#2e86d1"; ctx.fillRect(sx + 14, 406, 90, 34);
      ctx.fillStyle = "#16518c"; ctx.fillRect(sx + 110, 440, 90, 34);
    }
  }
}

function themeColors(theme) {
  if (theme === "jeju") return { top: "#5cb85c", body: "#5d4037", body2: "#4e342e" };
  if (theme === "seoul") return { top: "#9fb4c7", body: "#5a6f80", body2: "#475a68" };
  if (theme === "sydney") return { top: "#d9b35c", body: "#a8854a", body2: "#8c6d3a" };
  if (theme === "boss") return { top: "#5662a8", body: "#333a56", body2: "#272d45" };
  return { top: "#7a7f93", body: "#4d4f63", body2: "#3c3e50" };
}

function drawTiles(theme) {
  const colors = themeColors(theme);
  const x0 = Math.floor(cameraX / TILE);
  const x1 = Math.min(mapW - 1, x0 + Math.ceil(VIEW_W / TILE) + 1);
  for (let y = 0; y < ROWS; y++) {
    for (let x = x0; x <= x1; x++) {
      const ch = grid[y][x];
      if (ch === " ") continue;
      const sx = x * TILE - cameraX;
      const sy = y * TILE;
      switch (ch) {
        case "#": {
          const topExposed = !isSolid(tileAt(x, y - 1));
          ctx.fillStyle = topExposed ? colors.top : colors.body;
          ctx.fillRect(sx, sy, TILE, TILE);
          if (topExposed) {
            ctx.fillStyle = colors.body;
            ctx.fillRect(sx, sy + 10, TILE, TILE - 10);
          }
          ctx.fillStyle = colors.body2;
          ctx.fillRect(sx, sy + TILE - 4, TILE, 4);
          ctx.fillRect(sx + TILE - 3, sy + 12, 3, TILE - 12);
          break;
        }
        case "B": {
          ctx.fillStyle = "#b0563a";
          ctx.fillRect(sx, sy, TILE, TILE);
          ctx.fillStyle = "#7e3b27";
          ctx.fillRect(sx, sy + 16, TILE, 3);
          ctx.fillRect(sx + 16, sy, 3, 16);
          ctx.fillRect(sx + 8, sy + 19, 3, 17);
          ctx.fillRect(sx + 24, sy + 19, 3, 17);
          ctx.strokeStyle = "#5e2b1b"; ctx.lineWidth = 2;
          ctx.strokeRect(sx + 1, sy + 1, TILE - 2, TILE - 2);
          break;
        }
        case "?": {
          const pulse = Math.sin(game.frame * 0.1) * 2;
          ctx.fillStyle = "#f7b733";
          ctx.fillRect(sx, sy, TILE, TILE);
          ctx.strokeStyle = "#8c5a10"; ctx.lineWidth = 3;
          ctx.strokeRect(sx + 2, sy + 2, TILE - 4, TILE - 4);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 22px 'Courier New'";
          ctx.textAlign = "center";
          ctx.fillText("?", sx + TILE / 2, sy + 26 + pulse * 0.4);
          break;
        }
        case "X": {
          ctx.fillStyle = "#8a6d3b";
          ctx.fillRect(sx, sy, TILE, TILE);
          ctx.strokeStyle = "#5f4a26"; ctx.lineWidth = 3;
          ctx.strokeRect(sx + 2, sy + 2, TILE - 4, TILE - 4);
          ctx.fillStyle = "#5f4a26";
          ctx.fillRect(sx + 8, sy + 8, 4, 4);
          ctx.fillRect(sx + TILE - 12, sy + 8, 4, 4);
          ctx.fillRect(sx + 8, sy + TILE - 12, 4, 4);
          ctx.fillRect(sx + TILE - 12, sy + TILE - 12, 4, 4);
          break;
        }
        case "=": {
          ctx.fillStyle = "#3aa17e";
          ctx.fillRect(sx, sy, TILE, 14);
          ctx.fillStyle = "#2b7a5f";
          ctx.fillRect(sx, sy + 10, TILE, 4);
          ctx.fillStyle = "#54c79a";
          ctx.fillRect(sx, sy, TILE, 3);
          break;
        }
        case "o": {
          const bob = Math.sin(game.frame * 0.12 + x) * 2;
          ctx.fillStyle = "#ffd95e";
          ctx.beginPath();
          ctx.ellipse(sx + TILE / 2, sy + TILE / 2 + bob, 9, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#b3852e"; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = "#b3852e";
          ctx.font = "bold 13px 'Courier New'";
          ctx.textAlign = "center";
          ctx.fillText("C", sx + TILE / 2, sy + TILE / 2 + 5 + bob);
          break;
        }
        case "c": {  // decorative coffee machine
          ctx.fillStyle = "#37474f";
          ctx.fillRect(sx + 4, sy + 2, 28, 34);
          ctx.fillStyle = "#90a4ae";
          ctx.fillRect(sx + 8, sy + 6, 20, 8);
          ctx.fillStyle = "#ffab40";
          ctx.fillRect(sx + 14, sy + 18, 8, 4);
          ctx.fillStyle = "#6d4c41";
          ctx.fillRect(sx + 13, sy + 26, 10, 8);
          // steam
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          const st = (game.frame * 0.6) % 26;
          ctx.fillRect(sx + 16, sy - st, 3, 5);
          break;
        }
        case "D": {  // the offer gate — opens when THE JOB is defeated
          ctx.fillStyle = "#caa84a";
          ctx.fillRect(sx, sy, TILE, TILE);
          ctx.fillStyle = "#1a1a2e";
          ctx.beginPath();
          ctx.moveTo(sx, sy + 24); ctx.lineTo(sx + 24, sy); ctx.lineTo(sx + 36, sy);
          ctx.lineTo(sx, sy + 36); ctx.closePath(); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(sx + 24, sy + 36); ctx.lineTo(sx + 36, sy + 24);
          ctx.lineTo(sx + 36, sy + 36); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = "#8c7322"; ctx.lineWidth = 2;
          ctx.strokeRect(sx + 1, sy + 1, TILE - 2, TILE - 2);
          break;
        }
        case "f": {  // decorative lab flask (SNU materials science)
          ctx.fillStyle = "#90a4ae";
          ctx.fillRect(sx + 6, sy + 32, 24, 4);
          ctx.fillStyle = "rgba(207,226,243,0.85)";
          ctx.beginPath();
          ctx.moveTo(sx + 15, sy + 6); ctx.lineTo(sx + 21, sy + 6);
          ctx.lineTo(sx + 21, sy + 16); ctx.lineTo(sx + 28, sy + 32);
          ctx.lineTo(sx + 8, sy + 32); ctx.lineTo(sx + 15, sy + 16);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#69f0ae";
          ctx.beginPath();
          ctx.moveTo(sx + 11.5, sy + 24); ctx.lineTo(sx + 24.5, sy + 24);
          ctx.lineTo(sx + 28, sy + 32); ctx.lineTo(sx + 8, sy + 32);
          ctx.closePath(); ctx.fill();
          const bub = (game.frame % 50) / 50;
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.beginPath(); ctx.arc(sx + 18, sy + 30 - bub * 5, 2, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case "v": {  // decorative smart sensor post
          ctx.fillStyle = "#546e7a";
          ctx.fillRect(sx + 15, sy + 8, 6, 28);
          ctx.fillStyle = "#90a4ae";
          ctx.fillRect(sx + 8, sy + 2, 20, 10);
          const on = (game.frame + x * 13) % 60 < 30;
          ctx.fillStyle = on ? "#69f0ae" : "#1b5e20";
          ctx.beginPath(); ctx.arc(sx + 18, sy + 7, 3, 0, Math.PI * 2); ctx.fill();
          break;
        }
      }
    }
  }
}

function drawFlag() {
  if (flagX <= 0) return;
  const sx = flagX - cameraX;
  const baseY = 13 * TILE;
  const final = game.levelIndex === LEVELS.length - 1;
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(sx - 3, baseY - 7 * TILE, 6, 7 * TILE);
  ctx.fillStyle = "#ffd95e";
  ctx.beginPath(); ctx.arc(sx, baseY - 7 * TILE, 7, 0, Math.PI * 2); ctx.fill();
  const wave = Math.sin(game.frame * 0.1) * 4;
  ctx.fillStyle = final ? "#9be564" : "#ef5350";
  ctx.beginPath();
  ctx.moveTo(sx + 3, baseY - 7 * TILE + 8);
  ctx.lineTo(sx + 64 + wave, baseY - 7 * TILE + 24);
  ctx.lineTo(sx + 3, baseY - 7 * TILE + 40);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 11px 'Courier New'";
  ctx.textAlign = "left";
  ctx.fillText(final ? "OFFER" : "CLEAR", sx + 10, baseY - 7 * TILE + 27);
}

function drawPlayer() {
  if (player.invuln > 0 && (game.frame >> 2) % 2 === 0) return;
  const sx = player.x - cameraX;
  const sy = player.y;
  const facing = player.facing;
  const walking = Math.abs(player.vx) > 0.1 && player.onGround;
  const step = walking ? Math.sin(player.animPhase * 4) * 4 : 0;

  // legs
  ctx.fillStyle = "#283593";
  ctx.fillRect(sx + 4, sy + 22, 6, 8 + step * 0.5);
  ctx.fillRect(sx + 14, sy + 22, 6, 8 - step * 0.5);
  // gown / body
  ctx.fillStyle = "#3949ab";
  ctx.fillRect(sx + 2, sy + 12, 20, 12);
  // arms
  ctx.fillStyle = "#3949ab";
  ctx.fillRect(sx + (facing > 0 ? 20 : -2), sy + 14, 6, 8);
  // head
  ctx.fillStyle = "#ffcc99";
  ctx.fillRect(sx + 4, sy + 4, 16, 10);
  // eye
  ctx.fillStyle = "#222";
  ctx.fillRect(sx + (facing > 0 ? 15 : 7), sy + 7, 3, 3);
  // graduation cap
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(sx + 4, sy + 2, 16, 4);
  ctx.fillRect(sx - 1, sy, 26, 3);
  // tassel
  ctx.fillStyle = "#ffd95e";
  ctx.fillRect(sx + (facing > 0 ? 24 : -2), sy + 1, 2, 8);
}

function drawEnemy(e) {
  const sx = e.x - cameraX;
  const sy = e.y;
  if (sx < -80 || sx > VIEW_W + 80) return;
  const squash = e.dead ? Math.max(0.25, 1 - e.deadTimer / 12) : 1;
  const h = e.h * squash;
  const dy = e.h - h;

  ctx.save();
  if (e.dead && e.deadTimer >= 12) ctx.globalAlpha = Math.max(0, 1 - (e.deadTimer - 12) / 28);

  if (e.type === "E") {
    // API bug — red beetle
    ctx.fillStyle = "#d84338";
    ctx.beginPath();
    ctx.ellipse(sx + e.w / 2, sy + dy + h / 2 + 2, e.w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7e2a22";
    ctx.fillRect(sx + e.w / 2 - 1, sy + dy + 2, 2, h - 4);
    ctx.beginPath(); ctx.arc(sx + e.w / 2 - 7, sy + dy + h / 2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + e.w / 2 + 6, sy + dy + h / 2 + 3, 2.5, 0, Math.PI * 2); ctx.fill();
    if (!e.dead) {
      ctx.strokeStyle = "#7e2a22"; ctx.lineWidth = 2;
      const leg = Math.sin(e.t * 2) * 3;
      ctx.beginPath();
      ctx.moveTo(sx + 5, sy + h - 1); ctx.lineTo(sx + 1 - leg, sy + h + 5);
      ctx.moveTo(sx + e.w - 5, sy + h - 1); ctx.lineTo(sx + e.w - 1 + leg, sy + h + 5);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 9 : 5), sy + dy + 4, 4, 4);
      ctx.fillStyle = "#222";
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 7 : 6), sy + dy + 5, 2, 2);
    }
  } else if (e.type === "W") {
    // rogue Docker container — blue whale carrying boxes
    ctx.fillStyle = "#2e86d1";
    ctx.beginPath();
    ctx.ellipse(sx + e.w / 2, sy + dy + h / 2 + 4, e.w / 2, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // tail
    ctx.beginPath();
    const tailX = e.dir > 0 ? sx - 4 : sx + e.w + 4;
    ctx.moveTo(e.dir > 0 ? sx + 3 : sx + e.w - 3, sy + dy + h / 2 + 4);
    ctx.lineTo(tailX, sy + dy + 2);
    ctx.lineTo(tailX, sy + dy + h);
    ctx.closePath(); ctx.fill();
    if (!e.dead) {
      // containers on its back
      ctx.fillStyle = "#aed6f1"; ctx.fillRect(sx + 5, sy + dy - 4, 8, 7);
      ctx.fillStyle = "#85c1e9"; ctx.fillRect(sx + 14, sy + dy - 4, 8, 7);
      ctx.fillStyle = "#aed6f1"; ctx.fillRect(sx + 9, sy + dy - 11, 8, 7);
      // eye
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(sx + (e.dir > 0 ? e.w - 8 : 8), sy + dy + h / 2 + 2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#222";
      ctx.beginPath(); ctx.arc(sx + (e.dir > 0 ? e.w - 7 : 7), sy + dy + h / 2 + 2, 2, 0, Math.PI * 2); ctx.fill();
      // spout
      if ((game.frame >> 5) % 2 === 0) {
        ctx.fillStyle = "rgba(174,214,241,0.8)";
        ctx.fillRect(sx + e.w / 2 - 1, sy + dy - 15, 2, 6);
        ctx.fillRect(sx + e.w / 2 - 4, sy + dy - 18, 3, 3);
        ctx.fillRect(sx + e.w / 2 + 2, sy + dy - 18, 3, 3);
      }
    }
  } else if (e.type === "M") {
    // wild Jeju mandarin
    ctx.fillStyle = "#ff9f43";
    ctx.beginPath();
    ctx.arc(sx + e.w / 2, sy + dy + h / 2 + 2, e.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(230,126,34,0.55)";
    ctx.beginPath(); ctx.arc(sx + 6, sy + dy + h / 2 + 6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + e.w - 6, sy + dy + h / 2 - 2, 2, 0, Math.PI * 2); ctx.fill();
    // leaf + stem
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(sx + e.w / 2 - 2, sy + dy - 4, 4, 6);
    ctx.beginPath();
    ctx.ellipse(sx + e.w / 2 + 7, sy + dy - 3, 7, 3.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    if (!e.dead) {
      ctx.fillStyle = "#5d2e0a";
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 11 : 6), sy + dy + 8, 3, 5);
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 5 : 12), sy + dy + 8, 3, 5);
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 10 : 7), sy + dy + 16, 6, 2);
    }
  } else if (e.type === "K") {
    // drop bear (relax, it's just a koala)
    ctx.fillStyle = "#90a4ae";
    ctx.beginPath();
    ctx.arc(sx + 6, sy + dy + 7, 7, 0, Math.PI * 2);
    ctx.arc(sx + e.w - 6, sy + dy + 7, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f8bbd0";
    ctx.beginPath();
    ctx.arc(sx + 6, sy + dy + 7, 3.5, 0, Math.PI * 2);
    ctx.arc(sx + e.w - 6, sy + dy + 7, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b0bec5";
    ctx.beginPath();
    ctx.arc(sx + e.w / 2, sy + dy + h / 2 + 3, e.w / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#37474f";
    ctx.beginPath();
    ctx.ellipse(sx + e.w / 2, sy + dy + h / 2 + 4, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!e.dead) {
      ctx.fillStyle = "#222";
      if (e.napping) {
        ctx.fillRect(sx + 7, sy + dy + 11, 5, 2);
        ctx.fillRect(sx + e.w - 12, sy + dy + 11, 5, 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px 'Courier New'";
        ctx.textAlign = "center";
        ctx.fillText("z z", sx + e.w / 2 + 16, sy + dy - 2);
      } else {
        ctx.fillRect(sx + 7, sy + dy + 10, 3, 4);
        ctx.fillRect(sx + e.w - 10, sy + dy + 10, 3, 4);
      }
    }
  } else if (e.type === "S") {
    // unstable lab sample
    ctx.fillStyle = "rgba(207,226,243,0.9)";
    ctx.fillRect(sx + 3, sy + dy + 3, e.w - 6, h - 3);
    ctx.fillRect(sx, sy + dy, e.w, 4);
    ctx.fillStyle = "#7c4dff";
    ctx.fillRect(sx + 4, sy + dy + h / 2, e.w - 8, h / 2 - 1);
    if (!e.dead) {
      const bub = (e.frames % 40) / 40;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath(); ctx.arc(sx + 8, sy + dy + h / 2 + 4 - bub * 8, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + e.w - 8, sy + dy + h / 2 + 8 - bub * 10, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 11 : 6), sy + dy + h / 2 + 4, 3, 4);
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 5 : 12), sy + dy + h / 2 + 4, 3, 4);
    }
  } else if (e.type === "H") {
    // spicy Hungarian paprika
    ctx.fillStyle = "#e53935";
    ctx.beginPath();
    ctx.ellipse(sx + e.w / 2, sy + dy + h / 2 + 3, e.w / 2, h / 2 - 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(sx + e.w / 2 - 2, sy + dy - 5, 4, 8);
    if (!e.dead) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 10 : 5), sy + dy + 9, 3, 4);
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 5 : 10), sy + dy + 9, 3, 4);
      ctx.fillStyle = "#7e1b15";
      ctx.fillRect(sx + (e.dir > 0 ? e.w - 11 : 5), sy + dy + 17, 8, 2);
      if ((game.frame >> 3) % 2 === 0) {       // heat shimmer
        ctx.strokeStyle = "rgba(255,152,0,0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx + 3, sy + dy - 6); ctx.lineTo(sx + 6, sy + dy - 11);
        ctx.moveTo(sx + e.w - 3, sy + dy - 6); ctx.lineTo(sx + e.w - 6, sy + dy - 11);
        ctx.stroke();
      }
    }
  } else {
    // null ghost
    const bob = Math.sin(e.t * 2) * 2;
    ctx.fillStyle = "rgba(189,195,210,0.92)";
    ctx.beginPath();
    ctx.arc(sx + e.w / 2, sy + dy + 10 + bob, e.w / 2, Math.PI, 0);
    ctx.rect(sx, sy + dy + 10 + bob, e.w, h - 14);
    ctx.fill();
    // wavy bottom
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(sx + 4 + i * 7, sy + dy + h - 4 + bob, 3.5, 0, Math.PI);
      ctx.fill();
    }
    if (!e.dead) {
      ctx.fillStyle = "#222";
      ctx.fillRect(sx + (e.dir > 0 ? 16 : 5), sy + dy + 8 + bob, 3, 5);
      ctx.fillRect(sx + (e.dir > 0 ? 22 : 11), sy + dy + 8 + bob, 3, 5);
      ctx.font = "bold 9px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText("null", sx + e.w / 2, sy + dy + h - 6 + bob);
    }
  }

  if (!e.dead) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "8px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText(e.label, sx + e.w / 2, sy + dy - (e.type === "W" ? 20 : 8));
  }
  ctx.restore();
}

function drawBoss() {
  if (!boss || !boss.alive) return;
  const sx = boss.x - cameraX, sy = boss.y;
  const flash = boss.hurtT > 0 && (game.frame >> 1) % 2 === 0;
  // handle
  ctx.strokeStyle = flash ? "#fff" : "#4e342e";
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(sx + boss.w / 2, sy + 2, 16, Math.PI, 0); ctx.stroke();
  // briefcase body
  ctx.fillStyle = flash ? "#fff" : "#795548";
  ctx.fillRect(sx, sy, boss.w, boss.h);
  ctx.strokeStyle = flash ? "#fff" : "#4e342e";
  ctx.lineWidth = 4;
  ctx.strokeRect(sx + 2, sy + 2, boss.w - 4, boss.h - 4);
  // clasps
  ctx.fillStyle = flash ? "#eee" : "#ffd95e";
  ctx.fillRect(sx + 12, sy - 2, 10, 8);
  ctx.fillRect(sx + boss.w - 22, sy - 2, 10, 8);
  // angry eyes
  const look = player.x < boss.x ? -2 : 2;
  ctx.fillStyle = "#fff";
  ctx.fillRect(sx + 20, sy + 16, 14, 10);
  ctx.fillRect(sx + boss.w - 34, sy + 16, 14, 10);
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(sx + 24 + look, sy + 19, 5, 5);
  ctx.fillRect(sx + boss.w - 30 + look, sy + 19, 5, 5);
  ctx.strokeStyle = "#3e2723";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sx + 16, sy + 11); ctx.lineTo(sx + 36, sy + 17);
  ctx.moveTo(sx + boss.w - 16, sy + 11); ctx.lineTo(sx + boss.w - 36, sy + 17);
  ctx.stroke();
  // nameplate
  ctx.fillStyle = flash ? "#795548" : "#fff";
  ctx.font = "bold 26px 'Courier New'";
  ctx.textAlign = "center";
  ctx.fillText("JOB", sx + boss.w / 2, sy + 56);
}

function drawBossShots() {
  for (const p of bossShots) {
    const sx = p.x - cameraX;
    if (sx < -40 || sx > VIEW_W + 40) continue;
    ctx.save();
    ctx.translate(sx, p.y);
    ctx.rotate(Math.sin(p.t * 0.15) * 0.4);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(-10, -7, 20, 14);
    ctx.strokeStyle = "#bdbdbd";
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -7, 20, 14);
    ctx.fillStyle = "#d32f2f";
    ctx.font = "bold 7px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("REJECT", 0, 2);
    ctx.restore();
  }
}

function drawBossBar() {
  if (!boss || !boss.alive) return;
  const w = 320, x = (VIEW_W - w) / 2, y = 46;
  ctx.fillStyle = "rgba(10,12,30,0.8)";
  ctx.fillRect(x - 10, y - 6, w + 20, 36);
  ctx.fillStyle = "#e8e8f0";
  ctx.font = "bold 12px 'Courier New'";
  ctx.textAlign = "center";
  ctx.fillText("FINAL BOSS — THE JOB", VIEW_W / 2, y + 7);
  ctx.fillStyle = "#3c3e50";
  ctx.fillRect(x, y + 13, w, 10);
  ctx.fillStyle = "#ef5350";
  ctx.fillRect(x, y + 13, w * boss.hp / boss.maxHp, 10);
  ctx.strokeStyle = "#9aa3c0";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y + 13, w, 10);
}

function drawShots() {
  for (const s of shots) {
    const sx = s.x - cameraX;
    if (sx < -160 || sx > VIEW_W + 160) continue;
    ctx.fillStyle = "rgba(126,200,227,0.35)";
    ctx.fillRect(s.vx > 0 ? sx - 16 : sx + s.w, s.y + 5, 16, 6);
    ctx.fillStyle = "#7ec8e3";
    ctx.fillRect(sx, s.y, s.w, 16);
    ctx.strokeStyle = "#3b7d99"; ctx.lineWidth = 2;
    ctx.strokeRect(sx, s.y, s.w, 16);
    ctx.fillStyle = "#0d1021";
    ctx.font = "bold 10px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText(s.skill.toUpperCase(), sx + s.w / 2, s.y + 12);
  }
}

function drawBanner() {
  if (!banner) return;
  banner.t++;
  if (banner.t > 170) { banner = null; return; }
  const a = banner.t < 12 ? banner.t / 12 : banner.t > 140 ? Math.max(0, (170 - banner.t) / 30) : 1;
  const text = banner.skill.toUpperCase();
  const h = banner.hint ? 78 : 60;
  const w = Math.max(340, text.length * 16 + 120);
  const x = (VIEW_W - w) / 2, y = 48;
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(10,12,30,0.88)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#ffd95e"; ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.textAlign = "center";
  ctx.font = "bold 11px 'Courier New'"; ctx.fillStyle = "#9be564";
  ctx.fillText("SKILL UNLOCKED", VIEW_W / 2, y + 18);
  ctx.font = "bold 26px 'Courier New'"; ctx.fillStyle = "#ffd95e";
  ctx.fillText(text, VIEW_W / 2, y + 46);
  if (banner.hint) {
    ctx.font = "12px 'Courier New'"; ctx.fillStyle = "#7ec8e3";
    ctx.fillText("press X or J to throw your skills at bugs!", VIEW_W / 2, y + 68);
  }
  ctx.globalAlpha = 1;
}

function drawHUD() {
  const lvl = LEVELS[game.levelIndex];
  ctx.fillStyle = "rgba(10,12,30,0.78)";
  ctx.fillRect(0, 0, VIEW_W, 38);
  ctx.textAlign = "left";
  ctx.font = "bold 14px 'Courier New'";
  // lives as coffee cups
  for (let i = 0; i < game.lives; i++) {
    const cx = 14 + i * 24;
    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(cx, 12, 13, 13);
    ctx.fillStyle = "#3e2723";
    ctx.fillRect(cx + 2, 14, 9, 4);
    ctx.strokeStyle = "#6d4c41"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx + 15, 18, 4, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  }
  ctx.fillStyle = "#ffd95e";
  ctx.fillText("COMMITS " + String(game.commits).padStart(3, "0"), 100, 25);
  ctx.fillStyle = "#9be564";
  ctx.fillText("SKILLS " + game.skills.length + "/" + totalSkills(), 262, 25);
  ctx.fillStyle = "#ef9a9a";
  ctx.fillText("BUGS FIXED " + String(game.bugsFixed).padStart(3, "0"), 400, 25);
  if (game.skills.length > 0) {
    let s = game.skills[game.shotIndex % game.skills.length].toUpperCase();
    if (s.length > 13) s = s.slice(0, 12) + "…";
    ctx.fillStyle = "#7ec8e3";
    ctx.fillText("ATK " + s, 572, 25);
  }
  ctx.fillStyle = "#9aa3c0";
  ctx.font = "12px 'Courier New'";
  ctx.textAlign = "right";
  ctx.fillText(lvl.name + " · " + lvl.hudPlace, VIEW_W - 12, 24);
}

function totalSkills() {
  return LEVELS.reduce((n, l) => n + l.skills.length, 0);
}

function drawFloaters() {
  for (const f of floaters) {
    const a = 1 - f.t / f.life;
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = f.color;
    ctx.font = "bold " + (f.size || 13) + "px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x - cameraX, f.y);
  }
  ctx.globalAlpha = 1;
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - cameraX - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
}

function overlay(alpha) {
  ctx.fillStyle = "rgba(8,10,26," + alpha + ")";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function centerText(lines, startY, opts) {
  opts = opts || {};
  ctx.textAlign = "center";
  let y = startY;
  for (const line of lines) {
    ctx.font = line.font || "16px 'Courier New'";
    ctx.fillStyle = line.color || "#e8e8f0";
    ctx.fillText(line.text, VIEW_W / 2, y);
    y += line.gap || 28;
  }
  return y;
}

function drawTitle() {
  overlay(1);
  // decorative ? blocks
  for (let i = 0; i < 5; i++) {
    const bx = 160 + i * 150;
    const by = 392 + Math.sin(game.frame * 0.05 + i) * 6;
    ctx.fillStyle = "#f7b733";
    ctx.fillRect(bx, by, 36, 36);
    ctx.strokeStyle = "#8c5a10"; ctx.lineWidth = 3;
    ctx.strokeRect(bx + 2, by + 2, 32, 32);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("?", bx + 18, by + 26);
  }
  centerText([
    { text: "EDWARD'S", font: "bold 40px 'Courier New'", color: "#ffd95e", gap: 52 },
    { text: "CAREER QUEST", font: "bold 52px 'Courier New'", color: "#ffd95e", gap: 50 },
    { text: "A PLAYABLE RESUME — EDWARD (SOON HYUN) HWANG", font: "14px 'Courier New'", color: "#9aa3c0", gap: 24 },
    { text: "Systems · DevOps · Backend · Data · Sydney NSW", font: "13px 'Courier New'", color: "#7ec8e3", gap: 56 },
    { text: "JEJU → SNU SEOUL → UNI OF SYDNEY → IoT HUNGARY → FINAL BOSS: THE JOB", font: "14px 'Courier New'", color: "#e8e8f0", gap: 36 },
    { text: "← → / A D : move    SPACE / ↑ / W : jump    X / J : throw a skill    R : restart", font: "13px 'Courier New'", color: "#9aa3c0", gap: 46 },
    { text: (game.frame >> 5) % 2 === 0 ? "PRESS ENTER TO START" : "", font: "bold 20px 'Courier New'", color: "#9be564", gap: 0 }
  ], 110);
}

function drawCard() {
  const lvl = LEVELS[game.levelIndex];
  overlay(1);
  const lines = [
    { text: lvl.name, font: "bold 30px 'Courier New'", color: "#ffd95e", gap: 40 },
    { text: lvl.place, font: "bold 20px 'Courier New'", color: "#e8e8f0", gap: 50 }
  ];
  for (const part of lvl.intro.split("\n")) {
    lines.push({ text: part, font: "14px 'Courier New'", color: "#9aa3c0", gap: 26 });
  }
  centerText(lines, 200);
  // player sprite preview
  const px = VIEW_W / 2 - 12, py = 360;
  ctx.fillStyle = "#3949ab"; ctx.fillRect(px + 2, py + 12, 20, 12);
  ctx.fillStyle = "#283593"; ctx.fillRect(px + 4, py + 22, 6, 8); ctx.fillRect(px + 14, py + 22, 6, 8);
  ctx.fillStyle = "#ffcc99"; ctx.fillRect(px + 4, py + 4, 16, 10);
  ctx.fillStyle = "#1a1a2e"; ctx.fillRect(px + 4, py + 2, 16, 4); ctx.fillRect(px - 1, py, 26, 3);
  ctx.fillStyle = "#ffd95e"; ctx.fillRect(px + 24, py + 1, 2, 8);
}

function drawClear() {
  const a = Math.min(0.7, game.stateTimer / 40);
  overlay(a);
  centerText([
    { text: "LEVEL CLEAR!", font: "bold 36px 'Courier New'", color: "#9be564", gap: 44 },
    { text: LEVELS[game.levelIndex].place + " — COMPLETE", font: "16px 'Courier New'", color: "#e8e8f0", gap: 0 }
  ], 230);
}

function drawGameOver() {
  overlay(0.85);
  centerText([
    { text: "GAME OVER", font: "bold 42px 'Courier New'", color: "#ef5350", gap: 50 },
    { text: "Even production rollouts have setbacks.", font: "15px 'Courier New'", color: "#9aa3c0", gap: 26 },
    { text: "Structured debugging means trying again.", font: "15px 'Courier New'", color: "#9aa3c0", gap: 56 },
    { text: (game.frame >> 5) % 2 === 0 ? "PRESS ENTER TO RETRY" : "", font: "bold 18px 'Courier New'", color: "#9be564", gap: 0 }
  ], 200);
}

function drawWin() {
  overlay(0.92);
  let y = centerText([
    { text: "QUEST COMPLETE!", font: "bold 38px 'Courier New'", color: "#ffd95e", gap: 40 },
    { text: "THE JOB — DEFEATED. OFFER SIGNED ✓", font: "bold 18px 'Courier New'", color: "#9be564", gap: 28 },
    { text: "STATUS: GRADUATE SOFTWARE ENGINEER — HIRED", font: "bold 14px 'Courier New'", color: "#7ec8e3", gap: 30 },
    { text: "COMMITS " + game.commits + "   ·   SKILLS " + game.skills.length + "/" + totalSkills() +
            "   ·   BUGS FIXED " + game.bugsFixed + "   ·   LIVES LEFT " + game.lives,
      font: "14px 'Courier New'", color: "#e8e8f0", gap: 30 }
  ], 96);

  // skill inventory
  ctx.font = "13px 'Courier New'";
  ctx.fillStyle = "#9aa3c0";
  ctx.textAlign = "center";
  const perRow = 5;
  const all = game.skills;
  for (let i = 0; i < all.length; i += perRow) {
    const rowSkills = all.slice(i, i + perRow).join("  ·  ");
    ctx.fillText(rowSkills, VIEW_W / 2, y);
    y += 20;
  }
  y += 14;
  centerText([
    { text: "READY FOR THE NEXT LEVEL: A GRADUATE ROLE AT YOUR COMPANY", font: "bold 14px 'Courier New'", color: "#7ec8e3", gap: 30 },
    { text: "edwardhwang1223@gmail.com", font: "15px 'Courier New'", color: "#ffd95e", gap: 24 },
    { text: "linkedin.com/in/soon-hyun-hwang-7212a42b7   ·   github.com/EdwardH-jedi", font: "13px 'Courier New'", color: "#9aa3c0", gap: 40 },
    { text: (game.frame >> 5) % 2 === 0 ? "PRESS ENTER TO PLAY AGAIN" : "", font: "bold 16px 'Courier New'", color: "#9be564", gap: 0 }
  ], y);
}

/* -------------------------------------------------------------- main loop */
function tick() {
  game.frame++;
  const theme = LEVELS[game.levelIndex].theme;

  switch (game.state) {
    case "title":
      drawBackground("jeju");
      drawTitle();
      break;

    case "card":
      game.stateTimer++;
      drawCard();
      if (game.stateTimer > 130) { game.state = "play"; game.stateTimer = 0; }
      break;

    case "play":
      updatePlay();
      drawBackground(theme);
      drawTiles(theme);
      drawFlag();
      for (const e of enemies) drawEnemy(e);
      drawBoss();
      drawBossShots();
      drawShots();
      drawPlayer();
      drawFloaters();
      drawHUD();
      drawBossBar();
      drawBanner();
      break;

    case "clear":
      game.stateTimer++;
      drawBackground(theme);
      drawTiles(theme);
      drawFlag();
      drawPlayer();
      drawFloaters();
      drawHUD();
      drawClear();
      if (game.stateTimer > 150) {
        if (game.levelIndex < LEVELS.length - 1) {
          game.levelIndex++;
          loadLevel(game.levelIndex);
          game.state = "card";
          game.stateTimer = 0;
        } else {
          game.state = "win";
          game.stateTimer = 0;
          sfx.win();
        }
      }
      break;

    case "gameover":
      game.stateTimer++;
      drawBackground(theme);
      drawGameOver();
      break;

    case "win":
      game.stateTimer++;
      drawBackground("factory");
      drawWin();
      break;
  }
  requestAnimationFrame(tick);
}

loadLevel(0);
requestAnimationFrame(tick);
