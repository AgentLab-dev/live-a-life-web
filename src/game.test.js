import { describe, expect, it } from "vitest";
import {
  blockedByCart,
  blockedByClothesline,
  blockedByCones,
  blockedByCrates,
  blockedByFlour,
  blockedByFlowerBed,
  blockedByHedge,
  blockedByHopscotch,
  blockedByPond,
  blockedByPuddle,
  blockedByStreamers,
  blockedByWater,
  BOOK_SPOT,
  cheerCrossing,
  closeParkGate,
  defaultStickers,
  MAIL_SPOT,
  newSticker,
  nudgeBookCart,
  onBridge,
  onConeLane,
  onCrate,
  onFlourSack,
  onFlowerPad,
  onHedgeArch,
  onHopscotch,
  onLily,
  onLineGap,
  onPlank,
  onRibbonGap,
  onStone,
  openParkGate,
  pushBookCart,
  shareBook,
  shareCard,
  sharePicnic,
  takeBook,
  takeCard,
  takePicnic,
} from "./crossings.js";
import { canWorkHere, setJob, startWork } from "./jobs.js";
import { sanitizeDoorLabel, setDoorLabel, setHair, setHouseColor, setOutfit, setSkin } from "./looks.js";
import { createPeople, listenTo, nearbyPerson, stepPeople } from "./people.js";
import { loadSave, sanitizeSave, spawnPlayer, writeSave } from "./save.js";
import { createHold, dirFromKey, heldWalkTarget, isTypingTarget } from "./controls.js";
import {
  canEnter,
  enterRoom,
  isBlocked,
  placeName,
  spawnFor,
  startFurniture,
  stepToward,
  visibleActions,
} from "./world.js";

describe("Level -1 house looks", () => {
  it("keeps paint, door name, closet colors, and outfit", () => {
    let state = spawnPlayer(sanitizeSave({}));
    state = setHouseColor(state, "mint");
    state = setDoorLabel(state, "  Maple Nest  ");
    state = setSkin(state, "cocoa");
    state = setHair(state, "night");
    state = setOutfit(state, "hat", "beanie");
    expect(state.houseColor).toBe("mint");
    expect(state.doorLabel).toBe("Maple Nest");
    expect(state.skin).toBe("cocoa");
    expect(state.hair).toBe("night");
    expect(state.outfit.hat).toBe("beanie");
  });

  it("falls back to Home when the door label is blank", () => {
    expect(sanitizeDoorLabel("   ")).toBe("Home");
    expect(sanitizeDoorLabel("A very long door plaque name")).toBe("A very long door");
  });
});

describe("Level 0 rooms and city", () => {
  it("lets the house open onto the city shops", () => {
    expect(canEnter("town", "living")).toBe(true);
    expect(canEnter("town", "cafe")).toBe(true);
    expect(canEnter("town", "bakery")).toBe(true);
    expect(canEnter("town", "library")).toBe(true);
    expect(placeName("town")).toBe("Sunny Plaza");
    expect(placeName("cafe")).toBe("Honey Cafe");
  });

  it("keeps indoor room buttons available from anywhere", () => {
    const living = { room: "living", x: 500, y: 400, pose: "idle", actionBeatMs: 0, job: "none" };
    const ids = visibleActions(living).map((action) => action.id);
    expect(ids).toEqual(expect.arrayContaining(["go-outside", "open-closet", "to-kitchen", "to-bedroom"]));
  });

  it("shows kitchen and bedroom actions from the far side of the room", () => {
    const kitchen = { room: "kitchen", x: 800, y: 500, pose: "idle", actionBeatMs: 0, job: "none" };
    expect(visibleActions(kitchen).map((action) => action.id)).toEqual(
      expect.arrayContaining(["to-living-from-kitchen", "eat"]),
    );
    const bedroom = { room: "bedroom", x: 120, y: 500, pose: "idle", actionBeatMs: 0, job: "none" };
    expect(visibleActions(bedroom).map((action) => action.id)).toEqual(
      expect.arrayContaining(["to-living-from-bedroom", "sleep"]),
    );
  });

  it("walks the player out of the house onto the street", () => {
    const inside = enterRoom({ room: "living", pose: "walk", actionBeatMs: 200 }, "town");
    expect(inside.room).toBe("town");
    expect(spawnFor("living", "town").y).toBeGreaterThan(700);
  });

  it("blocks the house walls but not the front door", () => {
    expect(isBlocked("town", 400, 420)).toBe(true);
    expect(isBlocked("town", 480, 660)).toBe(false);
  });
});

