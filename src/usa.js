import { sanitizeStickers } from "./crossings.js";

export const USA_MAP = {
  width: 2480,
  height: 1680,
  spawn: { x: 1868, y: 620 },
};

export const STATE_MAP = {
  width: 1600,
  height: 1100,
};

export const MAP_STAND = { x: 1480, y: 1188 };

export const HOP_MS = 720;
export const CAPITAL_REACH = 92;
export const CAPITAL_TAP_R = 54;
export const NEAR_HOPS = 3;

export const JUMPER_COLOR = "#00bfc8";
export const JUMPER_OUTLINE = "#fff8e7";
export const CAPITAL_MARKER = "#f4b942";
export const KID_SHIRT = "#ef6b6b";

const PASTELS = ["#7dcea0", "#f5cba7", "#6db3e0", "#c39bd3", "#f08080", "#82e0aa", "#5b8def", "#e8b86d", "#f4a4c4", "#7ec850"];

const RAW = [
  ["al", "Alabama", "Montgomery", -86.3, 32.38, 118, 92],
  ["ak", "Alaska", "Juneau", null, null, 210, 130],
  ["az", "Arizona", "Phoenix", -112.07, 33.45, 150, 130],
  ["ar", "Arkansas", "Little Rock", -92.29, 34.75, 118, 92],
  ["ca", "California", "Sacramento", -121.49, 38.58, 128, 210],
  ["co", "Colorado", "Denver", -104.99, 39.74, 150, 110],
  ["ct", "Connecticut", "Hartford", -72.68, 41.76, 72, 48],
  ["de", "Delaware", "Dover", -75.52, 39.16, 52, 56],
  ["dc", "District of Columbia", "Washington", -77.04, 38.91, 48, 42],
  ["fl", "Florida", "Tallahassee", -84.28, 30.44, 150, 110],
  ["ga", "Georgia", "Atlanta", -84.39, 33.75, 118, 110],
  ["hi", "Hawaii", "Honolulu", null, null, 170, 78],
  ["id", "Idaho", "Boise", -116.2, 43.62, 118, 150],
  ["il", "Illinois", "Springfield", -89.65, 39.78, 92, 140],
  ["in", "Indiana", "Indianapolis", -86.16, 39.77, 86, 118],
  ["ia", "Iowa", "Des Moines", -93.62, 41.59, 130, 86],
  ["ks", "Kansas", "Topeka", -95.68, 39.05, 160, 86],
  ["ky", "Kentucky", "Frankfort", -84.86, 38.2, 170, 70],
  ["la", "Louisiana", "Baton Rouge", -91.19, 30.45, 118, 100],
  ["me", "Maine", "Augusta", -69.78, 44.31, 92, 130],
  ["md", "Maryland", "Annapolis", -76.49, 38.98, 92, 52],
  ["ma", "Massachusetts", "Boston", -71.06, 42.36, 92, 48],
  ["mi", "Michigan", "Lansing", -84.55, 42.73, 118, 130],
  ["mn", "Minnesota", "Saint Paul", -93.09, 44.95, 118, 130],
  ["ms", "Mississippi", "Jackson", -90.18, 32.3, 92, 118],
  ["mo", "Missouri", "Jefferson City", -92.17, 38.58, 130, 100],
  ["mt", "Montana", "Helena", -112.04, 46.59, 200, 100],
  ["ne", "Nebraska", "Lincoln", -96.7, 40.81, 180, 78],
  ["nv", "Nevada", "Carson City", -119.77, 39.16, 118, 150],
  ["nh", "New Hampshire", "Concord", -71.54, 43.21, 62, 86],
  ["nj", "New Jersey", "Trenton", -74.76, 40.22, 56, 86],
  ["nm", "New Mexico", "Santa Fe", -105.94, 35.69, 140, 130],
  ["ny", "New York", "Albany", -73.76, 42.65, 150, 92],
  ["nc", "North Carolina", "Raleigh", -78.64, 35.78, 180, 78],
  ["nd", "North Dakota", "Bismarck", -100.78, 46.81, 160, 78],
  ["oh", "Ohio", "Columbus", -82.99, 39.96, 100, 92],
  ["ok", "Oklahoma", "Oklahoma City", -97.52, 35.47, 170, 86],
  ["or", "Oregon", "Salem", -123.03, 44.94, 140, 92],
  ["pa", "Pennsylvania", "Harrisburg", -76.88, 40.27, 150, 78],
  ["ri", "Rhode Island", "Providence", -71.41, 41.82, 48, 42],
  ["sc", "South Carolina", "Columbia", -81.03, 34.0, 110, 86],
  ["sd", "South Dakota", "Pierre", -100.35, 44.37, 160, 86],
  ["tn", "Tennessee", "Nashville", -86.78, 36.17, 200, 70],
  ["tx", "Texas", "Austin", -97.74, 30.27, 210, 180],
  ["ut", "Utah", "Salt Lake City", -111.89, 40.76, 110, 130],
  ["vt", "Vermont", "Montpelier", -72.58, 44.26, 56, 86],
  ["va", "Virginia", "Richmond", -77.43, 37.54, 150, 78],
  ["wa", "Washington", "Olympia", -122.9, 47.04, 130, 86],
  ["wv", "West Virginia", "Charleston", -81.63, 38.35, 92, 86],
  ["wi", "Wisconsin", "Madison", -89.4, 43.07, 100, 118],
  ["wy", "Wyoming", "Cheyenne", -104.82, 41.14, 150, 110],
];

