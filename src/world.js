import { applyCrossingProgress, blockedByCrossing, BOOK_SPOT, CART, CART_ASIDE, PICNIC_SPOT } from "./crossings.js";

export const TOWN = {
  width: 2560,
  height: 2280,
  spawn: { x: 560, y: 920 },
};

export const ROOM = { width: 980, height: 720 };

export const HOUSE = {
  x: 250,
  y: 280,
  w: 460,
  h: 380,
  door: { x: 480, y: 660 },
};

export const PARK = { x: 860, y: 1680, w: 820, h: 420 };

export const BUILDINGS = [
  { id: "home", x: 250, y: 280, w: 460, h: 380, gap: { x: 480, y: 660 } },
  { id: "neighbor-a", x: 860, y: 300, w: 300, h: 300 },
  { id: "neighbor-b", x: 1260, y: 300, w: 300, h: 300 },
  { id: "bakery", x: 80, y: 820, w: 340, h: 300, gap: { x: 420, y: 980 } },
  { id: "library", x: 80, y: 1220, w: 340, h: 340, gap: { x: 420, y: 1400 } },
  { id: "cafe", x: 1960, y: 1100, w: 380, h: 340, gap: { x: 1960, y: 1320 } },
  { id: "shed", x: 1680, y: 1880, w: 180, h: 140 },
];

export const REACH = 160;
export const ACTION_BEAT_MS = 1100;

export const FURNITURE_POSES = {
  sofa: "sit",
  table: "eat",
  bed: "sleep",
  look: "look",
  play: "play",
};

export const ROOMS = {
  town: { id: "town", doors: ["living", "cafe", "bakery", "library"] },
  living: { id: "living", doors: ["town", "kitchen", "bedroom"] },
  kitchen: { id: "kitchen", doors: ["living"] },
  bedroom: { id: "bedroom", doors: ["living"] },
  cafe: { id: "cafe", doors: ["town"] },
  bakery: { id: "bakery", doors: ["town"] },
  library: { id: "library", doors: ["town"] },
};