describe("pretend work and people", () => {
  it("lets a baker knead only in the bakery", () => {
    const baker = setJob({ room: "bakery", job: "none" }, "baker");
    expect(canWorkHere(baker)).toBe(true);
    expect(startWork(baker).pose).toBe("work");
    expect(canWorkHere({ ...baker, room: "town" })).toBe(false);
  });

  it("keeps money fields off pretend jobs", () => {
    const next = setJob({ job: "none", money: 12, coins: 3 }, "park");
    expect(next.job).toBe("park");
    expect(next.money).toBeUndefined();
    expect(next.coins).toBeUndefined();
  });

  it("shows knead and stamp only for the matching job", () => {
    const baker = { room: "bakery", x: 200, y: 400, pose: "idle", actionBeatMs: 0, job: "baker" };
    expect(visibleActions(baker).some((action) => action.id === "bakery-work")).toBe(true);
    const visitor = { ...baker, job: "none" };
    expect(visibleActions(visitor).some((action) => action.id === "bakery-work")).toBe(false);
  });

  it("walks computer people and keeps canned lines", () => {
    let people = createPeople();
    expect(people.map((person) => person.name)).toEqual(["Mina", "Theo", "Pip", "Nia", "Otto", "Bee", "Willow"]);
    people = stepPeople(people, 500);
    people = listenTo(people, "mina");
    expect(people.find((person) => person.id === "mina").bubbleMs).toBe(2200);
    expect(people.find((person) => person.id === "mina").line).toMatch(/rolls/i);
  });

  it("finds a nearby person to listen to", () => {
    const people = createPeople();
    const mina = people[0];
    expect(nearbyPerson(people, mina.x, mina.y)?.id).toBe("mina");
    expect(nearbyPerson(people, 0, 0)).toBeNull();
  });
});

describe("movement controls", () => {
  it("maps arrow keys and WASD to four ways", () => {
    expect(dirFromKey("ArrowUp", "ArrowUp")).toBe("up");
    expect(dirFromKey("ArrowDown", "ArrowDown")).toBe("down");
    expect(dirFromKey("ArrowLeft", "ArrowLeft")).toBe("left");
    expect(dirFromKey("ArrowRight", "ArrowRight")).toBe("right");
    expect(dirFromKey("KeyW", "w")).toBe("up");
    expect(dirFromKey("KeyA", "a")).toBe("left");
    expect(dirFromKey("KeyS", "s")).toBe("down");
    expect(dirFromKey("KeyD", "d")).toBe("right");
    expect(dirFromKey("KeyQ", "q")).toBeNull();
  });

  it("does not steal keys from the door name field", () => {
    expect(isTypingTarget({ tagName: "INPUT", id: "door-input" })).toBe(true);
    expect(isTypingTarget({ tagName: "BUTTON", dataset: { action: "paint-house" } })).toBe(false);
  });

  it("holds one four-way direction at a time, last press wins", () => {
    const hold = createHold();
    hold.press("left");
    hold.press("up");
    expect(hold.current()).toBe("up");
    hold.release("up");
    expect(hold.current()).toBe("left");
    hold.clear();
    expect(hold.current()).toBeNull();
  });

  it("walks the kid the held way without a tap target", () => {
    const start = { room: "living", x: 400, y: 400, pose: "idle", facing: 1, actionBeatMs: 0 };
    const right = stepToward(start, heldWalkTarget(start, "right"), 200);
    const left = stepToward(start, heldWalkTarget(start, "left"), 200);
    const up = stepToward(start, heldWalkTarget(start, "up"), 200);
    const down = stepToward(start, heldWalkTarget(start, "down"), 200);
    expect(right.x).toBeGreaterThan(start.x);
    expect(left.x).toBeLessThan(start.x);
    expect(up.y).toBeLessThan(start.y);
    expect(down.y).toBeGreaterThan(start.y);
    expect(right.pose).toBe("walk");
  });
});

