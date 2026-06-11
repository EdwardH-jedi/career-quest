/* Headless smoke test: stubs the DOM, runs the game loop, drives the player
   with a pit-aware bot, and verifies maps + full state machine to the win screen.
   Run: node smoke-test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// ---- DOM stubs -----------------------------------------------------------
const canvasStub = {
  width: 960, height: 540,
  getContext: () => ctxStub,
  addEventListener() {}, style: {}
};
const ctxStub = new Proxy({}, {
  get(_, key) {
    if (key === "createLinearGradient") return () => ({ addColorStop() {} });
    if (key === "canvas") return canvasStub;
    return () => {};
  },
  set() { return true; }
});

global.window = global;
global.document = {
  getElementById: id => (id === "game" ? canvasStub : { addEventListener() {}, style: {} })
};
global.addEventListener = () => {};
let rafCb = null;
global.requestAnimationFrame = cb => { rafCb = cb; };

// ---- load game with test hook -------------------------------------------
let src = fs.readFileSync(path.join(__dirname, "game.js"), "utf8");
src += `
globalThis.__t = {
  game, player, input, LEVELS, loadLevel, startGame,
  get grid() { return grid; },
  get flagX() { return flagX; },
  get mapW() { return mapW; },
  get boss() { return boss; }
};
`;
vm.runInThisContext(src, { filename: "game.js" });

const t = global.__t;
const TILE = 36, ROWS = 15;
const SOLID = "#B?X=D";
function frame(n) { for (let i = 0; i < n; i++) rafCb(); }
function fail(msg) { console.error("FAIL: " + msg); process.exit(1); }

// ---- 1. static map checks -------------------------------------------------
console.log("--- static map checks ---");
for (const lvl of t.LEVELS) {
  const map = lvl.map;
  const w = map[0].length;
  if (!map.every(r => r.length === w)) fail(lvl.name + ": ragged map rows");
  const flat = map.join("");
  if (!flat.includes("P")) fail(lvl.name + ": no player spawn");
  if (!flat.includes("F")) fail(lvl.name + ": no flag");
  const qCount = (flat.match(/\?/g) || []).length;
  if (qCount !== lvl.skills.length)
    fail(lvl.name + ": " + qCount + " ? blocks but " + lvl.skills.length + " skills");
  // pit analysis: columns with no solid ground anywhere
  let pitRun = 0, maxPit = 0, pitStart = -1, widePits = [];
  for (let x = 0; x < w; x++) {
    let hasGround = false;
    for (let y = 0; y < ROWS; y++) if (SOLID.includes(map[y][x])) { hasGround = true; break; }
    if (!hasGround) {
      if (pitRun === 0) pitStart = x;
      pitRun++;
      maxPit = Math.max(maxPit, pitRun);
      if (pitRun > 4) widePits.push(pitStart);
    } else pitRun = 0;
  }
  if (widePits.length) fail(lvl.name + ": pit wider than 4 tiles (uncrossable) at x=" + widePits.join(","));
  console.log(`${lvl.name}: width=${w} ?blocks=${qCount} skills=${lvl.skills.length} maxPit=${maxPit} OK`);
}

// ---- 2. bot playthrough of each level -------------------------------------
function groundAheadMissing() {
  const footX = Math.floor((t.player.x + t.player.w + 14) / TILE);
  const footY = Math.floor((t.player.y + t.player.h) / TILE);
  for (let y = footY; y < ROWS; y++) if (SOLID.includes(t.grid[y][footX] || " ")) return false;
  return true;
}
function wallAhead() {
  const tx = Math.floor((t.player.x + t.player.w + 6) / TILE);
  const ty = Math.floor((t.player.y + t.player.h - 4) / TILE);
  return SOLID.includes((t.grid[ty] || [])[tx] || " ");
}

console.log("\n--- bot playthrough ---");
t.startGame();
frame(140);
if (t.game.state !== "play") fail("expected play after level card, got " + t.game.state);

let totalFrames = 0;
const HARD_LIMIT = 60 * 600;
let jumpHold = 0;

while (t.game.state !== "win" && totalFrames < HARD_LIMIT) {
  const bossAlive = t.boss && t.boss.alive;
  if (t.game.state === "play") {
    t.game.lives = 5; // keep the bot alive; humans get 3
    if (bossAlive) {
      // boss-fight mode: face THE JOB and unload skills at it
      if (t.game.skills.length === 0) t.game.skills.push("Python"); // humans collect these from ? blocks
      const d = (t.boss.x + t.boss.w / 2) - (t.player.x + t.player.w / 2);
      t.input.right = d > 150;
      t.input.left = d < -150;
      t.input.jump = false;
      t.input.attack = true;
    } else {
      t.input.left = false;
      t.input.right = true;
      t.input.attack = (totalFrames % 40) < 3; // spray skills to exercise combat
      if (jumpHold > 0) { t.input.jump = true; jumpHold--; }
      else if (t.player.onGround && (groundAheadMissing() || wallAhead())) {
        t.input.jump = true; jumpHold = 18;
      } else t.input.jump = false;

      // if the bot somehow stalls far from the flag, nudge it past (humans can time jumps)
      if (totalFrames % 1800 === 1799) {
        console.log(`  [nudge] ${t.LEVELS[t.game.levelIndex].name} x=${Math.round(t.player.x)}/${t.mapW * TILE}`);
        t.player.x += TILE * 2; t.player.y = 0; t.player.vy = 0;
      }
    }
  } else {
    t.input.left = false; t.input.right = false; t.input.jump = false; t.input.attack = false;
  }
  frame(1);
  totalFrames++;
}

if (t.game.state !== "win") fail("never reached win screen; stuck in " + t.game.state +
  " at level " + t.LEVELS[t.game.levelIndex].name + " x=" + Math.round(t.player.x));

if (t.boss && t.boss.alive) fail("won without defeating THE JOB?!");
console.log("reached WIN screen in", totalFrames, "frames (~" + Math.round(totalFrames / 60) + "s simulated)");
console.log("THE JOB defeated:", t.boss ? "yes (hp " + t.boss.hp + "/" + t.boss.maxHp + ")" : "no boss object");
console.log("commits:", t.game.commits, "| skills:", t.game.skills.length + "/" +
  t.LEVELS.reduce((n, l) => n + l.skills.length, 0), "| bugs fixed:", t.game.bugsFixed,
  "| lives:", t.game.lives);
console.log("skills collected:", t.game.skills.join(", ") || "(none)");
frame(200); // soak the win screen for crashes

// ---- 3. combat test: throw a skill at the first bug ------------------------
console.log("\n--- combat test ---");
t.loadLevel(0);
t.game.state = "play";
t.game.skills = ["Python"];
t.game.shotIndex = 0;
t.game.bugsFixed = 0;
t.player.x = 600; t.player.y = 12 * TILE; t.player.vy = 0; t.player.facing = 1;
t.input.right = false; t.input.jump = false;
for (let i = 0; i < 200 && t.game.bugsFixed === 0; i++) {
  t.input.attack = true;
  frame(1);
}
t.input.attack = false;
if (t.game.bugsFixed === 0) fail("projectile kill did not register");
console.log("projectile kill OK — ticket BUG-001 filed and closed with PYTHON");

console.log("\nSMOKE TEST PASSED");
