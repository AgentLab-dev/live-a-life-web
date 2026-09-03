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
  const bounce = walking ? Math.abs(Math.sin(time * 11)) * 3.2 : playing ? Math.abs(Math.sin(time * 8)) * 8 : 0;
  const swing = walking ? Math.sin(time * 11) : working ? Math.sin(time * 10) : 0;

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
  oval(ctx, x, y - 4, 36, 16);
  ctx.fill();
  ctx.fillStyle = "#dfe7ef";
  roundRect(ctx, x - 6, y - 46, 12, 40, 4);
  ctx.fill();
  ctx.fillStyle = "#8fd3ea";
  ctx.globalAlpha = 0.45 + Math.sin(time * 3) * 0.12;
  oval(ctx, x, y - 54, 16, 10);
  ctx.fill();
  ctx.globalAlpha = 1;
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

function drawPark(ctx, time) {
  ctx.fillStyle = "#8fd36a";
  roundRect(ctx, PARK.x, PARK.y, PARK.w, PARK.h, 28);
  ctx.fill();
  ctx.fillStyle = "#7ec24f";
  oval(ctx, PARK.x + 180, PARK.y + 140, 70, 28);
  ctx.fill();
  ctx.fillStyle = "#6ec6e8";
  oval(ctx, PARK.x + 560, PARK.y + 240, 90, 40);
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

  ctx.fillStyle = "#5b8def";
  roundRect(ctx, 1240, 1910, 12, 70, 3);
  ctx.fill();
  roundRect(ctx, 1310, 1910, 12, 70, 3);
  ctx.fill();
  ctx.fillStyle = "#e74c3c";
  roundRect(ctx, 1280, 1940, 90, 14, 6);
  ctx.fill();

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
  };
}
