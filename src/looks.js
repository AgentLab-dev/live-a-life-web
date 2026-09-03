export const SKINS = [
  { id: "porcelain", name: "Porcelain", fill: "#fde8d6" },
  { id: "peach", name: "Peach", fill: "#f4c9a3" },
  { id: "honey", name: "Honey", fill: "#e0a878" },
  { id: "amber", name: "Amber", fill: "#c68642" },
  { id: "cocoa", name: "Cocoa", fill: "#8d5524" },
  { id: "espresso", name: "Espresso", fill: "#4a2c1a" },
];

export const HAIRS = [
  { id: "black", name: "Black", fill: "#1a1a1a" },
  { id: "brown", name: "Brown", fill: "#4a3020" },
  { id: "auburn", name: "Auburn", fill: "#8b3a2a" },
  { id: "blonde", name: "Blonde", fill: "#e6c35c" },
  { id: "copper", name: "Copper", fill: "#d4783a" },
  { id: "night", name: "Night", fill: "#2c3a6b" },
];

export const DEFAULT_SKIN = "peach";
export const DEFAULT_HAIR = "brown";

export const HOUSE_COLORS = [
  { id: "sunshine", name: "Sunshine", fill: "#f4b942", trim: "#d4921a", roof: "#c45c26" },
  { id: "coral", name: "Coral", fill: "#f08080", trim: "#c45c5c", roof: "#8b3a3a" },
  { id: "sky", name: "Sky", fill: "#6db3e0", trim: "#3d7eab", roof: "#355c7d" },
  { id: "mint", name: "Mint", fill: "#7dcea0", trim: "#3f8f68", roof: "#2d6a4f" },
  { id: "lavender", name: "Lavender", fill: "#c39bd3", trim: "#8e5ea0", roof: "#5b3a6b" },
  { id: "peach", name: "Peach", fill: "#f5cba7", trim: "#d4a06a", roof: "#b56b45" },
  { id: "cream", name: "Cream", fill: "#f7efd4", trim: "#d4c49a", roof: "#8d6e4c" },
  { id: "tomato", name: "Tomato", fill: "#e74c3c", trim: "#b03a2e", roof: "#6e2c1f" },
];

export const DEFAULT_HOUSE = "sunshine";
export const DEFAULT_DOOR = "Home";

export const OUTFIT_SLOTS = {
  hat: ["none", "cap", "beanie"],
  top: ["tee", "hoodie", "overalls"],
  shoes: ["sneakers", "boots", "sandals"],
};

export const DEFAULT_OUTFIT = { hat: "none", top: "tee", shoes: "sneakers" };

export function skinFill(id) {
  return SKINS.find((item) => item.id === id) ?? SKINS[1];
}

export function hairFill(id) {
  return HAIRS.find((item) => item.id === id) ?? HAIRS[1];
}

export function houseLook(id) {
  return HOUSE_COLORS.find((item) => item.id === id) ?? HOUSE_COLORS[0];
}

export function setSkin(state, id) {
  return SKINS.some((item) => item.id === id) ? { ...state, skin: id } : state;
}

export function setHair(state, id) {
  return HAIRS.some((item) => item.id === id) ? { ...state, hair: id } : state;
}

export function setHouseColor(state, id) {
  const next = HOUSE_COLORS.find((item) => item.id === id);
  return next ? { ...state, houseColor: next.id } : state;
}

export function isOutfitPiece(slot, piece) {
  return !!OUTFIT_SLOTS[slot]?.includes(piece);
}

export function normalizeOutfit(outfit = DEFAULT_OUTFIT) {
  return {
    hat: outfit.hat ?? DEFAULT_OUTFIT.hat,
    top: outfit.top ?? DEFAULT_OUTFIT.top,
    shoes: outfit.shoes ?? DEFAULT_OUTFIT.shoes,
  };
}

export function setOutfit(state, slot, piece) {
  if (!isOutfitPiece(slot, piece)) return state;
  return {
    ...state,
    outfit: { ...DEFAULT_OUTFIT, ...state.outfit, [slot]: piece },
  };
}

export function sanitizeDoorLabel(value) {
  const next = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16)
    .trim();
  return next.length === 0 ? DEFAULT_DOOR : next;
}

export function setDoorLabel(state, value) {
  return { ...state, doorLabel: sanitizeDoorLabel(value) };
}

export function pieceLabel(piece) {
  return piece === "none" ? "No hat" : piece[0].toUpperCase() + piece.slice(1);
}

export function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
