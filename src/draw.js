import {
  BALLOON_GAP,
  BALLOON_POSTS,
  BALLOON_WALLS,
  BOOK_SPOT,
  BRIDGE,
  CART,
  CART_ASIDE,
  CHALK,
  CHALK_ZONE,
  CONE_BLOCKS,
  CONE_ZONE,
  CRATE_STEPS,
  CRATE_ZONE,
  CREEK,
  FENCES,
  FLOWER_BED,
  FLOWER_PADS,
  FLOUR_BED,
  FLOUR_SACKS,
  FOUNTAIN_BOWL,
  FOUNTAIN_PADS,
  GATE,
  HEDGE_ARCH,
  HEDGES,
  HOPSCOTCH,
  HOPSCOTCH_ZONE,
  LILIES,
  LINE_GAP,
  LINE_POSTS,
  LINE_WALLS,
  MAIL_SPOT,
  PICNIC_SPOT,
  PLANK,
  POND,
  PUDDLE,
  RIBBON_GAP,
  SANDBOX,
  SANDBOX_MOUNDS,
  SNACK_SPOT,
  STONES,
  STREAMER_POSTS,
  STREAMER_WALLS,
  SWING_GAP,
  SWING_POSTS,
  SWING_WALLS,
  TIRE_BED,
  TIRE_RINGS,
  LOG_MUD,
  LOGS,
  BUS_ZONE,
  BUS_BLOCKS,
  AWNING_GAP,
  AWNING_POSTS,
  AWNING_WALLS,
  TRELLIS_GAP,
  TRELLIS_POSTS,
  TRELLIS_WALLS,
  FLOWER_SPOT,
} from "./crossings.js";
import { houseLook, skinFill, hairFill } from "./looks.js";
import { jobLook } from "./jobs.js";
import { HOUSE, PARK, ROOM, TOWN } from "./world.js";

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function oval(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

export function drawTree(ctx, x, y, leaf = "#3f9b4a", trunk = "#8b5a2b") {
  ctx.fillStyle = trunk;
  roundRect(ctx, x - 8, y - 18, 16, 28, 4);
  ctx.fill();
  ctx.fillStyle = leaf;
  oval(ctx, x, y - 38, 34, 30);
  ctx.fill();
  ctx.fillStyle = "#4fb85a";
  oval(ctx, x - 16, y - 28, 20, 16);
  ctx.fill();
}

function topColor(top) {
  return top === "hoodie" ? "#3d7cc9" : top === "overalls" ? "#3a6ea5" : "#ef6b6b";
}

function shoeColor(shoes) {
  return shoes === "boots" ? "#4a2c1a" : shoes === "sandals" ? "#d4a574" : "#f4f4f4";
}

function jobOverlay(look) {
  return look === "apron" ? "#f4f1ea" : look === "cardigan" ? "#6b4f8a" : look === "vest" ? "#3f9b4a" : "";
}

export function drawKid(ctx, x, y, look, time, pose, facing = 1) {
  const skin = skinFill(look.skin).fill;
  const hair = hairFill(look.hair).fill;
  const hat = look.outfit?.hat ?? "none";
  const top = look.outfit?.top ?? "tee";
  const shoes = look.outfit?.shoes ?? "sneakers";
  const walking = pose === "walk";
  const sitting = pose === "sit" || pose === "eat";
  const sleeping = pose === "sleep";
  const playing = pose === "play";
  const working = pose === "work";
  const hopping = pose === "hop" || look.onStone || look.onHop;
  const bounce = hopping
    ? Math.abs(Math.sin(time * 14)) * 6
    : walking
      ? Math.abs(Math.sin(time * 11)) * 3.2
      : playing
        ? Math.abs(Math.sin(time * 8)) * 8
        : 0;
  const swing = walking || hopping ? Math.sin(time * 11) : working ? Math.sin(time * 10) : 0;

  ctx.save();
  ctx.translate(x, y);
  if (sleeping) ctx.rotate(-Math.PI / 2.15);
  ctx.fillStyle = "rgba(40, 28, 16, 0.18)";
  oval(ctx, 0, 10, sitting ? 20 : 16, 6);
  ctx.fill();
  ctx.translate(0, -28 - bounce + (sitting ? 12 : 0));
  ctx.scale(facing, 1);

  const shirt = look.topColor ?? topColor(top);
  const shoesFill = shoeColor(shoes);

  if (!sitting && !sleeping) {
    ctx.fillStyle = skin;
    roundRect(ctx, -11, 18, 7, 14, 3);
    ctx.fill();
    roundRect(ctx, 4, 18, 7, 14, 3);
    ctx.fill();
    ctx.fillStyle = shoesFill;
    roundRect(ctx, -13, 30 + swing * 2, 10, 7, 3);
    ctx.fill();
    roundRect(ctx, 3, 30 - swing * 2, 10, 7, 3);
    ctx.fill();
    if (shoes === "sneakers") {
      ctx.fillStyle = "#2d6cdf";
      roundRect(ctx, -13, 33 + swing * 2, 10, 4, 2);
      ctx.fill();
      roundRect(ctx, 3, 33 - swing * 2, 10, 4, 2);
      ctx.fill();
    }
  } else if (sitting) {
    ctx.fillStyle = shoesFill;
    roundRect(ctx, -18, 26, 12, 7, 3);
    ctx.fill();
    roundRect(ctx, 6, 26, 12, 7, 3);
    ctx.fill();
  }

  ctx.fillStyle = shirt;
  roundRect(ctx, -16, 2, 32, 24, 8);
  ctx.fill();
  if (top === "hoodie" && !look.topColor) {
    ctx.fillStyle = "#2d5f9e";
    roundRect(ctx, -10, 14, 20, 8, 4);
    ctx.fill();
    ctx.fillStyle = shirt;
    oval(ctx, 0, 2, 16, 8);
    ctx.fill();
  }
  if (top === "overalls" && !look.topColor) {
    ctx.fillStyle = "#f4c24b";
    roundRect(ctx, -5, 8, 10, 7, 2);
    ctx.fill();
    ctx.fillStyle = "#2c5282";
    ctx.fillRect(-12, 2, 5, 10);
    ctx.fillRect(7, 2, 5, 10);
  }

  const overlay = jobOverlay(look.jobLook);
  if (overlay) {
    ctx.fillStyle = overlay;
    roundRect(ctx, -14, 8, 28, 16, 5);
    ctx.fill();
  }

  ctx.fillStyle = skin;
  if (!sitting) {
    roundRect(ctx, -20 + swing * 2, 6, 8, 16, 4);
    ctx.fill();
    roundRect(ctx, 12 - swing * 2, 6, 8, 16, 4);
    ctx.fill();
  } else if (pose === "eat") {
    const lift = Math.abs(Math.sin(time * 8)) * 6;
    roundRect(ctx, 10, 4 - lift, 8, 14, 4);
    ctx.fill();
    ctx.fillStyle = "#e8d5a3";
    oval(ctx, 18, 2 - lift, 5, 3);
    ctx.fill();
  }

  ctx.fillStyle = skin;
  oval(ctx, 0, pose === "look" ? -14 : -12, 16, 15);
  ctx.fill();
  ctx.fillStyle = hair;
  oval(ctx, 0, pose === "look" ? -22 : -20, 16, 10);
  ctx.fill();
  oval(ctx, -13, -12, 6, 8);
  ctx.fill();
  oval(ctx, 13, -12, 6, 8);
  ctx.fill();
  ctx.fillStyle = "#2b1b14";
  oval(ctx, -5.5, pose === "look" ? -13 : -11, 1.7, 2.2);
  ctx.fill();
  oval(ctx, 5.5, pose === "look" ? -13 : -11, 1.7, 2.2);
  ctx.fill();
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, pose === "look" ? -8 : -6, 4, 0.15, Math.PI - 0.15);
  ctx.stroke();

  if (hat === "cap") {
    ctx.fillStyle = "#2d6cdf";
    oval(ctx, 0, -24, 15, 7);
    ctx.fill();
    ctx.fillRect(-2, -26, 20, 5);
  } else if (hat === "beanie") {
    ctx.fillStyle = "#c0392b";
    oval(ctx, 0, -23, 16, 9);
    ctx.fill();
    ctx.fillStyle = "#f4d06f";
    oval(ctx, 0, -32, 4, 4);
    ctx.fill();
  }

  if (sleeping) {
    ctx.fillStyle = "#6b7cff";
    ctx.font = "700 14px Fredoka, sans-serif";
    ctx.fillText("z", 22, -28);
    ctx.fillText("z", 30, -38);
  }
  if (look.carry === "picnic" && !sleeping) {
    ctx.fillStyle = "#c45c26";
    roundRect(ctx, 16, 10, 16, 12, 3);
    ctx.fill();
    ctx.fillStyle = "#f4b942";
    oval(ctx, 24, 10, 8, 4);
    ctx.fill();
    ctx.fillStyle = "#e74c3c";
    oval(ctx, 21, 12, 2.4, 2.4);
    ctx.fill();
    ctx.fillStyle = "#3f9b4a";
    oval(ctx, 27, 12, 2.4, 2.4);
    ctx.fill();
  }
  if (look.carry === "book" && !sleeping) {
    ctx.fillStyle = "#6b4f8a";
    roundRect(ctx, 16, 8, 14, 16, 3);
    ctx.fill();
    ctx.fillStyle = "#f4f1ea";
    roundRect(ctx, 18, 11, 10, 3, 1);
    ctx.fill();
    ctx.fillStyle = "#c39bd3";
    ctx.fillRect(16, 8, 3, 16);
  }
  if (look.carry === "card" && !sleeping) {
    ctx.fillStyle = "#f4d35e";
    roundRect(ctx, 16, 12, 16, 11, 2);
    ctx.fill();
    ctx.strokeStyle = "#c45c26";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(16, 12);
    ctx.lineTo(24, 18);
    ctx.lineTo(32, 12);
    ctx.stroke();
  }
  if (look.carry === "snack" && !sleeping) {
    ctx.fillStyle = "#e8b86d";
    oval(ctx, 24, 16, 9, 6);
    ctx.fill();
    ctx.strokeStyle = "#c45c26";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(16, 14);
    ctx.quadraticCurveTo(24, 10, 32, 14);
    ctx.stroke();
    ctx.fillStyle = "#f4d35e";
    oval(ctx, 22, 15, 2, 2);
    ctx.fill();
  }
  if (look.carry === "flower" && !sleeping) {
    ctx.fillStyle = "#3f9b4a";
    roundRect(ctx, 22, 16, 3, 12, 1);
    ctx.fill();
    ctx.fillStyle = "#f4a4c4";
    oval(ctx, 24, 12, 7, 6);
    ctx.fill();
    ctx.fillStyle = "#f4d35e";
    oval(ctx, 24, 12, 2.4, 2.4);
    ctx.fill();
  }
  ctx.restore();
}

