import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const assets = join(root, "assets");

if (!existsSync(dist)) {
  throw new Error("Run vite build before publish-pages");
}

if (existsSync(assets)) {
  for (const name of readdirSync(assets)) {
    rmSync(join(assets, name), { force: true, recursive: true });
  }
} else {
  mkdirSync(assets, { recursive: true });
}

cpSync(join(dist, "index.html"), join(root, "index.html"));
if (existsSync(join(dist, "assets"))) {
  cpSync(join(dist, "assets"), assets, { recursive: true });
}
for (const name of [".nojekyll", "favicon.svg"]) {
  const from = join(dist, name);
  if (existsSync(from)) cpSync(from, join(root, name));
}

console.log("Published Vite dist to repo root for GitHub Pages");
