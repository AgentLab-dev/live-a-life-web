export const CREEK = { x: 680, y: 1560, w: 1100, h: 100 };

export const BRIDGE = { x: 760, y: 1546, w: 168, h: 128 };

export const STONES = [
  { x: 1310, y: 1576 },
  { x: 1354, y: 1598 },
  { x: 1400, y: 1612 },
  { x: 1446, y: 1634 },
  { x: 1490, y: 1656 },
];

export const STONE_RADIUS = 26;

export const GATE = { x: 890, y: 1668, w: 80, h: 36, latch: { x: 930, y: 1694 } };

export const FENCES = [
  { x: 680, y: 1678, w: 70, h: 14 },
  { x: 1010, y: 1678, w: 170, h: 14 },
];

export const PICNIC_SPOT = { x: 1180, y: 1860 };

export const STICKERS = [
  { id: "gate", name: "Gate helper", hint: "You opened the park gate." },
  { id: "bridge", name: "Bridge walker", hint: "You crossed the garden bridge." },
  { id: "stones", name: "Stone hopper", hint: "You hopped the sunny stones." },
  { id: "picnic", name: "Kind picnic", hint: "You shared a picnic in the park." },
  { id: "cheer", name: "Kind words", hint: "A neighbor cheered you on." },
];

export const CHEERS = {
  gate: "The gate looks happy open!",
  bridge: "What a gentle bridge walk!",
  stones: "Hop hop, those stones like you!",
  picnic: "A picnic for everyone. Kind!",
};

export function defaultStickers() {
  return { gate: false, bridge: false, stones: false, picnic: false, cheer: false };
}

export function sanitizeStickers(raw) {
  const next = defaultStickers();
  if (!raw || typeof raw !== "object") return next;
  for (const id of Object.keys(next)) {
    next[id] = raw[id] === true;
  }
  return next;
}

export function stickerList(stickers) {
  const earned = sanitizeStickers(stickers);
  return STICKERS.map((item) => ({ ...item, earned: earned[item.id] === true }));
}

export function earnedStickerCount(stickers) {
  return stickerList(stickers).filter((item) => item.earned).length;
}

export function inRect(x, y, rect, pad = 0) {
  return x >= rect.x - pad && x <= rect.x + rect.w + pad && y >= rect.y - pad && y <= rect.y + rect.h + pad;
}

export function onBridge(x, y) {
  return inRect(x, y, BRIDGE);
}

export function onStone(x, y) {
  return STONES.some((stone) => Math.hypot(x - stone.x, y - stone.y) <= STONE_RADIUS);
}

export function pathAt(x, y) {
  if (onBridge(x, y)) return "bridge";
  if (onStone(x, y)) return "stones";
  return "";
}

export function bankOf(y) {
  if (y < CREEK.y - 4) return "north";
  if (y > CREEK.y + CREEK.h + 4) return "south";
  return "";
}

export function nearCreek(y) {
  return y >= CREEK.y - 48 && y <= CREEK.y + CREEK.h + 48;
}

export function blockedByWater(x, y) {
  if (!inRect(x, y, CREEK)) return false;
  return !onBridge(x, y) && !onStone(x, y);
}

export function blockedByFence(x, y) {
  return FENCES.some((fence) => inRect(x, y, fence));
}

export function blockedByGate(x, y, parkGateOpen) {
  if (parkGateOpen) return false;
  return inRect(x, y, GATE);
}

export function blockedByCrossing(x, y, extras = {}) {
  return blockedByWater(x, y) || blockedByFence(x, y) || blockedByGate(x, y, extras.parkGateOpen);
}

export function applyCrossingProgress(prev, next) {
  const stickers = sanitizeStickers(next.stickers);
  const path = pathAt(next.x, next.y);
  const lastPath = path || (nearCreek(next.y) ? prev.lastPath || "" : "");
  const nowBank = bankOf(next.y);
  const fromBank = prev.lastBank || bankOf(prev.y);
  const lastBank = nowBank || (nearCreek(next.y) ? fromBank : "");
  if (fromBank && nowBank && fromBank !== nowBank) {
    if (lastPath === "bridge") stickers.bridge = true;
    if (lastPath === "stones") stickers.stones = true;
  }
  return {
    ...next,
    stickers,
    lastPath,
    lastBank,
    onStone: path === "stones",
  };
}

export function newSticker(before, after) {
  const prev = sanitizeStickers(before);
  const next = sanitizeStickers(after);
  return STICKERS.map((item) => item.id).find((id) => next[id] && !prev[id]) ?? null;
}

export function openParkGate(player) {
  if (player.parkGateOpen) return player;
  return {
    ...player,
    parkGateOpen: true,
    pose: "work",
    actionBeatMs: 700,
    stickers: { ...sanitizeStickers(player.stickers), gate: true },
  };
}

export function closeParkGate(player) {
  if (!player.parkGateOpen) return player;
  return { ...player, parkGateOpen: false, pose: "work", actionBeatMs: 500 };
}

export function takePicnic(player) {
  if (player.carry === "picnic") return player;
  const next = { ...player, carry: "picnic", pose: "idle", actionBeatMs: 0 };
  delete next.money;
  delete next.score;
  delete next.timer;
  return next;
}

export function sharePicnic(player) {
  if (player.carry !== "picnic") return player;
  const next = {
    ...player,
    carry: "",
    pose: "eat",
    actionBeatMs: 1100,
    stickers: { ...sanitizeStickers(player.stickers), picnic: true },
  };
  delete next.money;
  delete next.score;
  delete next.timer;
  delete next.hunger;
  return next;
}

export function markCheer(player) {
  return { ...player, stickers: { ...sanitizeStickers(player.stickers), cheer: true } };
}

export function cheerCrossing(people, kind, x, y) {
  const line = CHEERS[kind];
  if (!line || !Array.isArray(people)) return people;
  const near = people.find((person) => Math.hypot(person.x - x, person.y - y) <= 320);
  const id = near?.id ?? "pip";
  return people.map((person) => (person.id === id ? { ...person, line, bubbleMs: 2400 } : person));
}

export function sanitizeCarry(value) {
  return value === "picnic" ? "picnic" : "";
}
