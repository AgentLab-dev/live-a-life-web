import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  INSTALL_TIP_KEY,
  dismissInstallTip,
  installHowText,
  installTipWasDismissed,
  isAppleTouchDevice,
  isStandaloneDisplay,
  mountInstallTip,
  registerServiceWorker,
  shouldShowInstallTip,
} from "./pwa.js";

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("web app install", () => {
  it("links a standalone manifest from the title page", () => {
    const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
    expect(html).toMatch(/rel=["']manifest["']/);
    expect(html).toContain("./manifest.webmanifest");
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain("./apple-touch-icon.png");
    expect(html).toContain("./icon-192.png");
    expect(html).toContain('name="apple-mobile-web-app-capable"');
    expect(html).toContain('name="apple-mobile-web-app-title"');

    const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
    expect(manifest.name).toBe("Live a Life");
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("./");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#f4b942");
    expect(manifest.background_color).toBe("#8ecae6");
    expect(manifest.icons.some((icon) => icon.sizes === "192x192" && icon.src.includes("icon-192"))).toBe(true);
    expect(manifest.icons.some((icon) => icon.sizes === "512x512" && icon.src.includes("icon-512"))).toBe(true);
  });

  it("ships 192 and 512 house icons plus an apple-touch-icon", () => {
    const files = [
      ["../public/icon-192.png", 192],
      ["../public/icon-512.png", 512],
      ["../public/apple-touch-icon.png", 180],
    ];
    for (const [rel, size] of files) {
      const path = new URL(rel, import.meta.url);
      expect(existsSync(path)).toBe(true);
      const buf = readFileSync(path);
      expect(buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
      expect(pngSize(buf)).toEqual({ width: size, height: size });
    }
  });

  it("keeps a same-origin static-asset service worker with no tracking", () => {
    const sw = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
    expect(sw).toContain("caches");
    expect(sw).toContain("live-a-life-shell");
    expect(sw).toContain("url.origin !== self.location.origin");
    expect(sw).not.toMatch(/analytics|pixel|track(ing)?|beacon/i);
    const main = readFileSync(new URL("./main.js", import.meta.url), "utf8");
    expect(main).toContain("registerServiceWorker");
    const publish = readFileSync(new URL("../scripts/publish-pages.js", import.meta.url), "utf8");
    expect(publish).toContain("readdirSync(dist)");
  });
});

describe("install tip", () => {
  it("shows once unless dismissed or already standalone", () => {
    expect(shouldShowInstallTip({ standalone: false, dismissed: false })).toBe(true);
    expect(shouldShowInstallTip({ standalone: true, dismissed: false })).toBe(false);
    expect(shouldShowInstallTip({ standalone: false, dismissed: true })).toBe(false);
    expect(isStandaloneDisplay({ matchMedia: () => ({ matches: true }), navigator: {} })).toBe(true);
    expect(isStandaloneDisplay({ matchMedia: () => ({ matches: false }), navigator: { standalone: true } })).toBe(true);
    expect(isStandaloneDisplay({ matchMedia: () => ({ matches: false }), navigator: {} })).toBe(false);
  });

  it("remembers a dismiss on this device", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    expect(installTipWasDismissed(api)).toBe(false);
    dismissInstallTip(api);
    expect(storage.get(INSTALL_TIP_KEY)).toBe("hidden");
    expect(installTipWasDismissed(api)).toBe(true);
  });

  it("explains iPhone Share and Android Install", () => {
    expect(isAppleTouchDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(true);
    expect(installHowText("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toMatch(/Share/i);
    expect(installHowText("Mozilla/5.0 (Linux; Android 14)")).toMatch(/Install app/i);
  });

  it("mounts the after-Play tip and hides it on Got it", () => {
    const storage = new Map();
    const api = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    const root = {
      hidden: true,
      how: "iPhone: tap Share, then Add to Home Screen. Android: tap Install app.",
      okHandler: null,
      querySelector(sel) {
        if (sel === "#install-tip") return this;
        if (sel === ".install-how") return { get textContent() { return root.how; }, set textContent(v) { root.how = v; } };
        if (sel === "#install-tip-ok") return { addEventListener: (_type, fn) => { root.okHandler = fn; } };
        return null;
      },
    };
    expect(mountInstallTip(root, { standalone: false, storage: api, userAgent: "Android" })).toBe(true);
    expect(root.hidden).toBe(false);
    expect(root.how).toMatch(/Install app/);
    root.okHandler();
    expect(root.hidden).toBe(true);
    expect(storage.get(INSTALL_TIP_KEY)).toBe("hidden");
    expect(mountInstallTip(root, { standalone: false, storage: api, userAgent: "Android" })).toBe(false);
    expect(root.hidden).toBe(true);
    expect(mountInstallTip(root, { standalone: true, storage: { getItem: () => null } })).toBe(false);
  });

  it("registers the service worker at ./sw.js", async () => {
    const calls = [];
    const result = await registerServiceWorker({
      register: (url) => {
        calls.push(url);
        return Promise.resolve({ scope: "./" });
      },
    });
    expect(calls).toEqual(["./sw.js"]);
    expect(result.scope).toBe("./");
    await expect(registerServiceWorker(undefined)).resolves.toBeNull();
  });
});
