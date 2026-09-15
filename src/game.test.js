import { describe, expect, it } from "vitest";
import {
  blockedByCart,
  blockedByChalk,
  blockedByClothesline,
  blockedByCones,
  blockedByCrates,
  blockedByFlour,
  blockedByFlowerBed,
  blockedByFountain,
  blockedByHedge,
  blockedByHopscotch,
  blockedByPond,
  blockedByPuddle,
  blockedBySandbox,
  blockedByStreamers,
  blockedBySwing,
  blockedByAwning,
  blockedByBalloons,
  blockedByBaskets,
  blockedByBenches,
  blockedByHose,
  blockedByLogs,
  blockedByPorch,
  blockedByRoots,
  blockedByStumps,
  blockedByTires,
  blockedByTrellis,
  blockedByWater,
  blockedByMailboxes,
  blockedByPicket,
  blockedByRim,
  blockedBySwirl,
  blockedByWet,
  BOOK_SPOT,
  cheerCrossing,
  closeParkGate,
  defaultStickers,
  FLOWER_SPOT,
  LEAF_SPOT,
  MAIL_SPOT,
  BALLOON_SPOT,
  newSticker,
  nudgeBookCart,
  onAwningGap,
  onBalloonGap,
  onBasketLane,
  onBenchLane,
  onBridge,
  onChalk,
  onConeLane,
  onCrate,
  onFlourSack,
  onFlowerPad,
  onFountainPad,
  onHedgeArch,
  onHopscotch,
  onHoseLane,
  onLog,
  onLily,
  onLineGap,
  onPlank,
  onPorchGap,
  onRibbonGap,
  onRoot,
  onSandboxMound,
  onStone,
  onStump,
  onSwingGap,
  onTire,
  onTrellisGap,
  onMailboxLane,
  onPicketGap,
  onSandRim,
  onSwirl,
  onWetStone,
  openParkGate,
  pushBookCart,
  shareBalloon,
  shareBook,
  shareCard,
  shareFlower,
  shareLeaf,
  sharePicnic,
  shareSnack,
  SNACK_SPOT,
  takeBook,
  takeCard,
  takeFlower,
  takeBalloon,
  takeLeaf,
  takePicnic,
  takeSnack,
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
    expect(isBlocked("town", 1610, 720)).toBe(false);
    expect(blockedByFlowerBed(1610, 720)).toBe(false);
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

describe("tuesday crossings", () => {
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

  it("blocks fountain water, chalk dirt, balloons, sandbox, and swing posts but not the walk paths", () => {
    expect(blockedByFountain(1148, 1320)).toBe(true);
    expect(isBlocked("town", 1148, 1320)).toBe(true);
    expect(onFountainPad(1180, 1322)).toBe(true);
    expect(isBlocked("town", 1180, 1322)).toBe(false);
    expect(blockedByChalk(1600, 548)).toBe(true);
    expect(onChalk(1640, 554)).toBe(true);
    expect(isBlocked("town", 1640, 554)).toBe(false);
    expect(blockedByBalloons(1832, 1440)).toBe(true);
    expect(onBalloonGap(1892, 1428)).toBe(true);
    expect(isBlocked("town", 1892, 1428)).toBe(false);
    expect(blockedBySandbox(1920, 1960)).toBe(true);
    expect(onSandboxMound(1992, 1964)).toBe(true);
    expect(isBlocked("town", 1992, 1964)).toBe(false);
    expect(blockedBySwing(1204, 1960)).toBe(true);
    expect(onSwingGap(1264, 1944)).toBe(true);
    expect(isBlocked("town", 1264, 1944)).toBe(false);
    expect(isBlocked("town", 1760, 1420)).toBe(false);
  });

  it("walks fountain pads, chalk zig-zag, and sandbox mounds and earns stickers", () => {
    let player = townKid(1180, 1284);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(1348);
    expect(player.stickers.fountain).toBe(true);
    expect(player.money).toBeUndefined();
    expect(newSticker(defaultStickers(), player.stickers)).toBe("fountain");

    player = townKid(1640, 492);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 44);
    expect(player.y).toBeGreaterThan(624);
    expect(player.stickers.zigzag).toBe(true);

    player = townKid(1992, 1908);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(2008);
    expect(player.stickers.sandbox).toBe(true);
    expect(player.timer).toBeUndefined();
  });

  it("walks the balloon arch and swing path without a fail state", () => {
    let player = townKid(1892, 1392);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(1434);
    expect(player.stickers.balloons).toBe(true);

    player = townKid(1264, 1916);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(1958);
    expect(player.stickers.swing).toBe(true);
    expect(player.needs).toBeUndefined();
  });

  it("lets tap-to-walk stop at fountain water and sandbox dirt instead of punishing", () => {
    const fountainBump = stepToward(townKid(1148, 1280), { x: 1148, y: 1360 }, 80);
    expect(fountainBump.y).toBeLessThan(1296);
    expect(fountainBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 1148, 1320)).toBe(true);

    const sandBump = stepToward(townKid(1920, 1908), { x: 1920, y: 2010 }, 80);
    expect(sandBump.y).toBeLessThan(1920);
    expect(sandBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 1920, 1960)).toBe(true);
  });

  it("takes and shares a snack without money or a timer", () => {
    const helper = takeSnack({ room: "cafe", carry: "", stickers: defaultStickers(), money: 2 });
    expect(helper.carry).toBe("snack");
    expect(helper.money).toBeUndefined();
    expect(
      visibleActions({ ...helper, room: "cafe", x: 200, y: 400, pose: "idle", actionBeatMs: 0, job: "none" }).some(
        (action) => action.id === "take-snack",
      ),
    ).toBe(false);
    const shared = shareSnack({ ...helper, room: "town", x: SNACK_SPOT.x, y: SNACK_SPOT.y });
    expect(shared.carry).toBe("");
    expect(shared.pose).toBe("eat");
    expect(shared.stickers.snack).toBe(true);
    expect(shared.timer).toBeUndefined();
    expect(shared.score).toBeUndefined();
    expect(takePicnic({ ...helper, carry: "snack" }).carry).toBe("snack");
    expect(takeCard({ ...helper, carry: "snack" }).carry).toBe("snack");
  });

  it("cheers a nearby neighbor after a tuesday crossing", () => {
    const people = createPeople();
    const otto = people.find((person) => person.id === "otto");
    const next = cheerCrossing(people, "fountain", otto.x, otto.y);
    expect(next.find((person) => person.id === "otto").line).toMatch(/bubbly|fountain/i);
    expect(next.find((person) => person.id === "otto").bubbleMs).toBe(2400);
  });

  it("persists tuesday stickers and a carried snack", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    writeSave(api, {
      carry: "snack",
      stickers: { fountain: true, zigzag: true, balloons: true, sandbox: true, swing: true, snack: true, coins: 8 },
      money: 5,
    });
    const loaded = loadSave(api);
    expect(loaded.carry).toBe("snack");
    expect(loaded.stickers.fountain).toBe(true);
    expect(loaded.stickers.zigzag).toBe(true);
    expect(loaded.stickers.balloons).toBe(true);
    expect(loaded.stickers.sandbox).toBe(true);
    expect(loaded.stickers.swing).toBe(true);
    expect(loaded.stickers.snack).toBe(true);
    expect(loaded.stickers.coins).toBeUndefined();
    expect(loaded.money).toBeUndefined();
    const player = spawnPlayer(loaded);
    expect(player.carry).toBe("snack");
  });

  it("shows snack actions without hiding house or shop buttons", () => {
    const atCafe = townKid(1920, 1320, { pose: "idle", job: "none" });
    const ids = visibleActions(atCafe).map((action) => action.id);
    expect(ids).toEqual(expect.arrayContaining(["take-snack", "stickers"]));
    expect(ids).not.toContain("share-snack");
    const atHouse = { room: "town", x: 480, y: 680, pose: "idle", actionBeatMs: 0, job: "none" };
    expect(visibleActions(atHouse).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door", "stickers"]),
    );
    const withSnack = townKid(SNACK_SPOT.x, SNACK_SPOT.y, { carry: "snack", pose: "idle", job: "none" });
    expect(visibleActions(withSnack).map((action) => action.id)).toEqual(
      expect.arrayContaining(["share-snack", "stickers"]),
    );
    expect(isBlocked("town", SNACK_SPOT.x, SNACK_SPOT.y)).toBe(false);
    expect(isBlocked("town", 1920, 1320)).toBe(false);
    expect(isBlocked("town", 1180, 1280)).toBe(false);
  });

  it("keeps the house, cafe, and park paths open around the new crossings", () => {
    let player = townKid(560, 920);
    player = walkFrames(player, { x: 460, y: 980 }, 80);
    expect(isBlocked("town", player.x, player.y)).toBe(false);
    player = walkFrames(player, { x: 480, y: 720 }, 120);
    expect(visibleActions({ ...player, pose: "idle", actionBeatMs: 0, job: "none" }).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door"]),
    );
    expect(canEnter("town", "living")).toBe(true);
    expect(canEnter("town", "cafe")).toBe(true);
    expect(canEnter("town", "bakery")).toBe(true);
    expect(isBlocked("town", 1920, 1320)).toBe(false);
    expect(isBlocked("town", 840, 1610)).toBe(false);
    expect(isBlocked("town", 1280, 1940)).toBe(false);
    expect(isBlocked("town", 1806, 1248)).toBe(false);
  });
});