describe("park crossings", () => {
  const extrasClosed = { parkGateOpen: false };
  const extrasOpen = { parkGateOpen: true };

  it("blocks creek water but not stones or the garden bridge", () => {
    expect(blockedByWater(1100, 1610)).toBe(true);
    expect(isBlocked("town", 1100, 1610)).toBe(true);
    expect(onStone(1400, 1612)).toBe(true);
    expect(isBlocked("town", 1400, 1612)).toBe(false);
    expect(onBridge(840, 1610)).toBe(true);
    expect(isBlocked("town", 840, 1610)).toBe(false);
  });

  it("blocks the closed park gate and lets the kid through when open", () => {
    expect(isBlocked("town", 930, 1686, extrasClosed)).toBe(true);
    expect(isBlocked("town", 930, 1686, extrasOpen)).toBe(false);
    const opened = openParkGate({ parkGateOpen: false, stickers: defaultStickers() });
    expect(opened.parkGateOpen).toBe(true);
    expect(opened.stickers.gate).toBe(true);
    expect(opened.score).toBeUndefined();
    expect(closeParkGate(opened).parkGateOpen).toBe(false);
  });

  function walkFrames(player, target, frames = 48) {
    let next = player;
    for (let i = 0; i < frames; i += 1) {
      next = stepToward(next, typeof target === "function" ? target(next) : target, 40);
    }
    return next;
  }

  it("walks the garden bridge with held controls and earns a sticker", () => {
    const start = {
      room: "town",
      x: 840,
      y: 1520,
      pose: "idle",
      facing: 1,
      actionBeatMs: 0,
      parkGateOpen: true,
      stickers: defaultStickers(),
    };
    const down = heldWalkTarget(start, "down");
    const player = walkFrames(start, (now) => heldWalkTarget(now, "down"));
    expect(down.y).toBeGreaterThan(start.y);
    expect(player.y).toBeGreaterThan(1664);
    expect(player.stickers.bridge).toBe(true);
    expect(player.money).toBeUndefined();
    expect(newSticker(start.stickers, player.stickers)).toBe("bridge");
  });

  it("hops stepping stones and earns a sticker without a fail state", () => {
    let player = {
      room: "town",
      x: 1310,
      y: 1548,
      pose: "idle",
      facing: 1,
      actionBeatMs: 0,
      stickers: defaultStickers(),
    };
    for (const stone of [
      { x: 1310, y: 1576 },
      { x: 1354, y: 1598 },
      { x: 1400, y: 1612 },
      { x: 1446, y: 1634 },
      { x: 1490, y: 1656 },
      { x: 1490, y: 1690 },
    ]) {
      player = walkFrames(player, stone, 24);
    }
    expect(player.y).toBeGreaterThan(1664);
    expect(player.stickers.stones).toBe(true);
    expect(player.timer).toBeUndefined();
    expect(player.needs).toBeUndefined();
  });

  it("lets tap-to-walk stop at water instead of punishing", () => {
    const start = {
      room: "town",
      x: 1100,
      y: 1500,
      pose: "idle",
      facing: 1,
      actionBeatMs: 0,
      stickers: defaultStickers(),
    };
    const next = stepToward(start, { x: 1100, y: 1700 }, 80);
    expect(next.y).toBeLessThan(1560);
    expect(next.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 1100, 1610)).toBe(true);
  });

  it("keeps arrow and WASD walking while a gate is closed", () => {
    const start = {
      room: "town",
      x: 930,
      y: 1724,
      pose: "idle",
      facing: 1,
      actionBeatMs: 0,
      parkGateOpen: false,
      stickers: defaultStickers(),
    };
    const up = walkFrames(start, (now) => heldWalkTarget(now, "up"), 20);
    const left = stepToward(start, heldWalkTarget(start, "left"), 200);
    const right = stepToward(start, heldWalkTarget(start, "right"), 200);
    expect(up.y).toBeGreaterThan(1700);
    expect(up.y).toBeLessThan(start.y);
    expect(left.x).toBeLessThan(start.x);
    expect(right.x).toBeGreaterThan(start.x);
    expect(dirFromKey("ArrowUp", "ArrowUp")).toBe("up");
    expect(dirFromKey("KeyW", "w")).toBe("up");
  });

  it("takes and shares a picnic without money or a timer", () => {
    const baker = takePicnic({ room: "bakery", carry: "", stickers: defaultStickers(), money: 4 });
    expect(baker.carry).toBe("picnic");
    expect(baker.money).toBeUndefined();
    expect(visibleActions({ ...baker, x: 200, y: 400, pose: "idle", actionBeatMs: 0, job: "none" }).some((action) => action.id === "take-picnic")).toBe(false);
    const shared = sharePicnic({ ...baker, room: "town", x: 1180, y: 1860 });
    expect(shared.carry).toBe("");
    expect(shared.pose).toBe("eat");
    expect(shared.stickers.picnic).toBe(true);
    expect(shared.timer).toBeUndefined();
    expect(shared.score).toBeUndefined();
  });

  it("cheers with a nearby neighbor after a crossing", () => {
    const people = createPeople();
    const willow = people.find((person) => person.id === "willow");
    const next = cheerCrossing(people, "stones", willow.x, willow.y);
    expect(next.find((person) => person.id === "willow").line).toMatch(/hop/i);
    expect(next.find((person) => person.id === "willow").bubbleMs).toBe(2400);
  });

  it("persists stickers, the open gate, and a carried picnic", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    writeSave(api, {
      parkGateOpen: true,
      carry: "picnic",
      stickers: { gate: true, bridge: true, stones: false, picnic: true, cheer: true, score: 99 },
      money: 12,
    });
    const loaded = loadSave(api);
    expect(loaded.parkGateOpen).toBe(true);
    expect(loaded.carry).toBe("picnic");
    expect(loaded.stickers).toEqual({
      ...defaultStickers(),
      gate: true,
      bridge: true,
      picnic: true,
      cheer: true,
    });
    expect(loaded.stickers.score).toBeUndefined();
    expect(loaded.money).toBeUndefined();
    const player = spawnPlayer(loaded);
    expect(player.parkGateOpen).toBe(true);
    expect(player.carry).toBe("picnic");
  });

  it("shows crossing actions without hiding house or shop buttons", () => {
    const atGate = {
      room: "town",
      x: 930,
      y: 1694,
      pose: "idle",
      actionBeatMs: 0,
      job: "none",
      parkGateOpen: false,
      carry: "",
    };
    const ids = visibleActions(atGate).map((action) => action.id);
    expect(ids).toEqual(expect.arrayContaining(["open-gate", "stickers"]));
    expect(ids).not.toContain("close-gate");
    expect(ids).not.toContain("share-picnic");
    const atHouse = { room: "town", x: 480, y: 680, pose: "idle", actionBeatMs: 0, job: "none" };
    expect(visibleActions(atHouse).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door", "stickers"]),
    );
  });

  it("walks back to the house door after a park crossing", () => {
    let player = {
      room: "town",
      x: 840,
      y: 1720,
      pose: "idle",
      facing: 1,
      actionBeatMs: 0,
      parkGateOpen: true,
      stickers: defaultStickers(),
    };
    player = walkFrames(player, (now) => heldWalkTarget(now, "up"), 80);
    expect(player.y).toBeLessThan(1560);
    player = walkFrames(player, { x: 480, y: 720 }, 160);
    expect(isBlocked("town", player.x, player.y, { parkGateOpen: true })).toBe(false);
    expect(visibleActions({ ...player, pose: "idle", actionBeatMs: 0, job: "none" }).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door"]),
    );
    expect(canEnter("town", "living")).toBe(true);
    const inside = enterRoom(player, "living");
    expect(inside.room).toBe("living");
    expect(visibleActions({ ...inside, x: 500, y: 400, pose: "idle", actionBeatMs: 0, job: "none" }).map((action) => action.id)).toEqual(
      expect.arrayContaining(["go-outside", "open-closet", "to-kitchen", "to-bedroom"]),
    );
  });
});