function project(lon, lat) {
  return {
    x: 70 + ((lon + 125) / 58) * 2280,
    y: 90 + ((49.5 - lat) / 24.5) * 1120,
  };
}

function insetCapital(id) {
  if (id === "ak") return { x: 250, y: 1460 };
  if (id === "hi") return { x: 560, y: 1488 };
  return null;
}

export const STATES = RAW.map((row, index) => {
  const [id, name, capital, lon, lat, w, h] = row;
  const point = lon == null ? insetCapital(id) : project(lon, lat);
  return {
    id,
    name,
    capital,
    lon,
    lat,
    x: Math.round(point.x),
    y: Math.round(point.y),
    w,
    h,
    color: PASTELS[index % PASTELS.length],
  };
});

const BY_ID = Object.fromEntries(STATES.map((state) => [state.id, state]));

export function stateById(id) {
  return BY_ID[id] ?? null;
}

export function capitalLabel(state) {
  if (!state) return "";
  if (state.id === "dc") return "Washington, D.C.";
  return `${state.capital}, ${state.name}`;
}

export function isUsaRoom(room) {
  return room === "usa" || room === "state";
}

export function showJumperI(player) {
  return isUsaRoom(player?.room);
}

export function jumperMarkerLooksDistinct() {
  return JUMPER_COLOR !== CAPITAL_MARKER && JUMPER_COLOR !== KID_SHIRT && JUMPER_COLOR !== JUMPER_OUTLINE;
}

export function currentCapital(player) {
  if (player?.room === "state") return stateById(player.stateId);
  if (player?.capitalId) return stateById(player.capitalId);
  return nearestCapital(player?.x, player?.y);
}

export function nearestCapital(x, y, list = STATES) {
  let best = list[0];
  let bestDist = Infinity;
  for (const state of list) {
    const d = Math.hypot((x ?? 0) - state.x, (y ?? 0) - state.y);
    if (d < bestDist) {
      best = state;
      bestDist = d;
    }
  }
  return best;
}

export function capitalAt(x, y, radius = CAPITAL_TAP_R, list = STATES) {
  const hit = nearestCapital(x, y, list);
  if (!hit) return null;
  return Math.hypot(x - hit.x, y - hit.y) <= radius ? hit : null;
}