describe("wednesday crossings", () => {
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

  it("blocks tire dirt, mud, benches, awning poles, and trellis but not the walk paths", () => {
    expect(blockedByTires(1700, 2070)).toBe(true);
    expect(isBlocked("town", 1700, 2070)).toBe(true);
    expect(onTire(1776, 2082)).toBe(true);
    expect(isBlocked("town", 1776, 2082)).toBe(false);
    expect(blockedByLogs(540, 1950)).toBe(true);
    expect(onLog(608, 1962)).toBe(true);
    expect(isBlocked("town", 608, 1962)).toBe(false);
    expect(blockedByBenches(2174, 788)).toBe(true);
    expect(onBenchLane(2208, 788)).toBe(true);
    expect(isBlocked("town", 2208, 788)).toBe(false);
    expect(blockedByAwning(444, 1230)).toBe(true);
    expect(onAwningGap(504, 1220)).toBe(true);
    expect(isBlocked("town", 504, 1220)).toBe(false);
    expect(blockedByTrellis(1170, 460)).toBe(true);
    expect(onTrellisGap(1211, 448)).toBe(true);
    expect(isBlocked("town", 1211, 448)).toBe(false);
    expect(isBlocked("town", 2080, 788)).toBe(false);
  });

  it("walks tire hops, log steps, and the bench weave and earns stickers", () => {
    let player = townKid(1776, 2028);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(2124);
    expect(player.stickers.tires).toBe(true);
    expect(player.money).toBeUndefined();
    expect(newSticker(defaultStickers(), player.stickers)).toBe("tires");

    player = townKid(608, 1908);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(2004);
    expect(player.stickers.logs).toBe(true);

    player = townKid(2208, 740);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(820);
    expect(player.stickers.benches).toBe(true);
    expect(player.timer).toBeUndefined();
  });

  it("walks the shop awning and garden trellis without a fail state", () => {
    let player = townKid(504, 1180);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(1226);
    expect(player.stickers.awning).toBe(true);

    player = townKid(1211, 416);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(462);
    expect(player.stickers.trellis).toBe(true);
    expect(player.needs).toBeUndefined();
  });

  it("lets tap-to-walk stop at tire dirt and mud instead of punishing", () => {
    const tireBump = stepToward(townKid(1700, 2028), { x: 1700, y: 2140 }, 80);
    expect(tireBump.y).toBeLessThan(2040);
    expect(tireBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 1700, 2070)).toBe(true);

    const mudBump = stepToward(townKid(540, 1908), { x: 540, y: 2020 }, 80);
    expect(mudBump.y).toBeLessThan(1920);
    expect(mudBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 540, 1950)).toBe(true);
  });

  it("takes and shares a flower without money or a timer", () => {
    const helper = takeFlower({ room: "town", carry: "", stickers: defaultStickers(), money: 2 });
    expect(helper.carry).toBe("flower");
    expect(helper.money).toBeUndefined();
    expect(
      visibleActions({ ...helper, x: 1200, y: 580, pose: "idle", actionBeatMs: 0, job: "none" }).some(
        (action) => action.id === "take-flower",
      ),
    ).toBe(false);
    const shared = shareFlower({ ...helper, room: "town", x: FLOWER_SPOT.x, y: FLOWER_SPOT.y });
    expect(shared.carry).toBe("");
    expect(shared.pose).toBe("look");
    expect(shared.stickers.bloom).toBe(true);
    expect(shared.timer).toBeUndefined();
    expect(shared.score).toBeUndefined();
    expect(takePicnic({ ...helper, carry: "flower" }).carry).toBe("flower");
    expect(takeSnack({ ...helper, carry: "flower" }).carry).toBe("flower");
  });

  it("cheers a nearby neighbor after a wednesday crossing", () => {
    const people = createPeople();
    const willow = people.find((person) => person.id === "willow");
    const next = cheerCrossing(people, "bloom", willow.x, willow.y);
    expect(next.find((person) => person.id === "willow").line).toMatch(/flower|fountain/i);
    expect(next.find((person) => person.id === "willow").bubbleMs).toBe(2400);
  });

  it("persists wednesday stickers and a carried flower", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    writeSave(api, {
      carry: "flower",
      stickers: { tires: true, logs: true, benches: true, awning: true, trellis: true, bloom: true, coins: 8 },
      money: 5,
    });
    const loaded = loadSave(api);
    expect(loaded.carry).toBe("flower");
    expect(loaded.stickers.tires).toBe(true);
    expect(loaded.stickers.logs).toBe(true);
    expect(loaded.stickers.benches).toBe(true);
    expect(loaded.stickers.awning).toBe(true);
    expect(loaded.stickers.trellis).toBe(true);
    expect(loaded.stickers.bloom).toBe(true);
    expect(loaded.stickers.coins).toBeUndefined();
    expect(loaded.money).toBeUndefined();
    const player = spawnPlayer(loaded);
    expect(player.carry).toBe("flower");
  });

  it("shows flower actions without hiding house or shop buttons", () => {
    const atGarden = townKid(1200, 580, { pose: "idle", job: "none" });
    const ids = visibleActions(atGarden).map((action) => action.id);
    expect(ids).toEqual(expect.arrayContaining(["take-flower", "stickers"]));
    expect(ids).not.toContain("share-flower");
    const atHouse = { room: "town", x: 480, y: 680, pose: "idle", actionBeatMs: 0, job: "none" };
    expect(visibleActions(atHouse).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door", "stickers"]),
    );
    const withFlower = townKid(FLOWER_SPOT.x, FLOWER_SPOT.y, { carry: "flower", pose: "idle", job: "none" });
    expect(visibleActions(withFlower).map((action) => action.id)).toEqual(
      expect.arrayContaining(["share-flower", "stickers"]),
    );
    expect(isBlocked("town", FLOWER_SPOT.x, FLOWER_SPOT.y)).toBe(false);
    expect(isBlocked("town", 1200, 580)).toBe(false);
    expect(isBlocked("town", 480, 660)).toBe(false);
  });

  it("keeps the house, shop, and park paths open around the new crossings", () => {
    let player = townKid(560, 920);
    player = walkFrames(player, { x: 460, y: 980 }, 80);
    expect(isBlocked("town", player.x, player.y)).toBe(false);
    player = walkFrames(player, { x: 480, y: 720 }, 120);
    expect(visibleActions({ ...player, pose: "idle", actionBeatMs: 0, job: "none" }).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door"]),
    );
    expect(canEnter("town", "living")).toBe(true);
    expect(canEnter("town", "cafe")).toBe(true);
    expect(canEnter("town", "bakery")).toBe(true);
    expect(canEnter("town", "library")).toBe(true);
    expect(isBlocked("town", 1920, 1320)).toBe(false);
    expect(isBlocked("town", 420, 980)).toBe(false);
    expect(isBlocked("town", 420, 1400)).toBe(false);
    expect(isBlocked("town", 840, 1610)).toBe(false);
    expect(isBlocked("town", 1280, 1940)).toBe(false);
    expect(isBlocked("town", 1180, 1322)).toBe(false);
  });
});