export const ACTIONS = {
  town: [
    { id: "enter-house", label: "Go inside", x: HOUSE.door.x, y: HOUSE.door.y + 8 },
    { id: "name-door", label: "Door name", x: HOUSE.door.x, y: HOUSE.door.y + 8 },
    { id: "paint-house", label: "Paint house", x: HOUSE.door.x, y: HOUSE.door.y + 8 },
    { id: "enter-cafe", label: "Honey Cafe", x: 1960, y: 1320 },
    { id: "enter-bakery", label: "Little Bakery", x: 420, y: 980 },
    { id: "enter-library", label: "Library", x: 420, y: 1400 },
    { id: "jobs", label: "Pretend job", x: 1180, y: 1280 },
    { id: "look-fountain", label: "Look", x: 1180, y: 1320, furniture: "look" },
    { id: "look-mural", label: "See mural", x: 1680, y: 1360, furniture: "look" },
    { id: "park-sit", label: "Sit", x: 1020, y: 1880, furniture: "sofa" },
    { id: "play-park", label: "Play", x: 1280, y: 1940, furniture: "play" },
    { id: "park-work", label: "Water flowers", x: 1680, y: 1960 },
    { id: "open-gate", label: "Open gate", x: 930, y: 1694 },
    { id: "close-gate", label: "Close gate", x: 930, y: 1694 },
    { id: "take-picnic", label: "Take picnic", x: 500, y: 1020 },
    { id: "share-picnic", label: "Share picnic", x: PICNIC_SPOT.x, y: PICNIC_SPOT.y },
    { id: "push-cart", label: "Push cart", x: CART.x + CART.w / 2, y: CART.y + CART.h / 2 },
    { id: "nudge-cart", label: "Nudge cart back", x: CART_ASIDE.x + CART_ASIDE.w / 2, y: CART_ASIDE.y + CART_ASIDE.h / 2 },
    { id: "take-book", label: "Take a book", x: 460, y: 1400 },
    { id: "share-book", label: "Share book", x: BOOK_SPOT.x, y: BOOK_SPOT.y },
    { id: "stickers", label: "My stickers", x: 1180, y: 1280, anywhere: true },
  ],
  living: [
    { id: "go-outside", label: "Go outside", x: 490, y: 660, anywhere: true },
    { id: "open-closet", label: "Closet", x: 490, y: 160, anywhere: true },
    { id: "to-kitchen", label: "Kitchen", x: 910, y: 340, anywhere: true },
    { id: "to-bedroom", label: "Bedroom", x: 70, y: 340, anywhere: true },
    { id: "sit", label: "Sit", x: 220, y: 430, furniture: "sofa" },
  ],
  kitchen: [
    { id: "to-living-from-kitchen", label: "Living room", x: 70, y: 340, anywhere: true },
    { id: "eat", label: "Eat", x: 500, y: 400, furniture: "table", anywhere: true },
  ],
  bedroom: [
    { id: "to-living-from-bedroom", label: "Living room", x: 910, y: 340, anywhere: true },
    { id: "sleep", label: "Sleep", x: 360, y: 390, furniture: "bed", anywhere: true },
  ],
  cafe: [
    { id: "leave-cafe", label: "Go outside", x: 70, y: 340, anywhere: true },
    { id: "cafe-sit", label: "Sit", x: 500, y: 400, furniture: "sofa", anywhere: true },
  ],
  bakery: [
    { id: "leave-bakery", label: "Go outside", x: 70, y: 340, anywhere: true },
    { id: "bakery-work", label: "Knead dough", x: 560, y: 400, anywhere: true },
    { id: "take-picnic", label: "Take picnic", x: 560, y: 400, anywhere: true },
  ],
  library: [
    { id: "leave-library", label: "Go outside", x: 70, y: 340, anywhere: true },
    { id: "library-work", label: "Stamp a book", x: 560, y: 400, anywhere: true },
    { id: "take-book", label: "Take a book", x: 560, y: 400, anywhere: true },
  ],
};

export function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

export function inRect(x, y, rect, pad = 0) {
  return x >= rect.x - pad && x <= rect.x + rect.w + pad && y >= rect.y - pad && y <= rect.y + rect.h + pad;
}

export function canEnter(from, to) {
  return !!ROOMS[from]?.doors.includes(to);
}

export function enterRoom(player, room) {
  if (!canEnter(player.room, room)) return player;
  return { ...player, room, pose: "idle", actionBeatMs: 0 };
}

export function spawnFor(from, to) {
  if (to === "town" && from === "living") return { x: HOUSE.door.x, y: HOUSE.door.y + 70 };
  if (to === "town" && from === "cafe") return { x: 1920, y: 1320 };
  if (to === "town" && from === "bakery") return { x: 460, y: 980 };
  if (to === "town" && from === "library") return { x: 460, y: 1400 };
  if (to === "living" && from === "town") return { x: 490, y: 620 };
  if (to === "living" && from === "kitchen") return { x: 860, y: 360 };
  if (to === "living" && from === "bedroom") return { x: 120, y: 360 };
  if (to === "kitchen") return { x: 120, y: 380 };
  if (to === "bedroom") return { x: 820, y: 360 };
  if (to === "cafe" || to === "bakery" || to === "library") return { x: 140, y: 400 };
  return { x: ROOM.width / 2, y: ROOM.height / 2 };
}

export function placeName(room) {
  if (room === "town") return "Sunny Plaza";
  if (room === "living") return "Living room";
  if (room === "kitchen") return "Kitchen";
  if (room === "bedroom") return "Bedroom";
  if (room === "cafe") return "Honey Cafe";
  if (room === "bakery") return "Little Bakery";
  if (room === "library") return "Town Library";
  return "Town";
}

export function blockedByBuildings(x, y) {
  return BUILDINGS.some((building) => {
    if (!inRect(x, y, building)) return false;
    if (building.gap && Math.hypot(x - building.gap.x, y - building.gap.y) < 48) return false;
    return true;
  });
}

