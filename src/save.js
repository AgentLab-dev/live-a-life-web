import {
  DEFAULT_DOOR,
  DEFAULT_HAIR,
  DEFAULT_HOUSE,
  DEFAULT_OUTFIT,
  DEFAULT_SKIN,
  HAIRS,
  HOUSE_COLORS,
  SKINS,
  isOutfitPiece,
  normalizeOutfit,
  sanitizeDoorLabel,
} from "./looks.js";
import { DEFAULT_JOB, JOBS } from "./jobs.js";

export const SAVE_KEY = "live-a-life-v1";

export function defaultSave() {
  return {
    houseColor: DEFAULT_HOUSE,
    doorLabel: DEFAULT_DOOR,
    skin: DEFAULT_SKIN,
    hair: DEFAULT_HAIR,
    outfit: { ...DEFAULT_OUTFIT },
    job: DEFAULT_JOB,
  };
}

function sanitizeOutfit(outfit) {
  const next = { ...DEFAULT_OUTFIT };
  for (const slot of Object.keys(DEFAULT_OUTFIT)) {
    if (isOutfitPiece(slot, outfit?.[slot])) next[slot] = outfit[slot];
  }
  return normalizeOutfit(next);
}

export function sanitizeSave(raw) {
  const fallback = defaultSave();
  if (!raw || typeof raw !== "object") return fallback;
  return {
    houseColor: HOUSE_COLORS.some((item) => item.id === raw.houseColor) ? raw.houseColor : fallback.houseColor,
    doorLabel: sanitizeDoorLabel(raw.doorLabel),
    skin: SKINS.some((item) => item.id === raw.skin) ? raw.skin : fallback.skin,
    hair: HAIRS.some((item) => item.id === raw.hair) ? raw.hair : fallback.hair,
    outfit: sanitizeOutfit(raw.outfit),
    job: JOBS.some((item) => item.id === raw.job) ? raw.job : fallback.job,
  };
}

export function loadSave(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SAVE_KEY);
    return raw ? sanitizeSave(JSON.parse(raw)) : defaultSave();
  } catch {
    return defaultSave();
  }
}

export function writeSave(storage, state) {
  const next = sanitizeSave(state);
  storage.setItem(SAVE_KEY, JSON.stringify(next));
  return next;
}

export function spawnPlayer(save) {
  return {
    ...save,
    room: "town",
    pose: "idle",
    actionBeatMs: 0,
    x: 560,
    y: 920,
    facing: 1,
  };
}