describe("thursday crossings", () => {
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

  it("blocks root dirt, stump dirt, hose coils, porch rails, and baskets but not the walk paths", () => {
    expect(blockedByRoots(1020, 2030)).toBe(true);
    expect(isBlocked("town", 1020, 2030)).toBe(true);
    expect(onRoot(1096, 2034)).toBe(true);
    expect(isBlocked("town", 1096, 2034)).toBe(false);
    expect(blockedByStumps(1528, 2004)).toBe(true);
    expect(onStump(1586, 2058)).toBe(true);
    expect(isBlocked("town", 1586, 2058)).toBe(false);
    expect(blockedByHose(1758, 660)).toBe(true);
    expect(onHoseLane(1792, 660)).toBe(true);
    expect(isBlocked("town", 1792, 660)).toBe(false);
    expect(blockedByPorch(452, 1330)).toBe(true);
    expect(onPorchGap(498, 1332)).toBe(true);
    expect(isBlocked("town", 498, 1332)).toBe(false);
    expect(blockedByBaskets(1754, 1000)).toBe(true);
    expect(onBasketLane(1788, 1000)).toBe(true);
    expect(isBlocked("town", 1788, 1000)).toBe(false);
    expect(isBlocked("town", 1680, 660)).toBe(false);
  });

  it("walks root hops, stump pads, and the hose weave and earns stickers", () => {
    let player = townKid(1096, 1980);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 40);
    expect(player.y).toBeGreaterThan(2076);
    expect(player.stickers.roots).toBe(true);
    expect(player.money).toBeUndefined();
    expect(newSticker(defaultStickers(), player.stickers)).toBe("roots");

    player = townKid(1586, 1976);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 44);
    expect(player.y).toBeGreaterThan(2128);
    expect(player.stickers.stumps).toBe(true);

    player = townKid(1792, 612);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(692);
    expect(player.stickers.hose).toBe(true);
    expect(player.timer).toBeUndefined();
  });

  it("walks the library porch and market baskets without a fail state", () => {
    let player = townKid(498, 1292);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(1338);
    expect(player.stickers.porch).toBe(true);

    player = townKid(1788, 952);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(1032);
    expect(player.stickers.baskets).toBe(true);
    expect(player.needs).toBeUndefined();
  });

  it("lets tap-to-walk stop at root dirt and stump dirt instead of punishing", () => {
    const rootBump = stepToward(townKid(1020, 1980), { x: 1020, y: 2090 }, 80);
    expect(rootBump.y).toBeLessThan(1992);
    expect(rootBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 1020, 2030)).toBe(true);

    const stumpBump = stepToward(townKid(1528, 1976), { x: 1528, y: 2140 }, 80);
    expect(stumpBump.y).toBeLessThan(1988);
    expect(stumpBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 1528, 2004)).toBe(true);
  });

  it("takes and shares a leaf without money or a timer", () => {
    const helper = takeLeaf({ room: "town", carry: "", stickers: defaultStickers(), money: 2 });
    expect(helper.carry).toBe("leaf");
    expect(helper.money).toBeUndefined();
    expect(
      visibleActions({ ...helper, x: 1472, y: 1784, pose: "idle", actionBeatMs: 0, job: "none" }).some(
        (action) => action.id === "take-leaf",
      ),
    ).toBe(false);
    const shared = shareLeaf({ ...helper, room: "town", x: LEAF_SPOT.x, y: LEAF_SPOT.y });
    expect(shared.carry).toBe("");
    expect(shared.pose).toBe("look");
    expect(shared.stickers.leaf).toBe(true);
    expect(shared.timer).toBeUndefined();
    expect(shared.score).toBeUndefined();
    expect(takePicnic({ ...helper, carry: "leaf" }).carry).toBe("leaf");
    expect(takeFlower({ ...helper, carry: "leaf" }).carry).toBe("leaf");
  });

  it("cheers a nearby neighbor after a thursday crossing", () => {
    const people = createPeople();
    const pip = people.find((person) => person.id === "pip");
    const next = cheerCrossing(people, "leaf", pip.x, pip.y);
    expect(next.find((person) => person.id === "pip").line).toMatch(/leaf|colorful/i);
    expect(next.find((person) => person.id === "pip").bubbleMs).toBe(2400);
  });

  it("persists thursday stickers and a carried leaf", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    writeSave(api, {
      carry: "leaf",
      stickers: { roots: true, stumps: true, hose: true, porch: true, baskets: true, leaf: true, coins: 8 },
      money: 5,
    });
    const loaded = loadSave(api);
    expect(loaded.carry).toBe("leaf");
    expect(loaded.stickers.roots).toBe(true);
    expect(loaded.stickers.stumps).toBe(true);
    expect(loaded.stickers.hose).toBe(true);
    expect(loaded.stickers.porch).toBe(true);
    expect(loaded.stickers.baskets).toBe(true);
    expect(loaded.stickers.leaf).toBe(true);
    expect(loaded.stickers.coins).toBeUndefined();
    expect(loaded.money).toBeUndefined();
    const player = spawnPlayer(loaded);
    expect(player.carry).toBe("leaf");
  });

  it("shows leaf actions without hiding house or shop buttons", () => {
    const atTree = townKid(1472, 1784, { pose: "idle", job: "none" });
    const ids = visibleActions(atTree).map((action) => action.id);
    expect(ids).toEqual(expect.arrayContaining(["take-leaf", "stickers"]));
    expect(ids).not.toContain("share-leaf");
    const atHouse = { room: "town", x: 480, y: 680, pose: "idle", actionBeatMs: 0, job: "none" };
    expect(visibleActions(atHouse).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door", "stickers"]),
    );
    const withLeaf = townKid(LEAF_SPOT.x, LEAF_SPOT.y, { carry: "leaf", pose: "idle", job: "none" });
    expect(visibleActions(withLeaf).map((action) => action.id)).toEqual(
      expect.arrayContaining(["share-leaf", "stickers"]),
    );
    expect(isBlocked("town", LEAF_SPOT.x, LEAF_SPOT.y)).toBe(false);
    expect(isBlocked("town", 1472, 1784)).toBe(false);
    expect(isBlocked("town", 480, 660)).toBe(false);
  });

  it("keeps the house, shop, and park paths open around the new crossings", () => {
    let player = townKid(560, 920);
    player = walkFrames(player, { x: 460, y: 980 }, 80);
    expect(isBlocked("town", player.x, player.y)).toBe(false);
    player = walkFrames(player, { x: 480, y: 720 }, 120);
    expect(visibleActions({ ...player, pose: "idle", actionBeatMs: 0, job: "none" }).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door"]),
    );
    expect(canEnter("town", "living")).toBe(true);
    expect(canEnter("town", "cafe")).toBe(true);
    expect(canEnter("town", "bakery")).toBe(true);
    expect(canEnter("town", "library")).toBe(true);
    expect(isBlocked("town", 1920, 1320)).toBe(false);
    expect(isBlocked("town", 420, 980)).toBe(false);
    expect(isBlocked("town", 420, 1400)).toBe(false);
    expect(isBlocked("town", 840, 1610)).toBe(false);
    expect(isBlocked("town", 1280, 1940)).toBe(false);
    expect(isBlocked("town", 1180, 1322)).toBe(false);
    expect(isBlocked("town", 1776, 2082)).toBe(false);
    expect(isBlocked("town", 1211, 448)).toBe(false);
  });
});