export function nearbyHopTargets(player, count = NEAR_HOPS) {
  const here = currentCapital(player);
  const origin = here ? { x: here.x, y: here.y } : { x: player.x, y: player.y };
  return STATES.filter((state) => state.id !== here?.id)
    .map((state) => ({ state, d: Math.hypot(state.x - origin.x, state.y - origin.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((item) => item.state);
}

function clearPay(next) {
  delete next.money;
  delete next.score;
  delete next.timer;
  delete next.hunger;
  delete next.needs;
  return next;
}

function withUsaStickers(player, extra) {
  return { ...sanitizeStickers(player.stickers), ...extra };
}

export function enterUsaMap(player, capitalId = "dc") {
  const state = stateById(capitalId) ?? stateById("dc");
  return clearPay({
    ...player,
    room: "usa",
    stateId: "",
    capitalId: state.id,
    x: state.x,
    y: state.y,
    pose: "idle",
    actionBeatMs: 0,
    hopMs: 0,
    hopFrom: null,
    hopTo: null,
    jumper: true,
    stickers: withUsaStickers(player, { usaMap: true }),
  });
}

export function enterStateMap(player, stateId, fromId = "") {
  const state = stateById(stateId) ?? currentCapital(player);
  if (!state) return player;
  const dest = stateViewPoint(state.id);
  const start = fromId && fromId !== state.id ? stateRimPoint(fromId, state.id) : dest;
  return clearPay({
    ...player,
    room: "state",
    stateId: state.id,
    capitalId: state.id,
    x: start.x,
    y: start.y,
    pose: "idle",
    actionBeatMs: 0,
    hopMs: 0,
    hopFrom: null,
    hopTo: null,
    jumper: true,
    stickers: withUsaStickers(player, { usaState: true }),
  });
}

export function leaveUsaMap(player) {
  return clearPay({
    ...player,
    room: "town",
    stateId: "",
    capitalId: "",
    x: MAP_STAND.x,
    y: MAP_STAND.y + 36,
    pose: "idle",
    actionBeatMs: 0,
    hopMs: 0,
    hopFrom: null,
    hopTo: null,
    jumper: false,
  });
}

export function stateViewPoint() {
  return { x: STATE_MAP.width / 2, y: STATE_MAP.height / 2 + 20 };
}

export function stateRimPoint(fromId, toId) {
  const from = stateById(fromId);
  const to = stateById(toId);
  const dest = stateViewPoint(toId);
  if (!from || !to) return dest;
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: dx > 0 ? 120 : STATE_MAP.width - 120, y: dest.y };
  }
  return { x: dest.x, y: dy > 0 ? 140 : STATE_MAP.height - 120 };
}

export function neighborPads(stateId) {
  const here = stateById(stateId);
  if (!here) return [];
  const spots = [
    { x: 340, y: 96 },
    { x: STATE_MAP.width - 130, y: STATE_MAP.height / 2 + 20 },
    { x: STATE_MAP.width / 2, y: STATE_MAP.height - 90 },
    { x: 130, y: STATE_MAP.height / 2 + 20 },
  ];
  return nearbyHopTargets({ room: "usa", capitalId: stateId, x: here.x, y: here.y }, 4).map((state, index) => ({
    ...state,
    padX: spots[index].x,
    padY: spots[index].y,
  }));
}

export function hopDestination(player, targetId) {
  const target = stateById(targetId);
  if (!target) return null;
  if (player.room === "state") return stateViewPoint(target.id);
  return { x: target.x, y: target.y };
}

export function startHop(player, targetId) {
  const target = stateById(targetId);
  if (!target) return player;
  const here = currentCapital(player);
  if (here?.id === target.id && player.hopMs <= 0 && player.room !== "state") return player;

  if (player.room === "state" && player.stateId !== target.id) {
    const pad = neighborPads(player.stateId).find((item) => item.id === target.id);
    const dest = pad ? { x: pad.padX, y: pad.padY } : stateViewPoint(target.id);
    const from = { x: player.x, y: player.y };
    return clearPay({
      ...player,
      capitalId: target.id,
      pendingState: target.id,
      pose: "hop",
      hopMs: HOP_MS,
      hopFrom: from,
      hopTo: dest,
      jumper: true,
      stickers: withUsaStickers(player, { usaHop: true, usaState: true }),
    });
  }

  const dest = hopDestination(player, target.id);
  const from = { x: player.x, y: player.y };
  return clearPay({
    ...player,
    capitalId: target.id,
    pose: "hop",
    hopMs: HOP_MS,
    hopFrom: from,
    hopTo: dest,
    jumper: true,
    stickers: withUsaStickers(player, { usaHop: true }),
  });
}

export function tickHop(player, dt) {
  if (!player?.hopMs) return player;
  const from = player.hopFrom ?? { x: player.x, y: player.y };
  const to = player.hopTo ?? { x: player.x, y: player.y };
  const nextMs = Math.max(0, player.hopMs - dt);
  const t = 1 - nextMs / HOP_MS;
  const eased = t * t * (3 - 2 * t);
  const arc = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 64;
  const x = from.x + (to.x - from.x) * eased;
  const y = from.y + (to.y - from.y) * eased - arc;
  if (nextMs <= 0) {
    const landed = {
      ...player,
      x: to.x,
      y: to.y,
      pose: "idle",
      hopMs: 0,
      hopFrom: null,
      hopTo: null,
      jumper: true,
      capitalId: player.capitalId,
    };
    if (player.pendingState) {
      const next = enterStateMap(landed, player.pendingState);
      return { ...next, pendingState: "", snapCamera: true };
    }
    return landed;
  }
  return { ...player, x, y, pose: "hop", hopMs: nextMs, jumper: true };
}

export function hopFromPoint(player, x, y) {
  if (player.room === "state") {
    const pads = neighborPads(player.stateId);
    const pad = pads.find((item) => Math.hypot(x - item.padX, y - item.padY) <= CAPITAL_TAP_R + 10);
    if (pad) return startHop(player, pad.id);
    return null;
  }
  const hit = capitalAt(x, y);
  if (!hit) return null;
  if (hit.id === currentCapital(player)?.id) return null;
  return startHop(player, hit.id);
}

export function usaActions(player) {
  if (!isUsaRoom(player.room) || player.actionBeatMs > 0 || player.hopMs > 0) return [];
  const actions = [];
  if (player.room === "usa") {
    actions.push({ id: "leave-usa", label: "Sunny Plaza", x: player.x, y: player.y, anywhere: true });
    const here = currentCapital(player);
    if (here && Math.hypot(player.x - here.x, player.y - here.y) <= CAPITAL_REACH) {
      actions.push({
        id: "see-state",
        label: `See ${here.id === "dc" ? "D.C." : here.name}`,
        x: here.x,
        y: here.y,
      });
    }
  } else {
    actions.push({ id: "leave-state", label: "USA map", x: player.x, y: player.y, anywhere: true });
  }
  for (const state of nearbyHopTargets(player)) {
    const dest = player.room === "state" ? neighborPads(player.stateId).find((pad) => pad.id === state.id) : state;
    actions.push({
      id: `hop:${state.id}`,
      label: `Hop to ${capitalLabel(state)}`,
      x: dest?.padX ?? dest?.x ?? state.x,
      y: dest?.padY ?? dest?.y ?? state.y,
    });
  }
  actions.push({ id: "stickers", label: "My stickers", x: player.x, y: player.y, anywhere: true });
  return actions;
}

export function usaPlaceName(player) {
  if (player.room === "state") {
    const state = stateById(player.stateId);
    return state ? capitalLabel(state) : "State map";
  }
  if (player.room === "usa") return "USA map";
  return "";
}

export function isUsaBlocked(room, x, y) {
  if (room === "usa") {
    return x < 40 || y < 80 || x > USA_MAP.width - 40 || y > USA_MAP.height - 40;
  }
  if (room === "state") {
    return x < 50 || y < 90 || x > STATE_MAP.width - 50 || y > STATE_MAP.height - 50;
  }
  return false;
}
