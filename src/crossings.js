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

export const HEDGES = [
  { x: 860, y: 624, w: 128, h: 20 },
  { x: 1124, y: 624, w: 168, h: 20 },
];

export const HEDGE_ARCH = { x: 988, y: 608, w: 136, h: 52 };

export const HEDGE_BAND = { x: 860, y: 624, w: 432, h: 20 };

export const FLOWER_BED = { x: 1324, y: 618, w: 248, h: 86 };

export const FLOWER_PADS = [
  { x: 1450, y: 636 },
  { x: 1450, y: 662 },
  { x: 1450, y: 688 },
];

export const FLOWER_PAD_RADIUS = 22;

export const CART = { x: 488, y: 1372, w: 52, h: 56 };

export const CART_ASIDE = { x: 488, y: 1464, w: 52, h: 40 };

export const HOPSCOTCH_ZONE = { x: 1988, y: 1464, w: 268, h: 56 };

export const HOPSCOTCH = [
  { x: 2024, y: 1464, w: 48, h: 56 },
  { x: 2084, y: 1464, w: 48, h: 56 },
  { x: 2144, y: 1464, w: 48, h: 56 },
  { x: 2204, y: 1464, w: 48, h: 56 },
];

export const STREAMER_POSTS = [
  { x: 1708, y: 1200, w: 20, h: 168 },
  { x: 1884, y: 1200, w: 20, h: 168 },
];

export const STREAMER_WALLS = [
  { x: 1728, y: 1240, w: 50, h: 16 },
  { x: 1834, y: 1240, w: 50, h: 16 },
];

export const RIBBON_GAP = { x: 1778, y: 1224, w: 56, h: 48 };

export const RIBBON_BAND = { x: 1728, y: 1240, w: 156, h: 16 };

export const PUDDLE = { x: 120, y: 1136, w: 220, h: 72 };

export const PLANK = { x: 188, y: 1124, w: 72, h: 96 };

export const BOOK_SPOT = { x: 1010, y: 612 };

export const STICKERS = [
  { id: "gate", name: "Gate helper", hint: "You opened the park gate." },
  { id: "bridge", name: "Bridge walker", hint: "You crossed the garden bridge." },
  { id: "stones", name: "Stone hopper", hint: "You hopped the sunny stones." },
  { id: "picnic", name: "Kind picnic", hint: "You shared a picnic in the park." },
  { id: "cheer", name: "Kind words", hint: "A neighbor cheered you on." },
  { id: "hedge", name: "Hedge walker", hint: "You walked through the leafy arch." },
  { id: "flowers", name: "Flower hopper", hint: "You hopped the garden flower pads." },
  { id: "cart", name: "Cart helper", hint: "You nudged the library cart aside." },
  { id: "hopscotch", name: "Chalk hopper", hint: "You hopped the cafe chalk squares." },
  { id: "ribbons", name: "Ribbon walker", hint: "You walked through the mural ribbons." },
  { id: "puddle", name: "Plank walker", hint: "You crossed the bakery puddle on a plank." },
  { id: "book", name: "Book friend", hint: "You shared a library book next door." },
];

export const CHEERS = {
  gate: "The gate looks happy open!",
  bridge: "What a gentle bridge walk!",
  stones: "Hop hop, those stones like you!",
  picnic: "A picnic for everyone. Kind!",
  hedge: "You found the leafy doorway!",
  flowers: "Pretty hops on the petals!",
  cart: "The cart likes that spot.",
  hopscotch: "Chalk squares, happy feet!",
  ribbons: "Those ribbons tickled by!",
  puddle: "A careful plank walk!",
  book: "A story for a neighbor. Kind!",
};

export const CARRY_KINDS = ["picnic", "book"];