describe("friday crossings", () => {
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

  it("blocks swirl dirt, sandbox hole, pickets, puddle water, and mailboxes but not the walk paths", () => {
    expect(blockedBySwirl(900, 1240)).toBe(true);
    expect(isBlocked("town", 900, 1240)).toBe(true);
    expect(onSwirl(936, 1254)).toBe(true);
    expect(isBlocked("town", 936, 1254)).toBe(false);
    expect(blockedByRim(2188, 1820)).toBe(true);
    expect(isBlocked("town", 2188, 1820)).toBe(true);
    expect(onSandRim(2120, 1820)).toBe(true);
    expect(isBlocked("town", 2120, 1820)).toBe(false);
    expect(blockedByPicket(120, 692)).toBe(true);
    expect(onPicketGap(168, 700)).toBe(true);
    expect(isBlocked("town", 168, 700)).toBe(false);
    expect(blockedByWet(180, 1680)).toBe(true);
    expect(isBlocked("town", 180, 1680)).toBe(true);
    expect(onWetStone(262, 1688)).toBe(true);
    expect(isBlocked("town", 262, 1688)).toBe(false);
    expect(blockedByMailboxes(1802, 824)).toBe(true);
    expect(onMailboxLane(1837, 824)).toBe(true);
    expect(isBlocked("town", 1837, 824)).toBe(false);
    expect(isBlocked("town", 1700, 824)).toBe(false);
  });

  it("walks the chalk swirl, sandbox rim, and puddle stones and earns stickers", () => {
    let player = townKid(936, 1180);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 44);
    expect(player.y).toBeGreaterThan(1312);
    expect(player.stickers.swirl).toBe(true);
    expect(player.money).toBeUndefined();
    expect(newSticker(defaultStickers(), player.stickers)).toBe("swirl");

    player = townKid(2120, 1752);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 44);
    expect(player.y).toBeGreaterThan(1872);
    expect(player.stickers.rim).toBe(true);

    player = townKid(262, 1624);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 44);
    expect(player.y).toBeGreaterThan(1728);
    expect(player.stickers.splash).toBe(true);
    expect(player.timer).toBeUndefined();
  });

  it("walks the picket gap and mailbox weave without a fail state", () => {
    let player = townKid(168, 660);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(706);
    expect(player.stickers.picket).toBe(true);

    player = townKid(1837, 776);
    player = walkFrames(player, (now) => heldWalkTarget(now, "down"), 36);
    expect(player.y).toBeGreaterThan(856);
    expect(player.stickers.boxes).toBe(true);
    expect(player.needs).toBeUndefined();
  });

  it("lets tap-to-walk stop at swirl dirt and puddle water instead of punishing", () => {
    const swirlBump = stepToward(townKid(900, 1180), { x: 900, y: 1320 }, 80);
    expect(swirlBump.y).toBeLessThan(1196);
    expect(swirlBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 900, 1240)).toBe(true);

    const wetBump = stepToward(townKid(180, 1624), { x: 180, y: 1740 }, 80);
    expect(wetBump.y).toBeLessThan(1640);
    expect(wetBump.stickers).toEqual(defaultStickers());
    expect(isBlocked("town", 180, 1680)).toBe(true);
  });

  it("takes and shares a balloon without money or a timer", () => {
    const helper = takeBalloon({ room: "town", carry: "", stickers: defaultStickers(), money: 2 });
    expect(helper.carry).toBe("balloon");
    expect(helper.money).toBeUndefined();
    expect(
      visibleActions({ ...helper, x: 1760, y: 1328, pose: "idle", actionBeatMs: 0, job: "none" }).some(
        (action) => action.id === "take-balloon",
      ),
    ).toBe(false);
    const shared = shareBalloon({ ...helper, room: "town", x: BALLOON_SPOT.x, y: BALLOON_SPOT.y });
    expect(shared.carry).toBe("");
    expect(shared.pose).toBe("look");
    expect(shared.stickers.puff).toBe(true);
    expect(shared.timer).toBeUndefined();
    expect(shared.score).toBeUndefined();
    expect(takePicnic({ ...helper, carry: "balloon" }).carry).toBe("balloon");
    expect(takeLeaf({ ...helper, carry: "balloon" }).carry).toBe("balloon");
  });

  it("cheers a nearby neighbor after a friday crossing", () => {
    const people = createPeople();
    const bee = people.find((person) => person.id === "bee");
    const next = cheerCrossing(people, "puff", bee.x, bee.y);
    expect(next.find((person) => person.id === "bee").line).toMatch(/balloon|cheerful/i);
    expect(next.find((person) => person.id === "bee").bubbleMs).toBe(2400);
  });

  it("persists friday stickers and a carried balloon", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    writeSave(api, {
      carry: "balloon",
      stickers: { swirl: true, rim: true, picket: true, splash: true, boxes: true, puff: true, coins: 8 },
      money: 5,
    });
    const loaded = loadSave(api);
    expect(loaded.carry).toBe("balloon");
    expect(loaded.stickers.swirl).toBe(true);
    expect(loaded.stickers.rim).toBe(true);
    expect(loaded.stickers.picket).toBe(true);
    expect(loaded.stickers.splash).toBe(true);
    expect(loaded.stickers.boxes).toBe(true);
    expect(loaded.stickers.puff).toBe(true);
    expect(loaded.stickers.coins).toBeUndefined();
    expect(loaded.money).toBeUndefined();
    const player = spawnPlayer(loaded);
    expect(player.carry).toBe("balloon");
  });

  it("shows balloon actions without hiding house or shop buttons", () => {
    const atMural = townKid(1760, 1328, { pose: "idle", job: "none" });
    const ids = visibleActions(atMural).map((action) => action.id);
    expect(ids).toEqual(expect.arrayContaining(["take-balloon", "stickers"]));
    expect(ids).not.toContain("share-balloon");
    const atHouse = { room: "town", x: 480, y: 680, pose: "idle", actionBeatMs: 0, job: "none" };
    expect(visibleActions(atHouse).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door", "stickers"]),
    );
    const withBalloon = townKid(BALLOON_SPOT.x, BALLOON_SPOT.y, { carry: "balloon", pose: "idle", job: "none" });
    expect(visibleActions(withBalloon).map((action) => action.id)).toEqual(
      expect.arrayContaining(["share-balloon", "stickers"]),
    );
    expect(isBlocked("town", BALLOON_SPOT.x, BALLOON_SPOT.y)).toBe(false);
    expect(isBlocked("town", 1760, 1328)).toBe(false);
    expect(isBlocked("town", 480, 660)).toBe(false);
  });

  it("keeps the house, shop, and park paths open around the new crossings", () => {
    let player = townKid(560, 920);
    player = walkFrames(player, { x: 460, y: 980 }, 80);
    expect(isBlocked("town", player.x, player.y)).toBe(false);
    player = walkFrames(player, { x: 480, y: 720 }, 120);
    expect(visibleActions({ ...player, pose: "idle", actionBeatMs: 0, job: "none" }).map((action) => action.id)).toEqual(
      expect.arrayContaining(["enter-house", "paint-house", "name-door"]),
    );
    expect(canEnter("town", "living")).toBe(true);
    expect(canEnter("town", "cafe")).toBe(true);
    expect(canEnter("town", "bakery")).toBe(true);
    expect(canEnter("town", "library")).toBe(true);
    expect(isBlocked("town", 1920, 1320)).toBe(false);
    expect(isBlocked("town", 420, 980)).toBe(false);
    expect(isBlocked("town", 420, 1400)).toBe(false);
    expect(isBlocked("town", 840, 1610)).toBe(false);
    expect(isBlocked("town", 1280, 1940)).toBe(false);
    expect(isBlocked("town", 1180, 1322)).toBe(false);
    expect(isBlocked("town", 1776, 2082)).toBe(false);
    expect(isBlocked("town", 1211, 448)).toBe(false);
    expect(isBlocked("town", 1096, 2034)).toBe(false);
    expect(isBlocked("town", 498, 1332)).toBe(false);
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