export function isBlocked(room, x, y, extras = {}) {
  if (room === "town") {
    return (
      x < 40 ||
      y < 90 ||
      x > TOWN.width - 40 ||
      y > TOWN.height - 40 ||
      blockedByBuildings(x, y) ||
      blockedByCrossing(x, y, extras)
    );
  }
  return x < 50 || y < 110 || x > ROOM.width - 50 || y > ROOM.height - 50;
}

export function stepToward(player, target, dt, speed = 195) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const length = Math.hypot(dx, dy);
  if (length < 4) {
    return {
      ...player,
      x: target.x,
      y: target.y,
      pose: player.actionBeatMs ? player.pose : "idle",
    };
  }
  const step = Math.min(length, speed * (dt / 1000));
  const nextX = player.x + (dx / length) * step;
  const nextY = player.y + (dy / length) * step;
  const facing = dx === 0 ? player.facing : dx > 0 ? 1 : -1;
  let x = player.x;
  let y = player.y;
  const extras = { parkGateOpen: player.parkGateOpen, bookCartOut: player.bookCartOut };
  if (!isBlocked(player.room, nextX, player.y, extras)) x = nextX;
  if (!isBlocked(player.room, x, nextY, extras)) y = nextY;
  const moving = Math.hypot(x - player.x, y - player.y) > 0.4;
  const moved = {
    ...player,
    x,
    y,
    facing,
    pose: moving ? "walk" : "idle",
  };
  if (player.room !== "town") return moved;
  return applyCrossingProgress(player, moved);
}

export function startFurniture(player, furniture) {
  const pose = FURNITURE_POSES[furniture];
  if (!pose) return player;
  const next = { ...player, pose, actionBeatMs: ACTION_BEAT_MS };
  delete next.score;
  delete next.timer;
  delete next.hunger;
  delete next.needs;
  return next;
}

export function tickAction(player, dt) {
  if (!player.actionBeatMs) return player;
  return { ...player, actionBeatMs: Math.max(0, player.actionBeatMs - dt) };
}

export function visibleActions(player) {
  const idle = player.pose !== "walk" && player.actionBeatMs <= 0;
  return (ACTIONS[player.room] ?? []).filter((action) => {
    if (player.actionBeatMs > 0) return false;
    if ((action.id === "open-closet" || action.furniture) && !idle) return false;
    if (action.id === "open-closet" && player.room !== "living") return false;
    if (action.id === "bakery-work" && player.job !== "baker") return false;
    if (action.id === "library-work" && player.job !== "librarian") return false;
    if (action.id === "park-work" && player.job !== "park") return false;
    if (action.id === "open-gate" && player.parkGateOpen) return false;
    if (action.id === "close-gate" && !player.parkGateOpen) return false;
    if (action.id === "take-picnic" && player.carry) return false;
    if (action.id === "share-picnic" && player.carry !== "picnic") return false;
    if (action.id === "push-cart" && player.bookCartOut === false) return false;
    if (action.id === "nudge-cart" && player.bookCartOut !== false) return false;
    if (action.id === "take-book" && player.carry) return false;
    if (action.id === "share-book" && player.carry !== "book") return false;
    if (action.anywhere) return true;
    return dist(player.x, player.y, action.x, action.y) <= REACH;
  });
}

export function actionById(room, id) {
  return (ACTIONS[room] ?? []).find((action) => action.id === id);
}

export function moveToAction(player, id) {
  const action = actionById(player.room, id);
  return action ? { ...player, x: action.x, y: action.y } : player;
}

export function beatLabel(pose) {
  if (pose === "sit") return "Sitting";
  if (pose === "eat") return "Eating";
  if (pose === "sleep") return "Sleeping";
  if (pose === "look") return "Looking";
  if (pose === "play") return "Playing";
  if (pose === "work") return "Helping";
  if (pose === "hop") return "Hopping";
  return "";
}
