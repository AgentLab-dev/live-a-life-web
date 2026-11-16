import { splashVariants } from "./ios-splash.js";

export function staticShellPaths() {
  return [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./favicon.svg",
    "./icon-192.png",
    "./icon-512.png",
    "./icon-maskable-512.png",
    "./apple-touch-icon.png",
    "./qr-play.png",
    ...splashVariants().map((variant) => variant.href),
  ];
}

export function hashedAssetUrls(names) {
  return [...names]
    .filter((name) => name && !name.endsWith(".map") && !name.startsWith("."))
    .sort()
    .map((name) => `./assets/${name}`);
}

export function shellUrlsFromSource(source) {
  const match = String(source).match(/const SHELL = \[([\s\S]*?)\];/);
  if (!match) return [];
  return [...match[1].matchAll(/"(\.\/[^"]*)"/g)].map((hit) => hit[1]);
}

export function cacheNameFor(text) {
  let hash = 2166136261;
  const basis = String(text);
  for (let i = 0; i < basis.length; i += 1) {
    hash ^= basis.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `live-a-life-shell-${(hash >>> 0).toString(16)}`;
}

export function applyPrecache(source, assetNames) {
  if (!source.includes("/*__PRECACHE__*/")) {
    throw new Error("service worker is missing /*__PRECACHE__*/");
  }
  const stripped = source.replace(/\n\s*"\.\/assets\/[^"]+",/g, "");
  const urls = hashedAssetUrls(assetNames);
  const block = urls.map((url) => `  "${url}",`).join("\n");
  const withAssets = stripped.replace(
    /[ \t]*\/\*__PRECACHE__\*\//,
    block ? `${block}\n  /*__PRECACHE__*/` : "/*__PRECACHE__*/",
  );
  if (!/const CACHE = "live-a-life-shell-[^"]+";/.test(withAssets)) {
    throw new Error("service worker is missing CACHE");
  }
  const fingerprint = withAssets.replace(/const CACHE = "live-a-life-shell-[^"]+";/, 'const CACHE = "";');
  const cache = cacheNameFor(fingerprint);
  return withAssets.replace(/const CACHE = "live-a-life-shell-[^"]+";/, `const CACHE = "${cache}";`);
}