export function drawHouse(ctx, player) {
  const color = houseLook(player.houseColor);
  const { x, y, w, h } = HOUSE;
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  oval(ctx, x + w / 2, y + h + 8, w / 2 - 10, 16);
  ctx.fill();
  ctx.fillStyle = color.roof;
  ctx.beginPath();
  ctx.moveTo(x - 18, y + 86);
  ctx.lineTo(x + w / 2, y - 8);
  ctx.lineTo(x + w + 18, y + 86);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color.fill;
  roundRect(ctx, x, y + 78, w, h - 78, 10);
  ctx.fill();
  ctx.fillStyle = color.trim;
  ctx.fillRect(x, y + 78, w, 10);
  ctx.fillStyle = "#fff4c8";
  roundRect(ctx, x + 48, y + 130, 70, 64, 8);
  ctx.fill();
  roundRect(ctx, x + w - 118, y + 130, 70, 64, 8);
  ctx.fill();
  ctx.strokeStyle = color.trim;
  ctx.lineWidth = 6;
  ctx.strokeRect(x + 48, y + 130, 70, 64);
  ctx.strokeRect(x + w - 118, y + 130, 70, 64);
  ctx.fillStyle = "#7a4a2a";
  roundRect(ctx, x + w / 2 - 38, y + h - 108, 76, 108, 8);
  ctx.fill();
  ctx.fillStyle = "#f3e2b8";
  roundRect(ctx, x + w / 2 - 30, y + h - 78, 60, 22, 6);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 13px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(player.doorLabel, x + w / 2, y + h - 62);
  ctx.textAlign = "left";
  ctx.fillStyle = "#f0d36a";
  oval(ctx, x + w / 2 + 24, y + h - 40, 4, 4);
  ctx.fill();
  ctx.fillStyle = "#5b8def";
  roundRect(ctx, x + 28, y + h - 42, 22, 20, 4);
  ctx.fill();
  ctx.fillStyle = "#f08080";
  roundRect(ctx, x + 54, y + h - 38, 18, 16, 4);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 12px Fredoka, sans-serif";
  ctx.fillText("Paint", x + 28, y + h + 14);
}

function drawNeighbor(ctx, x, y, w, h, fill, roof, label) {
  ctx.fillStyle = "rgba(0,0,0,0.10)";
  oval(ctx, x + w / 2, y + h + 6, w / 2 - 8, 12);
  ctx.fill();
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 64);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 12, y + 64);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = fill;
  roundRect(ctx, x, y + 58, w, h - 58, 10);
  ctx.fill();
  ctx.fillStyle = "#fff4c8";
  roundRect(ctx, x + 28, y + 90, 54, 46, 6);
  ctx.fill();
  ctx.fillStyle = "#7a4a2a";
  roundRect(ctx, x + w / 2 - 22, y + h - 80, 44, 80, 6);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText(label, x + 16, y + 52);
}

function drawShop(ctx, x, y, w, h, fill, roof, title, doorX) {
  ctx.fillStyle = fill;
  roundRect(ctx, x, y + 70, w, h - 70, 10);
  ctx.fill();
  ctx.fillStyle = roof;
  ctx.fillRect(x - 12, y + 48, w + 24, 28);
  ctx.fillStyle = "#fff7e6";
  ctx.font = "700 22px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, x + w / 2, y + 70);
  ctx.fillStyle = "#8ecae6";
  roundRect(ctx, x + 28, y + 110, 110, 80, 8);
  ctx.fill();
  roundRect(ctx, x + w - 138, y + 110, 110, 80, 8);
  ctx.fill();
  ctx.fillStyle = "#6d4c41";
  roundRect(ctx, doorX - 28, y + h - 90, 56, 90, 6);
  ctx.fill();
  ctx.textAlign = "left";
}

