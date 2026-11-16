import { readFileSync, existsSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { splashLinkTag, splashVariants } from "./ios-splash.js";
import { applyPrecache, hashedAssetUrls, shellUrlsFromSource, staticShellPaths } from "./precache.js";
import {
  INSTALL_TIP_KEY,
  IOS_INSTALL_KEY,
  SW_RELOAD_KEY,
  clearUpdateReloadFlag,
  dismissInstallTip,
  dismissIosInstall,
  installHowText,
  installTipWasDismissed,
  iosInstallWasDismissed,
  isAppleTouchDevice,
  isIosSafari,
  isStandaloneDisplay,
  lockDocumentGestures,
  mountInstallTip,
  mountIosInstallCard,
  registerServiceWorker,
  reloadForUpdate,
  shouldShowInstallTip,
  shouldShowIosInstallCard,
  watchForAppUpdate,
} from "./pwa.js";

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function pngPixels(buf) {
  let offset = 8;
  let width = 0;
  let height = 0;
  const idat = [];
  while (offset + 8 <= buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    offset += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const rowLen = width * 4 + 1;
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    if (raw[y * rowLen] !== 0) throw new Error("unexpected png filter");
    raw.copy(pixels, y * width * 4, y * rowLen + 1, y * rowLen + 1 + width * 4);
  }
  return { width, height, pixels };
}

function pixelAt(image, x, y) {
  const i = (y * image.width + x) * 4;
  return [image.pixels[i], image.pixels[i + 1], image.pixels[i + 2], image.pixels[i + 3]];
}

function storageFrom(map = new Map()) {
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
    map,
  };
}

function eventTarget(initial = {}) {
  const listeners = new Map();
  return {
    ...initial,
    addEventListener(type, fn) {
      listeners.set(type, fn);
    },
    emit(type) {
      listeners.get(type)?.();
    },
  };
}