describe("town crossings", () => {
  const extrasCartOut = { bookCartOut: true };
  const extrasCartAside = { bookCartOut: false };

  function walkFrames(player, target, frames = 48) {
    let next = player;
    for (let i = 0; i < frames; i += 1) {
      next = stepToward(next, typeof target === "function" ? target(next) : target, 40);
    }
    return next;
  }

  function townKid(x, y, extra = {}) {
    return {
      room: "town",
      x,
      y,
      pose: "idle",
      facing: 1,
      actionBeatMs: 0,
      parkGateOpen: true,
      bookCartOut: true,
      carry: "",
      stickers: defaultStickers(),
      ...extra,
    };
  }

  it("blocks hedges, flower beds, puddles, and hopscotch dirt but not the paths", () => {
    expect(blockedByHedge(900, 634)).toBe(true);
    expect(isBlocked("town", 900, 634)).toBe(true);
    expect(onHedgeArch(1056, 634)).toBe(true);
    expect(isBlocked("town", 1056, 634)).toBe(false);
    expect(blockedByFlowerBed(1380, 640)).toBe(true);
    expect(onFlowerPad(1450, 662)).toBe(true);
    expect(isBlocked("town", 1450, 662)).toBe(false);
    expect(blockedByPuddle(140, 1170)).toBe(true);
    expect(onPlank(224, 1170)).toBe(true);
    expect(isBlocked("town", 224, 1170)).toBe(false);
    expect(blockedByHopscotch(2000, 1490)).toBe(true);
    expect(onHopscotch(2048, 1490)).toBe(true);
    expect(isBlocked("town", 2048, 1490)).toBe(false);
    expect(blockedByStreamers(1718, 1280)).toBe(true);
    expect(onRibbonGap(1806, 1248)).toBe(true);
    expect(isBlocked("town", 1806, 1248)).toBe(false);
  });

  it("blocks the library cart until the kid nudges it aside", () => {
    expect(blockedByCart(514, 1400, true)).toBe(true);
    expect(isBlocked("town", 514, 1400, extrasCartOut)).toBe(true);
    expect(isBlocked("town", 514, 1400, extrasCartAside)).toBe(false);
    const pushed = pushBookCart({ bookCartOut: true, stickers: defaultStickers() });
    expect(pushed.bookCartOut).toBe(false);
    expect(pushed.stickers.cart).toBe(true);
    expect(pushed.score).toBeUndefined();
    expect(nudgeBookCart(pushed).bookCartOut).toBe(true);
  });

  it("walks the hedge arch and earns a sticker without a fail state", () => {
    const start = townKid(1056, 608);
    const player = walkFrames(start, (now) => heldWalkTarget(now, "down"));
    expect(player.y).toBeGreaterThan(648);
    expect(player.stickers.hedge).toBe(true);
    expect(player.money).toBeUndefined();
    expect(newSticker(start.stickers, player.stickers)).toBe("hedge");
  });

  it("hops flower pads and cafe hopscotch, then stops on dirt instead of punishing", () => {
    let player = townKid(1450, 600);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(708);
    expect(player.stickers.flowers).toBe(true);
    expect(player.timer).toBeUndefined();

    player = townKid(2048, 1440);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(1528);
    expect(player.stickers.hopscotch).toBe(true);

    const bump = stepToward(townKid(1380, 600), { x: 1380, y: 720 }, 80);
    expect(bump.y).toBeLessThan(618);
    expect(bump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 1380, 640)).toBe(true);
  });

  it("walks mural ribbons and the bakery puddle plank", () => {
    let player = townKid(1806, 1200);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(1260);
    expect(player.stickers.ribbons).toBe(true);

    player = townKid(224, 1124);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(1212);
    expect(player.stickers.puddle).toBe(true);
    expect(player.needs).toBeUndefined();
  });

  it("takes and shares a library book without money or a timer", () => {
    const reader = takeBook({ room: "library", carry: "", stickers: defaultStickers(), money: 3 });
    expect(reader.carry).toBe("book");
    expect(reader.money).toBeUndefined();
    expect(
      visibleActions({ ...reader, room: "library", x: 200, y: 400, pose: "idle", actionBeatMs: 0, job: "none" }).some(
        (action) => action.id === "take-book",
      ),
    ).toBe(false);
    const shared = shareBook({ ...reader, room: "town", x: 1010, y: 612 });
    expect(shared.carry).toBe("");
    expect(shared.pose).toBe("look");
    expect(shared.stickers.book).toBe(true);
    expect(shared.timer).toBeUndefined();
    expect(shared.score).toBeUndefined();
    expect(takePicnic({ ...reader, carry: "book" }).carry).toBe("book");
  });

  it("cheers a nearby neighbor after a town crossing", () => {
    const people = createPeople();
    const theo = people.find((person) => person.id === "theo");
    const next = cheerCrossing(people, "cart", theo.x, theo.y);
    expect(next.find((person) => person.id === "theo").line).toMatch(/cart/i);
    expect(next.find((person) => person.id === "theo").bubbleMs).toBe(2400);
  });

  it("persists town stickers, the nudged cart, and a carried book", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    writeSave(api, {
      bookCartOut: false,
      carry: "book",
      stickers: { hedge: true, flowers: true, cart: true, book: true, coins: 4 },
      money: 9,
    });
    const loaded = loadSave(api);
    expect(loaded.bookCartOut).toBe(false);
    expect(loaded.carry).toBe("book");
    expect(loaded.stickers.hedge).toBe(true);
    expect(loaded.stickers.flowers).toBe(true);
    expect(loaded.stickers.cart).toBe(true);
    expect(loaded.stickers.book).toBe(true);
    expect(loaded.stickers.coins).toBeUndefined();
    expect(loaded.money).toBeUndefined();
    const player = spawnPlayer(loaded);
    expect(player.bookCartOut).toBe(false);
    expect(player.carry).toBe("book");
  });

  it("shows cart and book actions without hiding house or shop buttons", () => {
    const atCart = townKid(514, 1400, { pose: "idle", job: "none" });
    const ids = visibleActions(atCart).map((action) => action.id);
    expect(ids).toEqual(expect.arrayContaining(["push-cart", "take-book", "stickers"]));
    expect(ids).not.toContain("nudge-cart");
    expect(ids).not.toContain("share-book");
    const atHouse = { room: "town", x: 480, y: 680, pose: "idle", actionBeatMs: 0, job: "none" };
    expect(visibleActions(atHouse).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door", "stickers"]),
    );
    const withBook = townKid(1056, 608, { carry: "book", pose: "idle", job: "none" });
    expect(visibleActions(withBook).map((action) => action.id)).toEqual(
      expect.arrayContaining(["share-book", "stickers"]),
    );
    expect(isBlocked("town", BOOK_SPOT.x, BOOK_SPOT.y)).toBe(false);
  });

  it("keeps the house and shop paths open around the new crossings", () => {
    let player = townKid(560, 920);
    player = walkFrames(player, { x: 460, y: 980 }, 80);
    expect(isBlocked("town", player.x, player.y)).toBe(false);
    expect(player.x).toBeLessThan(520);
    player = walkFrames(player, { x: 480, y: 720 }, 120);
    expect(visibleActions({ ...player, pose: "idle", actionBeatMs: 0, job: "none" }).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door"]),
    );
    expect(canEnter("town", "living")).toBe(true);
    expect(canEnter("town", "library")).toBe(true);
    expect(canEnter("town", "cafe")).toBe(true);
  });
});