function drawFountain(ctx, x, y, time) {
  ctx.fillStyle = "#e8d5b5";
  oval(ctx, x, y, 90, 42);
  ctx.fill();
  ctx.fillStyle = "#b8c4d4";
  oval(ctx, x, y, 54, 24);
  ctx.fill();
  ctx.fillStyle = "#7ec8e3";
  roundRect(ctx, FOUNTAIN_BOWL.x, FOUNTAIN_BOWL.y, FOUNTAIN_BOWL.w, FOUNTAIN_BOWL.h, 16);
  ctx.fill();
  ctx.fillStyle = "#dfe7ef";
  roundRect(ctx, x - 6, y - 46, 12, 40, 4);
  ctx.fill();
  ctx.fillStyle = "#8fd3ea";
  ctx.globalAlpha = 0.45 + Math.sin(time * 3) * 0.12;
  oval(ctx, x, y - 54, 16, 10);
  ctx.fill();
  ctx.globalAlpha = 1;
  FOUNTAIN_PADS.forEach((pad, index) => {
    ctx.fillStyle = index % 2 === 0 ? "#fff8e7" : "#dfe7ef";
    oval(ctx, pad.x, pad.y + 2, 16, 8);
    ctx.fill();
    ctx.fillStyle = "#8fd3ea";
    ctx.globalAlpha = 0.5 + Math.sin(time * 4 + index) * 0.12;
    oval(ctx, pad.x, pad.y - 2, 8, 5);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Fountain pads", FOUNTAIN_BOWL.x - 8, FOUNTAIN_BOWL.y - 10);
}

function drawMural(ctx, x, y) {
  ctx.fillStyle = "#f7d794";
  roundRect(ctx, x, y, 36, 220, 8);
  ctx.fill();
  const dots = ["#e74c3c", "#5b8def", "#f4b942", "#3f9b4a", "#c39bd3", "#e67e22"];
  for (let i = 0; i < 8; i += 1) {
    ctx.fillStyle = dots[i % dots.length];
    oval(ctx, x + 18, y + 28 + i * 22, 10, 10);
    ctx.fill();
  }
  ctx.fillStyle = "#3d2a1a";
  ctx.save();
  ctx.translate(x - 8, y + 110);
  ctx.rotate(-Math.PI / 2);
  ctx.font = "700 16px Fredoka, sans-serif";
  ctx.fillText("Our town", 0, 0);
  ctx.restore();
}

function drawStall(ctx, x, y) {
  ctx.fillStyle = "#c45c26";
  roundRect(ctx, x, y, 140, 18, 6);
  ctx.fill();
  ctx.fillStyle = "#e74c3c";
  roundRect(ctx, x - 8, y - 70, 156, 16, 4);
  ctx.fill();
  ctx.fillStyle = "#8d6e4c";
  roundRect(ctx, x + 8, y - 70, 10, 70, 3);
  ctx.fill();
  roundRect(ctx, x + 122, y - 70, 10, 70, 3);
  ctx.fill();
  ctx.fillStyle = "#f4b942";
  oval(ctx, x + 36, y - 8, 10, 10);
  ctx.fill();
  ctx.fillStyle = "#e67e22";
  oval(ctx, x + 70, y - 6, 10, 10);
  ctx.fill();
  ctx.fillStyle = "#e74c3c";
  oval(ctx, x + 104, y - 10, 10, 10);
  ctx.fill();
}

function drawBench(ctx, x, y) {
  ctx.fillStyle = "#c45c26";
  roundRect(ctx, x, y, 90, 14, 4);
  ctx.fill();
  roundRect(ctx, x, y - 22, 90, 12, 4);
  ctx.fill();
  ctx.fillStyle = "#6d5a4a";
  roundRect(ctx, x + 8, y + 10, 10, 16, 3);
  ctx.fill();
  roundRect(ctx, x + 72, y + 10, 10, 16, 3);
  ctx.fill();
}

function drawBanner(ctx, x, y, color) {
  ctx.fillStyle = "#6d5a4a";
  roundRect(ctx, x, y, 8, 90, 3);
  ctx.fill();
  roundRect(ctx, x + 86, y, 8, 90, 3);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, x, y, 94, 22, 4);
  ctx.fill();
}

function drawCreek(ctx, time) {
  ctx.fillStyle = "#6ec6e8";
  roundRect(ctx, CREEK.x, CREEK.y, CREEK.w, CREEK.h, 28);
  ctx.fill();
  ctx.fillStyle = "#8fd3ea";
  ctx.globalAlpha = 0.45 + Math.sin(time * 2.2) * 0.1;
  oval(ctx, CREEK.x + 180, CREEK.y + 48, 70, 18);
  ctx.fill();
  oval(ctx, CREEK.x + 620, CREEK.y + 40, 80, 16);
  ctx.fill();
  oval(ctx, CREEK.x + 940, CREEK.y + 56, 60, 14);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#2d5a27";
  ctx.font = "700 16px Fredoka, sans-serif";
  ctx.fillText("Little creek", CREEK.x + 24, CREEK.y - 10);
}

function drawStones(ctx) {
  for (const stone of STONES) {
    ctx.fillStyle = "#c9b08a";
    oval(ctx, stone.x, stone.y + 4, 22, 10);
    ctx.fill();
    ctx.fillStyle = "#e8d5b5";
    oval(ctx, stone.x, stone.y, 20, 9);
    ctx.fill();
  }
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Stepping stones", STONES[0].x - 36, STONES[0].y - 22);
}

function drawBridge(ctx) {
  ctx.fillStyle = "#b08968";
  roundRect(ctx, BRIDGE.x, BRIDGE.y + 10, BRIDGE.w, BRIDGE.h - 20, 8);
  ctx.fill();
  ctx.fillStyle = "#d4a373";
  for (let i = 0; i < 6; i += 1) {
    roundRect(ctx, BRIDGE.x + 8, BRIDGE.y + 16 + i * 18, BRIDGE.w - 16, 12, 3);
    ctx.fill();
  }
  ctx.fillStyle = "#8d6e4c";
  roundRect(ctx, BRIDGE.x, BRIDGE.y + 6, 12, BRIDGE.h - 12, 4);
  ctx.fill();
  roundRect(ctx, BRIDGE.x + BRIDGE.w - 12, BRIDGE.y + 6, 12, BRIDGE.h - 12, 4);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Garden bridge", BRIDGE.x + 18, BRIDGE.y + 4);
}

function drawGate(ctx, open) {
  for (const fence of FENCES) {
    ctx.fillStyle = "#c45c26";
    roundRect(ctx, fence.x, fence.y, fence.w, fence.h, 4);
    ctx.fill();
    ctx.fillStyle = "#8d6e4c";
    for (let x = fence.x + 8; x < fence.x + fence.w; x += 18) {
      roundRect(ctx, x, fence.y - 10, 6, 28, 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#8d6e4c";
  roundRect(ctx, GATE.x, GATE.y - 16, 8, 40, 3);
  ctx.fill();
  roundRect(ctx, GATE.x + GATE.w - 8, GATE.y - 16, 8, 40, 3);
  ctx.fill();
  ctx.fillStyle = "#d4a373";
  if (open) {
    roundRect(ctx, GATE.x + GATE.w + 4, GATE.y - 8, 14, GATE.w - 8, 4);
    ctx.fill();
  } else {
    roundRect(ctx, GATE.x + 6, GATE.y, GATE.w - 12, GATE.h, 4);
    ctx.fill();
  }
  ctx.fillStyle = "#2d5a27";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText(open ? "Gate open" : "Park gate", GATE.x - 8, GATE.y - 22);
}

function drawHedgeArch(ctx) {
  for (const hedge of HEDGES) {
    ctx.fillStyle = "#2f8a40";
    roundRect(ctx, hedge.x, hedge.y, hedge.w, hedge.h, 8);
    ctx.fill();
    ctx.fillStyle = "#4fb85a";
    oval(ctx, hedge.x + 18, hedge.y + 4, 16, 12);
    ctx.fill();
    oval(ctx, hedge.x + hedge.w - 18, hedge.y + 4, 16, 12);
    ctx.fill();
  }
  ctx.fillStyle = "#2f8a40";
  oval(ctx, HEDGE_ARCH.x + 18, HEDGE_ARCH.y + 18, 22, 26);
  ctx.fill();
  oval(ctx, HEDGE_ARCH.x + HEDGE_ARCH.w - 18, HEDGE_ARCH.y + 18, 22, 26);
  ctx.fill();
  ctx.fillStyle = "#3f9b4a";
  oval(ctx, HEDGE_ARCH.x + HEDGE_ARCH.w / 2, HEDGE_ARCH.y + 6, 40, 14);
  ctx.fill();
  ctx.fillStyle = "#2d5a27";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Hedge arch", HEDGE_ARCH.x + 18, HEDGE_ARCH.y - 8);
}

function drawFlowerPads(ctx) {
  ctx.fillStyle = "#7a5a32";
  roundRect(ctx, FLOWER_BED.x, FLOWER_BED.y, FLOWER_BED.w, FLOWER_BED.h, 16);
  ctx.fill();
  ctx.fillStyle = "#3f9b4a";
  ctx.globalAlpha = 0.45;
  roundRect(ctx, FLOWER_BED.x + 8, FLOWER_BED.y + 8, FLOWER_BED.w - 16, FLOWER_BED.h - 16, 12);
  ctx.fill();
  ctx.globalAlpha = 1;
  const blooms = ["#f4a4c4", "#f4b942", "#e74c3c", "#c39bd3"];
  FLOWER_PADS.forEach((pad, index) => {
    ctx.fillStyle = "#c9b08a";
    oval(ctx, pad.x, pad.y + 3, 20, 9);
    ctx.fill();
    ctx.fillStyle = blooms[index % blooms.length];
    oval(ctx, pad.x, pad.y, 16, 8);
    ctx.fill();
    ctx.fillStyle = "#fff8e7";
    oval(ctx, pad.x, pad.y - 1, 5, 4);
    ctx.fill();
  });
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Flower pads", FLOWER_BED.x + 16, FLOWER_BED.y - 8);
}

function drawBookCart(ctx, inWay) {
  const cart = inWay === false ? CART_ASIDE : CART;
  ctx.fillStyle = "#8d6e4c";
  roundRect(ctx, cart.x, cart.y + 18, cart.w, 22, 5);
  ctx.fill();
  ctx.fillStyle = "#6d5a4a";
  oval(ctx, cart.x + 10, cart.y + cart.h - 4, 7, 7);
  ctx.fill();
  oval(ctx, cart.x + cart.w - 10, cart.y + cart.h - 4, 7, 7);
  ctx.fill();
  ctx.fillStyle = "#6b4f8a";
  roundRect(ctx, cart.x + 8, cart.y + 4, 12, 16, 2);
  ctx.fill();
  ctx.fillStyle = "#c45c26";
  roundRect(ctx, cart.x + 22, cart.y + 2, 12, 18, 2);
  ctx.fill();
  ctx.fillStyle = "#3f9b4a";
  roundRect(ctx, cart.x + 34, cart.y + 6, 10, 14, 2);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText(inWay === false ? "Cart aside" : "Book cart", cart.x - 8, cart.y - 8);
}

function drawHopscotch(ctx) {
  ctx.fillStyle = "#d8c3a5";
  roundRect(ctx, HOPSCOTCH_ZONE.x, HOPSCOTCH_ZONE.y, HOPSCOTCH_ZONE.w, HOPSCOTCH_ZONE.h, 12);
  ctx.fill();
  const chalk = ["#5b8def", "#e74c3c", "#f4b942", "#3f9b4a"];
  HOPSCOTCH.forEach((square, index) => {
    ctx.fillStyle = chalk[index % chalk.length];
    ctx.globalAlpha = 0.55;
    roundRect(ctx, square.x, square.y, square.w, square.h, 8);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff8e7";
    ctx.font = "700 16px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(index + 1), square.x + square.w / 2, square.y + 30);
  });
  ctx.textAlign = "left";
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Hopscotch", HOPSCOTCH_ZONE.x + 8, HOPSCOTCH_ZONE.y - 8);
}

function drawStreamers(ctx, time) {
  for (const post of STREAMER_POSTS) {
    ctx.fillStyle = "#6d5a4a";
    roundRect(ctx, post.x + 6, post.y, 8, post.h, 3);
    ctx.fill();
  }
  ctx.strokeStyle = "#6d5a4a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(STREAMER_POSTS[0].x + 10, STREAMER_POSTS[0].y + 8);
  ctx.lineTo(STREAMER_POSTS[1].x + 10, STREAMER_POSTS[1].y + 8);
  ctx.stroke();
  const colors = ["#e74c3c", "#5b8def", "#f4b942", "#3f9b4a", "#c39bd3"];
  for (const wall of STREAMER_WALLS) {
    for (let i = 0; i < 5; i += 1) {
      const x = wall.x + 8 + i * 9;
      const sway = Math.sin(time * 3 + i) * 3;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(x, wall.y - 16);
      ctx.lineTo(x + 5 + sway, wall.y + 36);
      ctx.lineTo(x - 4 + sway, wall.y + 36);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.fillStyle = "#f4a4c4";
  ctx.globalAlpha = 0.55 + Math.sin(time * 4) * 0.1;
  for (let i = 0; i < 3; i += 1) {
    oval(ctx, RIBBON_GAP.x + 12 + i * 14, RIBBON_GAP.y + 10, 5, 10);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Ribbons", STREAMER_POSTS[0].x - 4, STREAMER_POSTS[0].y - 10);
}

function drawPuddle(ctx, time) {
  ctx.fillStyle = "#6ec6e8";
  ctx.globalAlpha = 0.8 + Math.sin(time * 2) * 0.08;
  oval(ctx, PUDDLE.x + PUDDLE.w / 2, PUDDLE.y + PUDDLE.h / 2, PUDDLE.w / 2, PUDDLE.h / 2 - 4);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#8fd3ea";
  oval(ctx, PUDDLE.x + 70, PUDDLE.y + 28, 28, 10);
  ctx.fill();
  ctx.fillStyle = "#b08968";
  roundRect(ctx, PLANK.x, PLANK.y + 8, PLANK.w, PLANK.h - 16, 6);
  ctx.fill();
  ctx.fillStyle = "#d4a373";
  for (let i = 0; i < 4; i += 1) {
    roundRect(ctx, PLANK.x + 6, PLANK.y + 14 + i * 18, PLANK.w - 12, 12, 3);
    ctx.fill();
  }
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Puddle plank", PUDDLE.x + 8, PUDDLE.y - 8);
}

function drawCrateSteps(ctx) {
  ctx.fillStyle = "#c9b08a";
  roundRect(ctx, CRATE_ZONE.x, CRATE_ZONE.y, CRATE_ZONE.w, CRATE_ZONE.h, 12);
  ctx.fill();
  CRATE_STEPS.forEach((crate, index) => {
    ctx.fillStyle = index % 2 === 0 ? "#c45c26" : "#d4a373";
    roundRect(ctx, crate.x - 18, crate.y - 10, 36, 22, 4);
    ctx.fill();
    ctx.fillStyle = "#8d6e4c";
    roundRect(ctx, crate.x - 16, crate.y - 4, 32, 4, 2);
    ctx.fill();
  });
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Market crates", CRATE_ZONE.x + 12, CRATE_ZONE.y - 8);
}

function drawFlourSacks(ctx) {
  ctx.fillStyle = "#d8c3a5";
  roundRect(ctx, FLOUR_BED.x, FLOUR_BED.y, FLOUR_BED.w, FLOUR_BED.h, 16);
  ctx.fill();
  FLOUR_SACKS.forEach((sack, index) => {
    ctx.fillStyle = index % 2 === 0 ? "#f4e6c3" : "#efe0b8";
    oval(ctx, sack.x, sack.y, 18, 12);
    ctx.fill();
    ctx.fillStyle = "#c45c26";
    roundRect(ctx, sack.x - 6, sack.y - 14, 12, 8, 3);
    ctx.fill();
  });
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Flour sacks", FLOUR_BED.x + 16, FLOUR_BED.y - 8);
}

function drawLilyPads(ctx) {
  const blooms = ["#f4a4c4", "#fff8e7", "#e74c3c"];
  LILIES.forEach((pad, index) => {
    ctx.fillStyle = "#2f8a40";
    oval(ctx, pad.x, pad.y + 2, 18, 9);
    ctx.fill();
    ctx.fillStyle = "#4fb85a";
    oval(ctx, pad.x, pad.y, 16, 8);
    ctx.fill();
    ctx.fillStyle = blooms[index % blooms.length];
    oval(ctx, pad.x + 4, pad.y - 2, 4, 4);
    ctx.fill();
  });
  ctx.fillStyle = "#2d5a27";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Lily pads", POND.x + 16, POND.y - 8);
}

function drawClothesline(ctx, time) {
  for (const post of LINE_POSTS) {
    ctx.fillStyle = "#6d5a4a";
    roundRect(ctx, post.x + 4, post.y, 8, post.h, 3);
    ctx.fill();
  }
  ctx.strokeStyle = "#6d5a4a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(LINE_POSTS[0].x + 8, LINE_POSTS[0].y + 16);
  ctx.lineTo(LINE_POSTS[1].x + 8, LINE_POSTS[1].y + 16);
  ctx.stroke();
  const clothes = ["#5b8def", "#f4a4c4", "#fff8e7", "#f4b942"];
  for (const wall of LINE_WALLS) {
    for (let i = 0; i < 3; i += 1) {
      const x = wall.x + 6 + i * 10;
      const sway = Math.sin(time * 2.4 + i) * 2;
      ctx.fillStyle = clothes[i % clothes.length];
      roundRect(ctx, x + sway, wall.y - 8, 8, 28, 3);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#f4d35e";
  ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.08;
  oval(ctx, LINE_GAP.x + LINE_GAP.w / 2, LINE_GAP.y + 16, 10, 8);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Clothesline", LINE_POSTS[0].x - 8, LINE_POSTS[0].y - 10);
}

function drawCones(ctx) {
  ctx.fillStyle = "#e8d5b5";
  roundRect(ctx, CONE_ZONE.x, CONE_ZONE.y, CONE_ZONE.w, CONE_ZONE.h, 12);
  ctx.fill();
  for (const cone of CONE_BLOCKS) {
    ctx.fillStyle = "#e67e22";
    ctx.beginPath();
    ctx.moveTo(cone.x + 4, cone.y + cone.h - 6);
    ctx.lineTo(cone.x + cone.w / 2, cone.y + 8);
    ctx.lineTo(cone.x + cone.w - 4, cone.y + cone.h - 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff8e7";
    roundRect(ctx, cone.x + 6, cone.y + 28, cone.w - 12, 6, 2);
    ctx.fill();
  }
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Pretend cones", CONE_ZONE.x + 8, CONE_ZONE.y - 8);
}

function drawPostcard(ctx, carried) {
  if (!carried) {
    ctx.fillStyle = "#f4d35e";
    roundRect(ctx, 308, 676, 18, 12, 2);
    ctx.fill();
    ctx.fillStyle = "#c45c26";
    ctx.fillRect(312, 680, 10, 2);
  }
  ctx.fillStyle = "#f4d35e";
  roundRect(ctx, MAIL_SPOT.x - 10, MAIL_SPOT.y - 6, 20, 14, 3);
  ctx.fill();
  ctx.strokeStyle = "#c45c26";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(MAIL_SPOT.x - 10, MAIL_SPOT.y - 6);
  ctx.lineTo(MAIL_SPOT.x, MAIL_SPOT.y + 2);
  ctx.lineTo(MAIL_SPOT.x + 10, MAIL_SPOT.y - 6);
  ctx.stroke();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Mail", MAIL_SPOT.x - 14, MAIL_SPOT.y - 14);
}

function drawChalk(ctx) {
  ctx.fillStyle = "#d8c3a5";
  roundRect(ctx, CHALK_ZONE.x, CHALK_ZONE.y, CHALK_ZONE.w, CHALK_ZONE.h, 12);
  ctx.fill();
  const chalk = ["#5b8def", "#e74c3c", "#f4b942", "#3f9b4a"];
  CHALK.forEach((square, index) => {
    ctx.fillStyle = chalk[index % chalk.length];
    ctx.globalAlpha = 0.6;
    roundRect(ctx, square.x, square.y, square.w, square.h, 8);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff8e7";
    ctx.font = "700 14px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(index + 1), square.x + square.w / 2, square.y + 18);
  });
  ctx.textAlign = "left";
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Chalk zig-zag", CHALK_ZONE.x - 18, CHALK_ZONE.y - 8);
}

function drawBalloons(ctx, time) {
  for (const post of BALLOON_POSTS) {
    ctx.fillStyle = "#6d5a4a";
    roundRect(ctx, post.x + 4, post.y, 8, post.h, 3);
    ctx.fill();
  }
  ctx.strokeStyle = "#6d5a4a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(BALLOON_POSTS[0].x + 8, BALLOON_POSTS[0].y + 10);
  ctx.lineTo(BALLOON_POSTS[1].x + 8, BALLOON_POSTS[1].y + 10);
  ctx.stroke();
  const colors = ["#e74c3c", "#5b8def", "#f4b942", "#f4a4c4", "#3f9b4a"];
  for (const wall of BALLOON_WALLS) {
    for (let i = 0; i < 3; i += 1) {
      const x = wall.x + 6 + i * 10;
      const sway = Math.sin(time * 2.6 + i) * 3;
      ctx.strokeStyle = "#6d5a4a";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, wall.y - 18);
      ctx.lineTo(x + sway, wall.y + 28);
      ctx.stroke();
      ctx.fillStyle = colors[i % colors.length];
      oval(ctx, x + sway, wall.y + 32, 7, 9);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#8fd3ea";
  ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.08;
  oval(ctx, BALLOON_GAP.x + BALLOON_GAP.w / 2, BALLOON_GAP.y + 16, 10, 8);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Balloons", BALLOON_POSTS[0].x - 4, BALLOON_POSTS[0].y - 10);
}

function drawSandbox(ctx) {
  ctx.fillStyle = "#e8d5b5";
  roundRect(ctx, SANDBOX.x, SANDBOX.y, SANDBOX.w, SANDBOX.h, 16);
  ctx.fill();
  ctx.fillStyle = "#d4b48a";
  roundRect(ctx, SANDBOX.x + 8, SANDBOX.y + 8, SANDBOX.w - 16, SANDBOX.h - 16, 12);
  ctx.fill();
  SANDBOX_MOUNDS.forEach((mound, index) => {
    ctx.fillStyle = index % 2 === 0 ? "#f0d9a8" : "#e4c48a";
    oval(ctx, mound.x, mound.y + 4, 20, 10);
    ctx.fill();
    ctx.fillStyle = "#fff4d6";
    oval(ctx, mound.x - 4, mound.y - 2, 8, 5);
    ctx.fill();
  });
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Sandbox", SANDBOX.x + 16, SANDBOX.y - 8);
}

function drawSwing(ctx, time) {
  for (const post of SWING_POSTS) {
    ctx.fillStyle = "#5b8def";
    roundRect(ctx, post.x + 4, post.y, 8, post.h, 3);
    ctx.fill();
  }
  ctx.strokeStyle = "#5b8def";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(SWING_POSTS[0].x + 8, SWING_POSTS[0].y + 6);
  ctx.lineTo(SWING_POSTS[1].x + 8, SWING_POSTS[1].y + 6);
  ctx.stroke();
  for (const wall of SWING_WALLS) {
    const sway = Math.sin(time * 1.6) * 2;
    ctx.strokeStyle = "#6d5a4a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wall.x + 8, SWING_POSTS[0].y + 8);
    ctx.lineTo(wall.x + 8 + sway, wall.y + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wall.x + wall.w - 8, SWING_POSTS[0].y + 8);
    ctx.lineTo(wall.x + wall.w - 8 + sway, wall.y + 4);
    ctx.stroke();
    ctx.fillStyle = "#e74c3c";
    roundRect(ctx, wall.x + sway, wall.y, wall.w, 12, 4);
    ctx.fill();
  }
  ctx.fillStyle = "#f4d35e";
  ctx.globalAlpha = 0.45 + Math.sin(time * 3) * 0.08;
  oval(ctx, SWING_GAP.x + SWING_GAP.w / 2, SWING_GAP.y + 18, 10, 8);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#2d5a27";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Swing path", SWING_POSTS[0].x - 8, SWING_POSTS[0].y - 10);
}

function drawTires(ctx) {
  ctx.fillStyle = "#c9b08a";
  roundRect(ctx, TIRE_BED.x, TIRE_BED.y, TIRE_BED.w, TIRE_BED.h, 16);
  ctx.fill();
  TIRE_RINGS.forEach((ring, index) => {
    ctx.fillStyle = index % 2 === 0 ? "#4a4a4a" : "#5c5c5c";
    oval(ctx, ring.x, ring.y + 2, 18, 11);
    ctx.fill();
    ctx.fillStyle = "#d8c3a5";
    oval(ctx, ring.x, ring.y + 2, 8, 5);
    ctx.fill();
    ctx.fillStyle = "#6d5a4a";
    oval(ctx, ring.x, ring.y - 2, 16, 8);
    ctx.fill();
    ctx.fillStyle = "#e8d5b5";
    oval(ctx, ring.x, ring.y - 2, 7, 4);
    ctx.fill();
  });
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Tire hops", TIRE_BED.x + 16, TIRE_BED.y - 8);
}

function drawLogs(ctx) {
  ctx.fillStyle = "#8b6b3a";
  ctx.globalAlpha = 0.78;
  oval(ctx, LOG_MUD.x + LOG_MUD.w / 2, LOG_MUD.y + LOG_MUD.h / 2, LOG_MUD.w / 2, LOG_MUD.h / 2 - 4);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#a9844a";
  oval(ctx, LOG_MUD.x + 70, LOG_MUD.y + 30, 28, 10);
  ctx.fill();
  LOGS.forEach((log, index) => {
    ctx.fillStyle = index % 2 === 0 ? "#8d6e4c" : "#b08968";
    roundRect(ctx, log.x - 22, log.y - 8, 44, 16, 8);
    ctx.fill();
    ctx.fillStyle = "#d4a373";
    oval(ctx, log.x - 20, log.y, 6, 7);
    ctx.fill();
    oval(ctx, log.x + 20, log.y, 6, 7);
    ctx.fill();
  });
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Log path", LOG_MUD.x + 16, LOG_MUD.y - 8);
}

function drawBusStop(ctx) {
  ctx.fillStyle = "#e8d5b5";
  roundRect(ctx, BUS_ZONE.x, BUS_ZONE.y, BUS_ZONE.w, BUS_ZONE.h, 12);
  ctx.fill();
  ctx.fillStyle = "#5b8def";
  roundRect(ctx, BUS_ZONE.x + BUS_ZONE.w - 18, BUS_ZONE.y - 54, 8, 54, 3);
  ctx.fill();
  ctx.fillStyle = "#f4d35e";
  roundRect(ctx, BUS_ZONE.x + BUS_ZONE.w - 40, BUS_ZONE.y - 72, 52, 24, 6);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 11px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Bus stop", BUS_ZONE.x + BUS_ZONE.w - 14, BUS_ZONE.y - 56);
  ctx.textAlign = "left";
  for (const bench of BUS_BLOCKS) {
    ctx.fillStyle = "#c45c26";
    roundRect(ctx, bench.x, bench.y + 18, bench.w, 14, 4);
    ctx.fill();
    ctx.fillStyle = "#3f9b4a";
    oval(ctx, bench.x + bench.w / 2, bench.y + 12, 10, 8);
    ctx.fill();
    ctx.fillStyle = "#6d5a4a";
    roundRect(ctx, bench.x + 4, bench.y + 32, 6, 16, 2);
    ctx.fill();
    roundRect(ctx, bench.x + bench.w - 10, bench.y + 32, 6, 16, 2);
    ctx.fill();
  }
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Bench weave", BUS_ZONE.x + 8, BUS_ZONE.y - 8);
}

function drawAwning(ctx, time) {
  for (const post of AWNING_POSTS) {
    ctx.fillStyle = "#6d5a4a";
    roundRect(ctx, post.x + 4, post.y, 8, post.h, 3);
    ctx.fill();
  }
  ctx.fillStyle = "#e74c3c";
  roundRect(ctx, AWNING_POSTS[0].x, AWNING_POSTS[0].y + 8, AWNING_POSTS[1].x - AWNING_POSTS[0].x + 16, 18, 4);
  ctx.fill();
  ctx.fillStyle = "#fff8e7";
  for (let i = 0; i < 6; i += 1) {
    if (i % 2 === 0) continue;
    ctx.fillRect(AWNING_POSTS[0].x + 8 + i * 20, AWNING_POSTS[0].y + 10, 16, 14);
  }
  for (const wall of AWNING_WALLS) {
    ctx.fillStyle = "#c45c26";
    roundRect(ctx, wall.x, wall.y - 8, wall.w, 10, 3);
    ctx.fill();
  }
  ctx.fillStyle = "#f4d35e";
  ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.08;
  oval(ctx, AWNING_GAP.x + AWNING_GAP.w / 2, AWNING_GAP.y + 16, 10, 8);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Shop awning", AWNING_POSTS[0].x - 8, AWNING_POSTS[0].y - 10);
}

function drawTrellis(ctx) {
  for (const post of TRELLIS_POSTS) {
    ctx.fillStyle = "#8d6e4c";
    roundRect(ctx, post.x + 4, post.y, 8, post.h, 3);
    ctx.fill();
    ctx.fillStyle = "#3f9b4a";
    for (let i = 0; i < 5; i += 1) {
      oval(ctx, post.x + 8, post.y + 18 + i * 24, 12, 8);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#2f8a40";
  oval(ctx, TRELLIS_GAP.x + TRELLIS_GAP.w / 2, TRELLIS_POSTS[0].y + 10, 28, 14);
  ctx.fill();
  ctx.fillStyle = "#4fb85a";
  oval(ctx, TRELLIS_GAP.x + 6, TRELLIS_POSTS[0].y + 16, 10, 8);
  ctx.fill();
  oval(ctx, TRELLIS_GAP.x + TRELLIS_GAP.w - 6, TRELLIS_POSTS[0].y + 16, 10, 8);
  ctx.fill();
  ctx.fillStyle = "#f4a4c4";
  oval(ctx, TRELLIS_GAP.x + 8, TRELLIS_POSTS[0].y + 8, 4, 4);
  ctx.fill();
  ctx.fillStyle = "#f4b942";
  oval(ctx, TRELLIS_GAP.x + TRELLIS_GAP.w - 8, TRELLIS_POSTS[0].y + 6, 4, 4);
  ctx.fill();
  ctx.fillStyle = "#dfe7ef";
  ctx.globalAlpha = 0.45;
  oval(ctx, TRELLIS_GAP.x + TRELLIS_GAP.w / 2, TRELLIS_GAP.y + 18, 10, 8);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#2d5a27";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Garden trellis", TRELLIS_POSTS[0].x - 18, TRELLIS_POSTS[0].y - 10);
}

function drawSharedFlower(ctx, carried) {
  if (!carried) {
    ctx.fillStyle = "#3f9b4a";
    roundRect(ctx, 1196, 572, 3, 12, 1);
    ctx.fill();
    ctx.fillStyle = "#f4a4c4";
    oval(ctx, 1198, 568, 7, 6);
    ctx.fill();
    ctx.fillStyle = "#f4d35e";
    oval(ctx, 1198, 568, 2.2, 2.2);
    ctx.fill();
  }
  ctx.fillStyle = "#fff8e7";
  roundRect(ctx, FLOWER_SPOT.x - 22, FLOWER_SPOT.y - 8, 44, 22, 8);
  ctx.fill();
  ctx.fillStyle = "#c45c26";
  roundRect(ctx, FLOWER_SPOT.x - 20, FLOWER_SPOT.y + 10, 40, 8, 3);
  ctx.fill();
  ctx.fillStyle = "#6d5a4a";
  roundRect(ctx, FLOWER_SPOT.x - 16, FLOWER_SPOT.y + 16, 6, 10, 2);
  ctx.fill();
  roundRect(ctx, FLOWER_SPOT.x + 10, FLOWER_SPOT.y + 16, 6, 10, 2);
  ctx.fill();
  if (!carried) {
    ctx.fillStyle = "#f4a4c4";
    oval(ctx, FLOWER_SPOT.x, FLOWER_SPOT.y + 2, 7, 6);
    ctx.fill();
    ctx.fillStyle = "#f4d35e";
    oval(ctx, FLOWER_SPOT.x, FLOWER_SPOT.y + 2, 2.2, 2.2);
    ctx.fill();
  }
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Flower", FLOWER_SPOT.x - 20, FLOWER_SPOT.y - 14);
}

function drawSnack(ctx, carried) {
  if (!carried) {
    ctx.fillStyle = "#e8b86d";
    oval(ctx, 1920, 1310, 10, 6);
    ctx.fill();
    ctx.strokeStyle = "#c45c26";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(1912, 1308);
    ctx.quadraticCurveTo(1920, 1304, 1928, 1308);
    ctx.stroke();
  }
  ctx.fillStyle = "#fff8e7";
  roundRect(ctx, SNACK_SPOT.x - 22, SNACK_SPOT.y - 8, 44, 22, 8);
  ctx.fill();
  if (!carried) {
    ctx.fillStyle = "#e8b86d";
    oval(ctx, SNACK_SPOT.x, SNACK_SPOT.y + 2, 10, 6);
    ctx.fill();
  }
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Snack", SNACK_SPOT.x - 18, SNACK_SPOT.y - 14);
}

function drawSharedBook(ctx, carried) {
  if (carried) return;
  ctx.fillStyle = "#6b4f8a";
  roundRect(ctx, 448, 1388, 16, 18, 3);
  ctx.fill();
  ctx.fillStyle = "#f4f1ea";
  roundRect(ctx, 450, 1392, 12, 3, 1);
  ctx.fill();
  ctx.fillStyle = "#6b4f8a";
  roundRect(ctx, BOOK_SPOT.x - 8, BOOK_SPOT.y - 6, 16, 12, 3);
  ctx.fill();
}

function drawPicnic(ctx, carried) {
  ctx.fillStyle = "#fff8e7";
  roundRect(ctx, PICNIC_SPOT.x - 54, PICNIC_SPOT.y - 8, 108, 50, 16);
  ctx.fill();
  ctx.fillStyle = "#e74c3c";
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(PICNIC_SPOT.x - 54 + i * 27, PICNIC_SPOT.y - 8, 13, 50);
  }
  ctx.globalAlpha = 1;
  if (!carried) {
    ctx.fillStyle = "#c45c26";
    roundRect(ctx, PICNIC_SPOT.x - 14, PICNIC_SPOT.y + 6, 28, 16, 4);
    ctx.fill();
    ctx.fillStyle = "#f4b942";
    oval(ctx, PICNIC_SPOT.x, PICNIC_SPOT.y + 6, 14, 6);
    ctx.fill();
  }
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 14px Fredoka, sans-serif";
  ctx.fillText("Picnic", PICNIC_SPOT.x - 22, PICNIC_SPOT.y - 14);
}

function drawPark(ctx, time) {
  ctx.fillStyle = "#8fd36a";
  roundRect(ctx, PARK.x, PARK.y, PARK.w, PARK.h, 28);
  ctx.fill();
  ctx.fillStyle = "#7ec24f";
  oval(ctx, PARK.x + 180, PARK.y + 140, 70, 28);
  ctx.fill();
  ctx.fillStyle = "#6ec6e8";
  oval(ctx, POND.x + POND.w / 2, POND.y + POND.h / 2, POND.w / 2, POND.h / 2 - 4);
  ctx.fill();
  ctx.fillStyle = "#e8d5a3";
  roundRect(ctx, PARK.x + 80, PARK.y + 260, 260, 22, 10);
  ctx.fill();
  drawTree(ctx, PARK.x + 90, PARK.y + 180);
  drawTree(ctx, PARK.x + 240, PARK.y + 120, "#2f8a40");
  drawTree(ctx, PARK.x + 400, PARK.y + 160);
  drawTree(ctx, PARK.x + 620, PARK.y + 130, "#3aa14a");
  ctx.fillStyle = "#d9a066";
  roundRect(ctx, PARK.x + 140, PARK.y + 320, 70, 16, 6);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.35 + Math.sin(time * 0.8) * 0.08;
  oval(ctx, PARK.x + 560, PARK.y + 230, 24, 10);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#2d5a27";
  ctx.font = "700 20px Fredoka, sans-serif";
  ctx.fillText("Park", PARK.x + 40, PARK.y + 44);
}

function drawPath(ctx, x, y, w, h) {
  ctx.fillStyle = "#d8c3a5";
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
}

export function drawTown(ctx, player, time) {
  ctx.fillStyle = "#8ecae6";
  ctx.fillRect(0, 0, TOWN.width, 220);
  ctx.fillStyle = "#7ec850";
  ctx.fillRect(0, 180, TOWN.width, TOWN.height);
  ctx.fillStyle = "#72b846";
  for (let i = 0; i < 16; i += 1) ctx.fillRect(0, 240 + i * 120, TOWN.width, 16);

  drawPath(ctx, 40, 720, TOWN.width - 80, 180);
  drawPath(ctx, 760, 900, 120, 860);
  drawPath(ctx, 420, 960, 1680, 90);
  drawPath(ctx, 420, 1360, 1600, 80);
  drawPath(ctx, 900, 1760, 900, 160);

  ctx.fillStyle = "#f4d35e";
  for (let x = 80; x < TOWN.width; x += 90) ctx.fillRect(x, 800, 50, 8);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  oval(ctx, 180, 90, 60, 22);
  ctx.fill();
  oval(ctx, 230, 86, 40, 18);
  ctx.fill();
  oval(ctx, 1400, 70, 70, 24);
  ctx.fill();
  oval(ctx, 2100, 100, 50, 18);
  ctx.fill();

  drawPark(ctx, time);
  drawCreek(ctx, time);
  drawStones(ctx);
  drawBridge(ctx);
  drawGate(ctx, player.parkGateOpen);
  drawPicnic(ctx, player.carry === "picnic");
  drawHedgeArch(ctx);
  drawFlowerPads(ctx);
  drawBookCart(ctx, player.bookCartOut);
  drawHopscotch(ctx);
  drawStreamers(ctx, time);
  drawPuddle(ctx, time);
  drawCrateSteps(ctx);
  drawFlourSacks(ctx);
  drawLilyPads(ctx);
  drawClothesline(ctx, time);
  drawCones(ctx);
  drawPostcard(ctx, player.carry === "card");
  drawChalk(ctx);
  drawBalloons(ctx, time);
  drawSandbox(ctx);
  drawSwing(ctx, time);
  drawSnack(ctx, player.carry === "snack");
  drawSharedBook(ctx, player.carry === "book");
  drawTires(ctx);
  drawLogs(ctx);
  drawBusStop(ctx);
  drawAwning(ctx, time);
  drawTrellis(ctx);
  drawSharedFlower(ctx, player.carry === "flower");
  if (player.carry !== "picnic") {
    ctx.fillStyle = "#c45c26";
    roundRect(ctx, 488, 1006, 24, 14, 4);
    ctx.fill();
    ctx.fillStyle = "#f4b942";
    oval(ctx, 500, 1006, 12, 5);
    ctx.fill();
  }
  drawHouse(ctx, player);
  drawNeighbor(ctx, 860, 300, 300, 300, "#f08080", "#8b3a3a", "Next door");
  drawNeighbor(ctx, 1260, 300, 300, 300, "#7dcea0", "#2d6a4f", "Friends");
  drawShop(ctx, 80, 820, 340, 300, "#f7efd4", "#c45c26", "Little Bakery", 420);
  drawShop(ctx, 80, 1220, 340, 340, "#c39bd3", "#5b3a6b", "Town Library", 420);
  drawShop(ctx, 1960, 1100, 380, 340, "#f5cba7", "#b56b45", "Honey Cafe", 1960);

  ctx.fillStyle = "#c45c26";
  roundRect(ctx, 1680, 1880, 180, 140, 10);
  ctx.fill();
  ctx.fillStyle = "#3f9b4a";
  roundRect(ctx, 1660, 2000, 80, 28, 8);
  ctx.fill();
  ctx.fillStyle = "#e74c3c";
  oval(ctx, 1680, 1990, 8, 8);
  ctx.fill();
  ctx.fillStyle = "#f4b942";
  oval(ctx, 1710, 1994, 8, 8);
  ctx.fill();

  drawFountain(ctx, 1180, 1320, time);
  drawMural(ctx, 1680, 1180);
  drawStall(ctx, 1360, 1040);
  drawBench(ctx, 1020, 1880);
  drawBench(ctx, 1080, 1400);
  drawBanner(ctx, 980, 1080, "#e74c3c");
  drawBanner(ctx, 1320, 1080, "#5b8def");
  drawBanner(ctx, 1720, 1480, "#f4b942");

  ctx.fillStyle = "#fff8e7";
  roundRect(ctx, 1120, 1188, 120, 44, 10);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 16px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Jobs", 1180, 1210);
  ctx.font = "600 12px Fredoka, sans-serif";
  ctx.fillText("pretend", 1180, 1226);
  ctx.textAlign = "left";

  ctx.fillStyle = "#6db3e0";
  oval(ctx, 920, 2080, 70, 28);
  ctx.fill();
  ctx.fillStyle = "#fff8e7";
  oval(ctx, 900, 2068, 10, 7);
  ctx.fill();
  oval(ctx, 940, 2074, 10, 7);
  ctx.fill();

  drawTree(ctx, 120, 640, "#2f8a40");
  drawTree(ctx, 780, 600);
  drawTree(ctx, 1680, 700, "#3aa14a");
  drawTree(ctx, 2100, 900, "#2f8a40");
  drawTree(ctx, 900, 1760);
  drawTree(ctx, 1480, 1800, "#3aa14a");

  ctx.fillStyle = "#f4a4c4";
  for (const [fx, fy] of [
    [140, 980],
    [200, 1020],
    [820, 1600],
    [1500, 2100],
    [2100, 1700],
  ]) {
    oval(ctx, fx, fy, 5, 5);
    ctx.fill();
  }

  ctx.fillStyle = "#355c3a";
  ctx.font = "700 18px Fredoka, sans-serif";
  ctx.fillText("Your house", HOUSE.x + 16, HOUSE.y + 64);
  ctx.fillText("Plaza", 1120, 1288);
}

function drawRoomBase(ctx, floor, rug) {
  ctx.fillStyle = "#d8ecf7";
  ctx.fillRect(0, 0, ROOM.width, 110);
  ctx.fillStyle = floor;
  ctx.fillRect(0, 110, ROOM.width, ROOM.height);
  ctx.fillStyle = rug;
  roundRect(ctx, 90, 180, ROOM.width - 180, ROOM.height - 250, 24);
  ctx.fill();
}

function drawDoor(ctx, x, y, label) {
  ctx.fillStyle = "#7a4a2a";
  roundRect(ctx, x - 28, y - 56, 56, 80, 8);
  ctx.fill();
  ctx.fillStyle = "#f3e2b8";
  ctx.font = "700 12px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y + 40);
  ctx.textAlign = "left";
}

export function drawLiving(ctx, player) {
  drawRoomBase(ctx, "#e8c9a0", "#d7b48a");
  ctx.fillStyle = houseLook(player.houseColor).fill;
  ctx.fillRect(0, 110, ROOM.width, 18);
  drawDoor(ctx, 490, 660, "Street");
  drawDoor(ctx, 70, 340, "Bedroom");
  drawDoor(ctx, 910, 340, "Kitchen");
  ctx.fillStyle = "#fff4c8";
  roundRect(ctx, 190, 128, 84, 56, 8);
  ctx.fill();
  ctx.strokeStyle = houseLook(player.houseColor).trim;
  ctx.lineWidth = 5;
  ctx.strokeRect(190, 128, 84, 56);
  ctx.fillStyle = "#5b8def";
  roundRect(ctx, 140, 360, 180, 70, 16);
  ctx.fill();
  ctx.fillStyle = "#4a74c9";
  roundRect(ctx, 132, 348, 24, 86, 8);
  ctx.fill();
  roundRect(ctx, 304, 348, 24, 86, 8);
  ctx.fill();
  ctx.fillStyle = "#8d6e4c";
  roundRect(ctx, 420, 120, 140, 92, 10);
  ctx.fill();
  ctx.fillStyle = "#c9a36a";
  ctx.fillRect(432, 132, 50, 70);
  ctx.fillRect(498, 132, 50, 70);
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 13px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Closet", 490, 230);
  ctx.textAlign = "left";
}

export function drawKitchen(ctx) {
  drawRoomBase(ctx, "#f3efe6", "#e7e0d2");
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(0, 110, ROOM.width, 18);
  drawDoor(ctx, 70, 340, "Living");
  ctx.fillStyle = "#eceff1";
  roundRect(ctx, 160, 150, 280, 70, 8);
  ctx.fill();
  ctx.fillStyle = "#90a4ae";
  roundRect(ctx, 180, 164, 50, 40, 6);
  ctx.fill();
  roundRect(ctx, 250, 164, 50, 40, 6);
  ctx.fill();
  ctx.fillStyle = "#b08968";
  roundRect(ctx, 390, 340, 220, 90, 10);
  ctx.fill();
  ctx.fillStyle = "#d4a373";
  ctx.fillRect(400, 348, 200, 16);
  ctx.fillStyle = "#8d6e4c";
  roundRect(ctx, 360, 410, 36, 36, 8);
  ctx.fill();
  roundRect(ctx, 600, 410, 36, 36, 8);
  ctx.fill();
  ctx.fillStyle = "#f4f1ea";
  oval(ctx, 500, 372, 26, 16);
  ctx.fill();
}

export function drawBedroom(ctx) {
  drawRoomBase(ctx, "#d7c4e8", "#c9b2de");
  ctx.fillStyle = "#b39ddb";
  ctx.fillRect(0, 110, ROOM.width, 18);
  drawDoor(ctx, 910, 340, "Living");
  ctx.fillStyle = "#7e57c2";
  roundRect(ctx, 220, 300, 280, 150, 16);
  ctx.fill();
  ctx.fillStyle = "#ede7f6";
  roundRect(ctx, 236, 312, 248, 50, 12);
  ctx.fill();
  ctx.fillStyle = "#ffcc80";
  roundRect(ctx, 250, 318, 70, 36, 10);
  ctx.fill();
  ctx.fillStyle = "#6d4c41";
  roundRect(ctx, 540, 360, 54, 54, 8);
  ctx.fill();
  ctx.fillStyle = "#fff8e1";
  oval(ctx, 567, 348, 12, 8);
  ctx.fill();
}

export function drawCafe(ctx) {
  drawRoomBase(ctx, "#f8e4c8", "#f5cba7");
  ctx.fillStyle = "#f5cba7";
  ctx.fillRect(0, 110, ROOM.width, 18);
  drawDoor(ctx, 70, 340, "Street");
  ctx.fillStyle = "#c45c26";
  roundRect(ctx, 390, 340, 220, 90, 10);
  ctx.fill();
  ctx.fillStyle = "#7a4a2a";
  roundRect(ctx, 620, 180, 220, 90, 10);
  ctx.fill();
  ctx.fillStyle = "#6d3a1a";
  oval(ctx, 460, 330, 10, 8);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 20px Fredoka, sans-serif";
  ctx.fillText("Honey Cafe", 160, 170);
}

export function drawBakery(ctx) {
  drawRoomBase(ctx, "#fff4d6", "#f4b942");
  ctx.fillStyle = "#f4b942";
  ctx.fillRect(0, 110, ROOM.width, 18);
  drawDoor(ctx, 70, 340, "Street");
  ctx.fillStyle = "#c45c26";
  roundRect(ctx, 420, 300, 260, 140, 12);
  ctx.fill();
  ctx.fillStyle = "#8d6e4c";
  roundRect(ctx, 720, 340, 90, 90, 10);
  ctx.fill();
  ctx.fillStyle = "#f4b942";
  oval(ctx, 500, 280, 16, 12);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 20px Fredoka, sans-serif";
  ctx.fillText("Little Bakery", 160, 170);
}

export function drawLibrary(ctx) {
  drawRoomBase(ctx, "#efe6d6", "#6b4f8a");
  ctx.fillStyle = "#6b4f8a";
  ctx.fillRect(0, 110, ROOM.width, 18);
  drawDoor(ctx, 70, 340, "Street");
  ctx.fillStyle = "#8d6e4c";
  roundRect(ctx, 700, 180, 80, 360, 8);
  ctx.fill();
  ctx.fillStyle = "#c45c26";
  roundRect(ctx, 390, 360, 200, 80, 10);
  ctx.fill();
  ctx.fillStyle = "#f4f1ea";
  roundRect(ctx, 450, 348, 70, 16, 4);
  ctx.fill();
  ctx.fillStyle = "#5a3820";
  ctx.font = "700 20px Fredoka, sans-serif";
  ctx.fillText("Town Library", 160, 170);
}

export function drawRoom(ctx, room, player, time) {
  if (room === "town") drawTown(ctx, player, time);
  else if (room === "living") drawLiving(ctx, player);
  else if (room === "kitchen") drawKitchen(ctx);
  else if (room === "bedroom") drawBedroom(ctx);
  else if (room === "cafe") drawCafe(ctx);
  else if (room === "bakery") drawBakery(ctx);
  else if (room === "library") drawLibrary(ctx);
}

export function kidLook(player) {
  return {
    skin: player.skin,
    hair: player.hair,
    outfit: player.outfit,
    jobLook: jobLook(player.job).look,
    carry: player.carry,
    onStone: player.onStone,
    onHop: player.onHop,
  };
}