export function defaultStickers() {
  return {
    gate: false,
    bridge: false,
    stones: false,
    picnic: false,
    cheer: false,
    hedge: false,
    flowers: false,
    cart: false,
    hopscotch: false,
    ribbons: false,
    puddle: false,
    book: false,
  };
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

export function onHedgeArch(x, y) {
  return inRect(x, y, HEDGE_ARCH);
}

export function onFlowerPad(x, y) {
  return FLOWER_PADS.some((pad) => Math.hypot(x - pad.x, y - pad.y) <= FLOWER_PAD_RADIUS);
}

export function onHopscotch(x, y) {
  return HOPSCOTCH.some((square) => inRect(x, y, square));
}

export function onRibbonGap(x, y) {
  return inRect(x, y, RIBBON_GAP);
}

export function onPlank(x, y) {
  return inRect(x, y, PLANK);
}

export function townPathAt(x, y) {
  if (onHedgeArch(x, y)) return "hedge";
  if (onFlowerPad(x, y)) return "flowers";
  if (onHopscotch(x, y)) return "hopscotch";
  if (onRibbonGap(x, y)) return "ribbons";
  if (onPlank(x, y)) return "puddle";
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

export function blockedByHedge(x, y) {
  return HEDGES.some((hedge) => inRect(x, y, hedge));
}

export function blockedByFlowerBed(x, y) {
  return inRect(x, y, FLOWER_BED) && !onFlowerPad(x, y);
}

export function blockedByCart(x, y, bookCartOut) {
  if (bookCartOut === false) return inRect(x, y, CART_ASIDE);
  return inRect(x, y, CART);
}

export function blockedByHopscotch(x, y) {
  return inRect(x, y, HOPSCOTCH_ZONE) && !onHopscotch(x, y);
}

export function blockedByStreamers(x, y) {
  if (onRibbonGap(x, y)) return false;
  return STREAMER_POSTS.some((post) => inRect(x, y, post)) || STREAMER_WALLS.some((wall) => inRect(x, y, wall));
}

export function blockedByPuddle(x, y) {
  return inRect(x, y, PUDDLE) && !onPlank(x, y);
}

export function blockedByCrossing(x, y, extras = {}) {
  return (
    blockedByWater(x, y) ||
    blockedByFence(x, y) ||
    blockedByGate(x, y, extras.parkGateOpen) ||
    blockedByHedge(x, y) ||
    blockedByFlowerBed(x, y) ||
    blockedByCart(x, y, extras.bookCartOut) ||
    blockedByHopscotch(x, y) ||
    blockedByStreamers(x, y) ||
    blockedByPuddle(x, y)
  );
}

function sideY(y, band, pad = 4) {
  if (y < band.y - pad) return "north";
  if (y > band.y + band.h + pad) return "south";
  return "";
}

function sideX(x, band, pad = 4) {
  if (x < band.x - pad) return "west";
  if (x > band.x + band.w + pad) return "east";
  return "";
}

function nearBandY(y, band, slack = 48) {
  return y >= band.y - slack && y <= band.y + band.h + slack;
}

function nearBandX(x, band, slack = 48) {
  return x >= band.x - slack && x <= band.x + band.w + slack;
}

function trackWay(prev, next, id, band, axis) {
  const value = axis === "x" ? next.x : next.y;
  const prevValue = axis === "x" ? prev.x : prev.y;
  const nowPath = townPathAt(next.x, next.y) === id ? id : "";
  const near = axis === "x" ? nearBandX(value, band) : nearBandY(value, band);
  const lastPath = nowPath || (near ? prev.lastWays?.[id] || "" : "");
  const nowSide = axis === "x" ? sideX(value, band) : sideY(value, band);
  const fromSide = prev.lastSides?.[id] || (axis === "x" ? sideX(prevValue, band) : sideY(prevValue, band));
  const lastSide = nowSide || (near ? fromSide : "");
  return {
    lastPath,
    lastSide,
    crossed: Boolean(fromSide && nowSide && fromSide !== nowSide && lastPath === id),
  };
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

  const lastWays = { ...(prev.lastWays || {}) };
  const lastSides = { ...(prev.lastSides || {}) };
  const ways = [
    ["hedge", HEDGE_BAND, "y"],
    ["flowers", FLOWER_BED, "y"],
    ["hopscotch", HOPSCOTCH_ZONE, "y"],
    ["ribbons", RIBBON_BAND, "y"],
    ["puddle", PUDDLE, "y"],
  ];
  for (const [id, band, axis] of ways) {
    const tracked = trackWay(prev, next, id, band, axis);
    lastWays[id] = tracked.lastPath;
    lastSides[id] = tracked.lastSide;
    if (tracked.crossed) stickers[id] = true;
  }

  return {
    ...next,
    stickers,
    lastPath,
    lastBank,
    lastWays,
    lastSides,
    onStone: path === "stones",
    onHop: onFlowerPad(next.x, next.y) || onHopscotch(next.x, next.y),
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

function clearPay(next) {
  delete next.money;
  delete next.score;
  delete next.timer;
  delete next.hunger;
  return next;
}

export function takePicnic(player) {
  if (player.carry) return player;
  return clearPay({ ...player, carry: "picnic", pose: "idle", actionBeatMs: 0 });
}

export function sharePicnic(player) {
  if (player.carry !== "picnic") return player;
  return clearPay({
    ...player,
    carry: "",
    pose: "eat",
    actionBeatMs: 1100,
    stickers: { ...sanitizeStickers(player.stickers), picnic: true },
  });
}

export function pushBookCart(player) {
  if (player.bookCartOut === false) return player;
  return {
    ...player,
    bookCartOut: false,
    pose: "work",
    actionBeatMs: 700,
    stickers: { ...sanitizeStickers(player.stickers), cart: true },
  };
}

export function nudgeBookCart(player) {
  if (player.bookCartOut !== false) return player;
  return { ...player, bookCartOut: true, pose: "work", actionBeatMs: 500 };
}

export function takeBook(player) {
  if (player.carry) return player;
  return clearPay({ ...player, carry: "book", pose: "idle", actionBeatMs: 0 });
}

export function shareBook(player) {
  if (player.carry !== "book") return player;
  return clearPay({
    ...player,
    carry: "",
    pose: "look",
    actionBeatMs: 1100,
    stickers: { ...sanitizeStickers(player.stickers), book: true },
  });
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
  return CARRY_KINDS.includes(value) ? value : "";
}

export function carryLabel(value) {
  if (value === "picnic") return "Picnic";
  if (value === "book") return "Book";
  return "";
}
