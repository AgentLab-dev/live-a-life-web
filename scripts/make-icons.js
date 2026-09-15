import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const SKY = [142, 202, 230, 255];
const GRASS = [126, 200, 80, 255];
const ROOF = [196, 92, 38, 255];
const WALL = [244, 185, 66, 255];
const TRIM = [212, 146, 26, 255];
const WINDOW = [255, 244, 200, 255];
const DOOR = [122, 74, 42, 255];
const KNOB = [243, 226, 184, 255];

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const header = Buffer.from(type);
  const body = Buffer.concat([header, data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

function writePng(path, width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

function setPixel(pixels, width, height, x, y, color) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= width || iy >= height) return;
  const i = (iy * width + ix) * 4;
  pixels[i] = color[0];
  pixels[i + 1] = color[1];
  pixels[i + 2] = color[2];
  pixels[i + 3] = color[3];
}

function fillRect(pixels, width, height, x0, y0, x1, y1, color) {
  const left = Math.max(0, Math.floor(Math.min(x0, x1)));
  const right = Math.min(width - 1, Math.ceil(Math.max(x0, x1)) - 1);
  const top = Math.max(0, Math.floor(Math.min(y0, y1)));
  const bottom = Math.min(height - 1, Math.ceil(Math.max(y0, y1)) - 1);
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) setPixel(pixels, width, height, x, y, color);
  }
}

function fillRoundRect(pixels, width, height, x0, y0, x1, y1, radius, color) {
  const left = Math.min(x0, x1);
  const right = Math.max(x0, x1);
  const top = Math.min(y0, y1);
  const bottom = Math.max(y0, y1);
  const r = Math.min(radius, (right - left) / 2, (bottom - top) / 2);
  for (let y = Math.floor(top); y < Math.ceil(bottom); y += 1) {
    for (let x = Math.floor(left); x < Math.ceil(right); x += 1) {
      const cx = x + 0.5;
      const cy = y + 0.5;
      let inside = true;
      if (cx < left + r && cy < top + r) {
        const dx = cx - (left + r);
        const dy = cy - (top + r);
        inside = dx * dx + dy * dy <= r * r;
      } else if (cx > right - r && cy < top + r) {
        const dx = cx - (right - r);
        const dy = cy - (top + r);
        inside = dx * dx + dy * dy <= r * r;
      } else if (cx < left + r && cy > bottom - r) {
        const dx = cx - (left + r);
        const dy = cy - (bottom - r);
        inside = dx * dx + dy * dy <= r * r;
      } else if (cx > right - r && cy > bottom - r) {
        const dx = cx - (right - r);
        const dy = cy - (bottom - r);
        inside = dx * dx + dy * dy <= r * r;
      }
      if (inside) setPixel(pixels, width, height, x, y, color);
    }
  }
}

function fillPoly(pixels, width, height, points, color) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(...ys)));
  for (let y = minY; y <= maxY; y += 1) {
    const scan = y + 0.5;
    const hits = [];
    for (let i = 0; i < points.length; i += 1) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= scan && y2 > scan) || (y2 <= scan && y1 > scan)) {
        hits.push(x1 + ((scan - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    hits.sort((a, b) => a - b);
    for (let i = 0; i < hits.length; i += 2) {
      const x0 = Math.max(0, Math.floor(hits[i]));
      const x1 = Math.min(width - 1, Math.ceil(hits[i + 1] ?? hits[i]));
      for (let x = x0; x <= x1; x += 1) setPixel(pixels, width, height, x, y, color);
    }
  }
}

function drawHouse(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const u = size / 64;
  fillRoundRect(pixels, size, size, 0, 0, size, size, 14 * u, SKY);
  fillRect(pixels, size, size, 0, 46 * u, size, size, GRASS);
  fillPoly(
    pixels,
    size,
    size,
    [
      [8 * u, 30 * u],
      [32 * u, 10 * u],
      [56 * u, 30 * u],
    ],
    ROOF,
  );
  fillRect(pixels, size, size, 12 * u, 28 * u, 52 * u, 54 * u, WALL);
  fillRect(pixels, size, size, 14 * u, 34 * u, 24 * u, 44 * u, WINDOW);
  fillRect(pixels, size, size, 40 * u, 34 * u, 50 * u, 44 * u, WINDOW);
  fillRect(pixels, size, size, 14 * u, 34 * u, 24 * u, 36 * u, TRIM);
  fillRect(pixels, size, size, 40 * u, 34 * u, 50 * u, 36 * u, TRIM);
  fillRect(pixels, size, size, 18.5 * u, 34 * u, 19.5 * u, 44 * u, TRIM);
  fillRect(pixels, size, size, 44.5 * u, 34 * u, 45.5 * u, 44 * u, TRIM);
  fillRect(pixels, size, size, 26 * u, 36 * u, 38 * u, 54 * u, DOOR);
  fillRect(pixels, size, size, 34 * u, 43 * u, 36.2 * u, 46.2 * u, KNOB);
  return pixels;
}

const publicDir = new URL("../public", import.meta.url).pathname;
for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  writePng(join(publicDir, name), size, size, drawHouse(size));
}

console.log("Wrote kid-friendly house icons to public/");