describe("web app install", () => {
  it("links a standalone manifest from the title page", () => {
    const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
    expect(html).toMatch(/rel=["']manifest["']/);
    expect(html).toContain("./manifest.webmanifest");
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain("./apple-touch-icon.png");
    expect(html).toContain("./icon-192.png");
    expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="apple-mobile-web-app-status-bar-style" content="black-translucent"');
    expect(html).toContain('name="apple-mobile-web-app-title" content="Live a Life"');
    expect(html).toContain("viewport-fit=cover");
    expect(html).toContain('name="theme-color" content="#f4b942"');
    expect(html).toContain("Add Live a Life to your Home Screen: tap Share, then Add to Home Screen");
    expect(html).toContain('id="ios-install-card"');
    expect(html).toContain('id="ios-install-dismiss"');
    for (const variant of splashVariants()) {
      expect(html).toContain(splashLinkTag(variant));
    }

    const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
    expect(manifest.id).toBe("./");
    expect(manifest.name).toBe("Live a Life");
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("./");
    expect(manifest.scope).toBe("./");
    expect(manifest.display).toBe("standalone");
    expect(manifest.orientation).toBe("any");
    expect(manifest.categories).toEqual(["games", "kids", "education"]);
    expect(manifest.theme_color).toBe("#f4b942");
    expect(manifest.background_color).toBe("#8ecae6");
    expect(manifest.icons.some((icon) => icon.sizes === "180x180" && icon.src.includes("apple-touch-icon"))).toBe(true);
    expect(manifest.icons.some((icon) => icon.sizes === "192x192" && icon.src.includes("icon-192"))).toBe(true);
    const any512 = manifest.icons.find((icon) => icon.sizes === "512x512" && icon.purpose === "any");
    const maskable = manifest.icons.find((icon) => icon.purpose === "maskable");
    expect(any512?.src).toContain("icon-512");
    expect(maskable?.src).toContain("icon-maskable-512");
    expect(maskable?.sizes).toBe("512x512");
    expect(maskable?.src).not.toBe(any512?.src);
  });

  it("ships 192 and 512 house icons plus an apple-touch-icon", () => {
    const files = [
      ["../public/icon-192.png", 192],
      ["../public/icon-512.png", 512],
      ["../public/apple-touch-icon.png", 180],
      ["../public/icon-maskable-512.png", 512],
    ];
    for (const [rel, size] of files) {
      const path = new URL(rel, import.meta.url);
      expect(existsSync(path)).toBe(true);
      const buf = readFileSync(path);
      expect(buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
      expect(pngSize(buf)).toEqual({ width: size, height: size });
    }
    const maskable = pngPixels(readFileSync(new URL("../public/icon-maskable-512.png", import.meta.url)));
    expect(pixelAt(maskable, 0, 0)).toEqual([142, 202, 230, 255]);
    expect(pixelAt(maskable, 511, 0)).toEqual([142, 202, 230, 255]);
    expect(pixelAt(maskable, 256, 256)).not.toEqual([142, 202, 230, 255]);
    for (const variant of splashVariants()) {
      const path = new URL(`../public/${variant.href.slice(2)}`, import.meta.url);
      expect(existsSync(path), variant.href).toBe(true);
      expect(pngSize(readFileSync(path))).toEqual({ width: variant.width, height: variant.height });
    }
  });

  it("keeps a same-origin static-asset service worker with no tracking", () => {
    const sw = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
    expect(sw).toContain("caches");
    expect(sw).toContain("live-a-life-shell");
    expect(sw).toContain("url.origin !== self.location.origin");
    expect(sw).toContain("skipWaiting");
    expect(sw).toContain("clients.claim");
    expect(sw).toContain("SKIP_WAITING");
    expect(sw).toContain("/*__PRECACHE__*/");
    expect(sw).not.toContain("/live-a-life-web/");
    expect(sw).not.toMatch(/analytics|pixel|track(ing)?|beacon/i);
    expect(new Set(shellUrlsFromSource(sw))).toEqual(new Set(staticShellPaths()));
    expect(staticShellPaths()).toEqual(expect.arrayContaining([
      "./",
      "./index.html",
      "./manifest.webmanifest",
      "./icon-192.png",
      "./icon-512.png",
      "./icon-maskable-512.png",
      "./apple-touch-icon.png",
      "./qr-play.png",
    ]));
    const main = readFileSync(new URL("./main.js", import.meta.url), "utf8");
    expect(main).toContain("registerServiceWorker");
    expect(main).toContain("mountIosInstallCard");
    expect(main).toContain("lockDocumentGestures");
    const publish = readFileSync(new URL("../scripts/publish-pages.js", import.meta.url), "utf8");
    expect(publish).toContain("readdirSync(dist)");
    expect(publish).toContain("applyPrecache");
    const css = readFileSync(new URL("./style.css", import.meta.url), "utf8");
    expect(css).toContain("env(safe-area-inset-top");
    expect(css).toContain("env(safe-area-inset-right");
    expect(css).toContain("env(safe-area-inset-bottom");
    expect(css).toContain("env(safe-area-inset-left");
    expect(css).toContain("overscroll-behavior: none");
    expect(css).toContain("-webkit-touch-callout: none");
    expect(css).toContain("user-select: none");
    expect(css).toMatch(/#game-canvas[\s\S]*touch-action:\s*none/);
  });

  it("adds the built hashed bundles to the service worker shell", () => {
    expect(hashedAssetUrls(["index-abc.js", "app.css", "notes.map", ".keep"])).toEqual([
      "./assets/app.css",
      "./assets/index-abc.js",
    ]);
    const source = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
    const once = applyPrecache(source, ["index-abc.js", "app.css"]);
    const twice = applyPrecache(once, ["index-abc.js", "app.css"]);
    expect(once).toContain('"./assets/app.css"');
    expect(once).toContain('"./assets/index-abc.js"');
    expect(once).not.toContain("live-a-life-shell-v1");
    expect(once.match(/\.\/assets\/index-abc\.js/g)).toHaveLength(1);
    expect(twice.match(/\.\/assets\/index-abc\.js/g)).toHaveLength(1);
    expect(applyPrecache(source, ["other.js"])).not.toBe(once);
    expect(shellUrlsFromSource(once)).toEqual(
      expect.arrayContaining(["./index.html", "./manifest.webmanifest", "./assets/index-abc.js", "./assets/app.css"]),
    );
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
    const iphone = {
      hidden: false,
      querySelector(sel) {
        if (sel === "#install-tip") return iphone;
        return null;
      },
    };
    expect(
      mountInstallTip(iphone, {
        standalone: false,
        storage: { getItem: () => null },
        userAgent: IPHONE_SAFARI,
      }),
    ).toBe(false);
    expect(iphone.hidden).toBe(true);
  });

  it("registers the service worker at ./sw.js", async () => {
    const calls = [];
    const result = await registerServiceWorker({
      register: (url, options) => {
        calls.push([url, options?.scope]);
        return Promise.resolve({ scope: options?.scope });
      },
    });
    expect(calls).toEqual([["./sw.js", "./"]]);
    expect(result.scope).toBe("./");
    await expect(registerServiceWorker(undefined)).resolves.toBeNull();
  });
});

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPHONE_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1";
const IPAD_SAFARI =
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const DESKTOP_SAFARI =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";

describe("iPhone install card", () => {
  it("detects iOS Safari and leaves other browsers to the existing tip", () => {
    expect(isIosSafari(IPHONE_SAFARI)).toBe(true);
    expect(isIosSafari(IPAD_SAFARI)).toBe(true);
    expect(isIosSafari(DESKTOP_SAFARI, { maxTouchPoints: 5 })).toBe(true);
    expect(isIosSafari(DESKTOP_SAFARI, { maxTouchPoints: 0 })).toBe(false);
    expect(isIosSafari(IPHONE_CHROME)).toBe(false);
    expect(isIosSafari("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36")).toBe(false);
    expect(shouldShowIosInstallCard({ iosSafari: true, standalone: false, dismissed: false })).toBe(true);
    expect(shouldShowIosInstallCard({ iosSafari: true, standalone: true, dismissed: false })).toBe(false);
    expect(shouldShowIosInstallCard({ iosSafari: true, standalone: false, dismissed: true })).toBe(false);
    expect(shouldShowIosInstallCard({ iosSafari: false, standalone: false, dismissed: false })).toBe(false);
    expect(
      isStandaloneDisplay({
        matchMedia: (query) => ({ matches: query.includes("fullscreen") }),
        navigator: {},
      }),
    ).toBe(true);
  });

  it("remembers an iPhone dismiss without hiding the Android tip", () => {
    const storage = storageFrom();
    expect(iosInstallWasDismissed(storage)).toBe(false);
    dismissIosInstall(storage);
    expect(storage.map.get(IOS_INSTALL_KEY)).toBe("hidden");
    expect(iosInstallWasDismissed(storage)).toBe(true);
    expect(storage.map.has(INSTALL_TIP_KEY)).toBe(false);
    expect(installTipWasDismissed(storage)).toBe(false);
  });

  it("shows the card in iOS Safari and keeps it hidden for Android and standalone", () => {
    const storage = storageFrom();
    const card = {
      hidden: true,
      dismiss: null,
      querySelector(sel) {
        if (sel === "#ios-install-card") return card;
        if (sel === "#ios-install-dismiss") return { addEventListener: (_type, fn) => { card.dismiss = fn; } };
        return null;
      },
    };
    expect(mountIosInstallCard(card, { userAgent: IPHONE_SAFARI, standalone: false, storage })).toBe(true);
    expect(card.hidden).toBe(false);
    card.dismiss();
    expect(card.hidden).toBe(true);
    expect(iosInstallWasDismissed(storage)).toBe(true);
    expect(mountIosInstallCard(card, { userAgent: IPHONE_SAFARI, standalone: false, storage })).toBe(false);
    expect(card.hidden).toBe(true);
    const fresh = storageFrom();
    expect(mountIosInstallCard(card, { userAgent: "Mozilla/5.0 (Linux; Android 14)", standalone: false, storage: fresh })).toBe(false);
    expect(card.hidden).toBe(true);
    expect(mountIosInstallCard(card, { userAgent: IPHONE_CHROME, standalone: false, storage: fresh })).toBe(false);
    expect(mountIosInstallCard(card, { iosSafari: true, standalone: true, storage: fresh })).toBe(false);
  });
});

describe("installed app updates", () => {
  it("reloads once on the title screen and asks during play", () => {
    const storage = storageFrom();
    const reloads = [];
    expect(reloadForUpdate(storage, () => reloads.push("go"))).toBe(true);
    expect(reloadForUpdate(storage, () => reloads.push("go"))).toBe(false);
    expect(reloads).toEqual(["go"]);
    expect(storage.map.get(SW_RELOAD_KEY)).toBe("1");
    clearUpdateReloadFlag(storage);
    expect(reloadForUpdate(storage, () => reloads.push("again"))).toBe(true);
    expect(reloads).toEqual(["go", "again"]);

    const title = eventTarget({ controller: null });
    const titleReloads = [];
    watchForAppUpdate(title, {}, { playing: () => false, reload: () => titleReloads.push("reload"), onUpdate: () => titleReloads.push("banner") });
    title.emit("controllerchange");
    expect(titleReloads).toEqual([]);
    title.emit("controllerchange");
    expect(titleReloads).toEqual(["reload"]);

    const playing = eventTarget({ controller: { active: true } });
    const duringPlay = [];
    watchForAppUpdate(playing, {}, { playing: () => true, reload: () => duringPlay.push("reload"), onUpdate: () => duringPlay.push("banner") });
    playing.emit("controllerchange");
    expect(duringPlay).toEqual(["banner"]);
  });
});

describe("touch lock", () => {
  it("stops page scroll and callouts on the canvas and still allows a sheet", () => {
    const events = [];
    const doc = {
      addEventListener(type, fn, options) {
        events.push({ type, fn, options });
      },
    };
    expect(lockDocumentGestures(doc)).toBe(true);
    const touch = events.find((event) => event.type === "touchmove");
    expect(touch.options).toEqual({ passive: false });
    expect(events.some((event) => event.type === "gesturestart" && event.options.passive === false)).toBe(true);
    let prevented = false;
    const prevent = () => {
      prevented = true;
    };
    touch.fn({ target: { closest: () => null }, preventDefault: prevent });
    expect(prevented).toBe(true);
    prevented = false;
    touch.fn({ target: { closest: (sel) => (sel.includes(".sheet") ? {} : null) }, preventDefault: prevent });
    expect(prevented).toBe(false);
    const menu = events.find((event) => event.type === "contextmenu");
    prevented = false;
    menu.fn({ target: { closest: () => null }, preventDefault: prevent });
    expect(prevented).toBe(true);
    prevented = false;
    menu.fn({ target: { closest: (sel) => (sel.includes("input") ? {} : null) }, preventDefault: prevent });
    expect(prevented).toBe(false);
  });
});

describe("share link", () => {
  it("publishes a QR code and parent install notes for the Pages URL", async () => {
    const { PLAY_URL, qrBuffer } = await import("../scripts/make-qr.js");
    const actual = readFileSync(new URL("../public/qr-play.png", import.meta.url));
    expect(PLAY_URL).toBe("https://agentlab-dev.github.io/live-a-life-web/");
    expect(Buffer.compare(await qrBuffer(), actual)).toBe(0);
    expect(pngSize(actual)).toEqual({ width: 512, height: 512 });
    const notes = readFileSync(new URL("../INSTALL.md", import.meta.url), "utf8");
    expect(notes).toContain(PLAY_URL);
    expect(notes).toContain("Add to Home Screen");
    expect(notes).toMatch(/Share/);
    expect(notes).toMatch(/Android/);
  });
});