describe("weekday crossings", () => {
  function walkFrames(player, target, frames = 48) {
    let next = player;
    for (let i = 0; i < frames; i += 1) {
      next = stepToward(next, typeof target === "function" ? target(next) : target, 40);
    }
    return next;
  }

  function townKid(x, y, extra = {}) {
    return {
      room: "town",
      x,
      y,
      pose: "idle",
      facing: 1,
      actionBeatMs: 0,
      parkGateOpen: true,
      bookCartOut: true,
      carry: "",
      stickers: defaultStickers(),
      ...extra,
    };
  }

  it("blocks crate dirt, flour, pond water, clothes, and cones but not the walk paths", () => {
    expect(blockedByCrates(1520, 1000)).toBe(true);
    expect(isBlocked("town", 1520, 1000)).toBe(true);
    expect(onCrate(1596, 1012)).toBe(true);
    expect(isBlocked("town", 1596, 1012)).toBe(false);
    expect(blockedByFlour(560, 1100)).toBe(true);
    expect(onFlourSack(632, 1110)).toBe(true);
    expect(isBlocked("town", 632, 1110)).toBe(false);
    expect(blockedByPond(1360, 1920)).toBe(true);
    expect(onLily(1422, 1921)).toBe(true);
    expect(isBlocked("town", 1422, 1921)).toBe(false);
    expect(blockedByClothesline(732, 500)).toBe(true);
    expect(onLineGap(794, 468)).toBe(true);
    expect(isBlocked("town", 794, 468)).toBe(false);
    expect(blockedByCones(1754, 1760)).toBe(true);
    expect(onConeLane(1788, 1760)).toBe(true);
    expect(isBlocked("town", 1788, 1760)).toBe(false);
    expect(isBlocked("town", 1700, 1760)).toBe(false);
  });

  it("walks crate steps, flour sacks, and lily pads and earns stickers", () => {
    let player = townKid(1596, 956);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(1056);
    expect(player.stickers.crates).toBe(true);
    expect(player.money).toBeUndefined();
    expect(newSticker(defaultStickers(), player.stickers)).toBe("crates");

    player = townKid(632, 1052);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(1152);
    expect(player.stickers.flour).toBe(true);

    player = townKid(1422, 1868);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(1960);
    expect(player.stickers.lilies).toBe(true);
    expect(player.timer).toBeUndefined();
  });

  it("walks the clothesline gap and the cone weave without a fail state", () => {
    let player = townKid(794, 440);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(482);
    expect(player.stickers.line).toBe(true);

    player = townKid(1788, 1712);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(1792);
    expect(player.stickers.cones).toBe(true);
    expect(player.needs).toBeUndefined();
  });

  it("lets tap-to-walk stop at crate dirt and pond water instead of punishing", () => {
    const crateBump = stepToward(townKid(1520, 950), { x: 1520, y: 1060 }, 80);
    expect(crateBump.y).toBeLessThan(968);
    expect(crateBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 1520, 1000)).toBe(true);

    const pondBump = stepToward(townKid(1360, 1860), { x: 1360, y: 1960 }, 80);
    expect(pondBump.y).toBeLessThan(1882);
    expect(pondBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 1360, 1920)).toBe(true);
  });

  it("takes and shares a postcard without money or a timer", () => {
    const helper = takeCard({ room: "town", carry: "", stickers: defaultStickers(), money: 2 });
    expect(helper.carry).toBe("card");
    expect(helper.money).toBeUndefined();
    expect(
      visibleActions({ ...helper, x: 320, y: 690, pose: "idle", actionBeatMs: 0, job: "none" }).some(
        (action) => action.id === "take-card",
      ),
    ).toBe(false);
    const shared = shareCard({ ...helper, room: "town", x: MAIL_SPOT.x, y: MAIL_SPOT.y });
    expect(shared.carry).toBe("");
    expect(shared.pose).toBe("look");
    expect(shared.stickers.card).toBe(true);
    expect(shared.timer).toBeUndefined();
    expect(shared.score).toBeUndefined();
    expect(takePicnic({ ...helper, carry: "card" }).carry).toBe("card");
    expect(takeBook({ ...helper, carry: "card" }).carry).toBe("card");
  });

  it("cheers a nearby neighbor after a weekday crossing", () => {
    const people = createPeople();
    const nia = people.find((person) => person.id === "nia");
    const next = cheerCrossing(people, "crates", nia.x, nia.y);
    expect(next.find((person) => person.id === "nia").line).toMatch(/crate/i);
    expect(next.find((person) => person.id === "nia").bubbleMs).toBe(2400);
  });

  it("persists weekday stickers and a carried postcard", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    writeSave(api, {
      carry: "card",
      stickers: { crates: true, flour: true, lilies: true, line: true, cones: true, card: true, coins: 8 },
      money: 5,
    });
    const loaded = loadSave(api);
    expect(loaded.carry).toBe("card");
    expect(loaded.stickers.crates).toBe(true);
    expect(loaded.stickers.flour).toBe(true);
    expect(loaded.stickers.lilies).toBe(true);
    expect(loaded.stickers.line).toBe(true);
    expect(loaded.stickers.cones).toBe(true);
    expect(loaded.stickers.card).toBe(true);
    expect(loaded.stickers.coins).toBeUndefined();
    expect(loaded.money).toBeUndefined();
    const player = spawnPlayer(loaded);
    expect(player.carry).toBe("card");
  });

  it("shows postcard actions without hiding house or shop buttons", () => {
    const atMail = townKid(320, 690, { pose: "idle", job: "none" });
    const ids = visibleActions(atMail).map((action) => action.id);
    expect(ids).toEqual(expect.arrayContaining(["take-card", "stickers"]));
    expect(ids).not.toContain("share-card");
    const atHouse = { room: "town", x: 480, y: 680, pose: "idle", actionBeatMs: 0, job: "none" };
    expect(visibleActions(atHouse).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door", "stickers"]),
    );
    const withCard = townKid(MAIL_SPOT.x, MAIL_SPOT.y, { carry: "card", pose: "idle", job: "none" });
    expect(visibleActions(withCard).map((action) => action.id)).toEqual(
      expect.arrayContaining(["share-card", "stickers"]),
    );
    expect(isBlocked("town", MAIL_SPOT.x, MAIL_SPOT.y)).toBe(false);
  });

  it("keeps the house, bakery, and cafe paths open around the new crossings", () => {
    let player = townKid(560, 920);
    player = walkFrames(player, { x: 460, y: 980 }, 80);
    expect(isBlocked("town", player.x, player.y)).toBe(false);
    expect(player.x).toBeLessThan(520);
    player = walkFrames(player, { x: 480, y: 720 }, 120);
    expect(visibleActions({ ...player, pose: "idle", actionBeatMs: 0, job: "none" }).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door"]),
    );
    expect(canEnter("town", "living")).toBe(true);
    expect(canEnter("town", "bakery")).toBe(true);
    expect(canEnter("town", "cafe")).toBe(true);
    expect(isBlocked("town", 1920, 1320)).toBe(false);
    expect(isBlocked("town", 840, 1610)).toBe(false);
  });
});

describe("save and sit", () => {
  it("round-trips looks and job without scores", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    writeSave(api, { houseColor: "sky", doorLabel: "Nest", skin: "honey", hair: "blonde", outfit: { hat: "cap" }, job: "librarian" });
    const loaded = loadSave(api);
    expect(loaded.houseColor).toBe("sky");
    expect(loaded.job).toBe("librarian");
    expect(loaded.doorLabel).toBe("Nest");
  });

  it("starts sit eat sleep without timers", () => {
    const sitting = startFurniture({ x: 1, y: 1 }, "sofa");
    expect(sitting.pose).toBe("sit");
    expect(sitting.actionBeatMs).toBe(1100);
    expect(sitting.hunger).toBeUndefined();
  });
});
