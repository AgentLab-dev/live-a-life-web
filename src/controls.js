export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const KEY_TO_DIR = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right",
};

export function dirFromKey(code, key) {
  return KEY_TO_DIR[code] ?? KEY_TO_DIR[key] ?? null;
}

export function isTypingTarget(target) {
  if (!target || typeof target !== "object") return false;
  const tag = String(target.tagName || "").toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(target.isContentEditable);
}

export function createHold() {
  const dirs = [];
  return {
    press(dir) {
      if (!DIRS[dir]) return;
      const at = dirs.indexOf(dir);
      if (at >= 0) dirs.splice(at, 1);
      dirs.push(dir);
    },
    release(dir) {
      const at = dirs.indexOf(dir);
      if (at >= 0) dirs.splice(at, 1);
    },
    clear() {
      dirs.length = 0;
    },
    current() {
      return dirs[dirs.length - 1] ?? null;
    },
  };
}

export function heldWalkTarget(player, dir, lead = 80) {
  const vector = typeof dir === "string" ? DIRS[dir] : dir;
  if (!player || !vector || (!vector.x && !vector.y)) return null;
  return {
    x: player.x + vector.x * lead,
    y: player.y + vector.y * lead,
  };
}
