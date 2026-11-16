export const INSTALL_TIP_KEY = "live-a-life-install-tip";
export const IOS_INSTALL_KEY = "live-a-life-ios-install";
export const SW_RELOAD_KEY = "live-a-life-sw-reloaded";

const OTHER_IOS_BROWSER = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|DuckDuckGo|GSA\/|FBAN|FBAV|Instagram/i;

export function isStandaloneDisplay(win = globalThis) {
  const modes = ["(display-mode: standalone)", "(display-mode: fullscreen)"];
  const media = modes.some((query) => win.matchMedia?.(query)?.matches);
  return Boolean(media || win.navigator?.standalone);
}

export function shouldShowInstallTip({ standalone = false, dismissed = false } = {}) {
  return !standalone && !dismissed;
}

export function installTipWasDismissed(storage) {
  try {
    return storage?.getItem?.(INSTALL_TIP_KEY) === "hidden";
  } catch {
    return false;
  }
}

export function dismissInstallTip(storage) {
  try {
    storage?.setItem?.(INSTALL_TIP_KEY, "hidden");
  } catch {
    // Private mode can block storage; hiding the tip still works for this visit.
  }
}

export function isAppleTouchDevice(ua = "") {
  return /iphone|ipad|ipod/i.test(ua);
}

export function isIosSafari(ua = "", nav = {}) {
  const text = String(ua || "");
  if (OTHER_IOS_BROWSER.test(text)) return false;
  const handheld = /iPhone|iPad|iPod/i.test(text);
  const looksLikeSafari = /Safari/i.test(text) && /Version\/[\d.]+/i.test(text);
  if (handheld) return looksLikeSafari;
  const ipadDesktop = /Macintosh/i.test(text) && Number(nav?.maxTouchPoints) > 1;
  return Boolean(ipadDesktop && looksLikeSafari && !/Chrome|Chromium|Edg\/|Firefox|OPR\//i.test(text));
}

export function shouldShowIosInstallCard({ iosSafari = false, standalone = false, dismissed = false } = {}) {
  return Boolean(iosSafari && !standalone && !dismissed);
}

export function iosInstallWasDismissed(storage) {
  try {
    return storage?.getItem?.(IOS_INSTALL_KEY) === "hidden";
  } catch {
    return false;
  }
}

export function dismissIosInstall(storage) {
  try {
    storage?.setItem?.(IOS_INSTALL_KEY, "hidden");
  } catch {
    // Private mode can block storage; hiding the card still works for this visit.
  }
}

export function installHowText(ua = "") {
  if (isAppleTouchDevice(ua)) return "iPhone: tap Share, then Add to Home Screen.";
  return "Android: tap Install app or Add to Home Screen.";
}

export function reloadForUpdate(storage = globalThis.sessionStorage, reload = () => globalThis.location?.reload?.()) {
  try {
    if (storage?.getItem?.(SW_RELOAD_KEY) === "1") return false;
    storage?.setItem?.(SW_RELOAD_KEY, "1");
  } catch {
    // Private mode can block storage. One reload is still worth trying.
  }
  reload?.();
  return true;
}

export function clearUpdateReloadFlag(storage = globalThis.sessionStorage) {
  try {
    storage?.removeItem?.(SW_RELOAD_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function defaultPlaying() {
  if (typeof document === "undefined" || !document.getElementById) return false;
  return !document.getElementById("play");
}

export function showUpdateBanner(doc = globalThis.document) {
  if (!doc?.getElementById || !doc?.createElement) return false;
  let banner = doc.getElementById("version-banner");
  if (!banner) {
    banner = doc.createElement("div");
    banner.id = "version-banner";
    banner.className = "version-banner";
    banner.innerHTML =
      '<p>A new version of Live a Life is ready.</p><button type="button" class="hud-btn" id="version-refresh">Refresh</button>';
    doc.body?.appendChild(banner);
    banner.querySelector("#version-refresh")?.addEventListener("click", () => {
      globalThis.location?.reload?.();
    });
  }
  banner.hidden = false;
  return true;
}

export function watchForAppUpdate(workerContainer, registration, hooks = {}) {
  if (!workerContainer?.addEventListener) return () => {};
  let hadController = Boolean(workerContainer.controller);
  const onChange = () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    const inGame = hooks.playing ? hooks.playing() : defaultPlaying();
    if (inGame) {
      (hooks.onUpdate ?? (() => showUpdateBanner()))();
      return;
    }
    (hooks.reload ?? (() => reloadForUpdate()))();
  };
  workerContainer.addEventListener("controllerchange", onChange);
  const nudge = (worker) => {
    if (worker && workerContainer.controller) worker.postMessage?.({ type: "SKIP_WAITING" });
  };
  nudge(registration?.waiting);
  registration?.addEventListener?.("updatefound", () => {
    const worker = registration.installing;
    worker?.addEventListener?.("statechange", () => {
      if (worker.state === "installed") nudge(worker);
    });
  });
  try {
    const pending = registration?.update?.();
    pending?.catch?.(() => {});
  } catch {
    // update() is optional in tests and older browsers.
  }
  if (typeof document !== "undefined" && document.addEventListener && registration?.update) {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        try {
          const pending = registration.update();
          pending?.catch?.(() => {});
        } catch {
          // Ignore a missing update implementation.
        }
      }
    });
  }
  return onChange;
}

export function registerServiceWorker(workerContainer = globalThis.navigator?.serviceWorker, hooks = {}) {
  if (!workerContainer?.register) return Promise.resolve(null);
  return workerContainer
    .register("./sw.js", { scope: "./" })
    .then((registration) => {
      watchForAppUpdate(workerContainer, registration, hooks);
      return registration;
    })
    .catch(() => null);
}

export function mountInstallTip(root, options = {}) {
  const tip = root?.querySelector?.("#install-tip");
  if (!tip) return false;
  const standalone = options.standalone ?? isStandaloneDisplay(options.window ?? globalThis);
  const storage = options.storage ?? globalThis.localStorage;
  const ua = options.userAgent ?? globalThis.navigator?.userAgent ?? "";
  const nav = options.navigator ?? globalThis.navigator ?? {};
  if (isIosSafari(ua, nav)) {
    tip.hidden = true;
    return false;
  }
  if (!shouldShowInstallTip({ standalone, dismissed: installTipWasDismissed(storage) })) {
    tip.hidden = true;
    return false;
  }
  const how = tip.querySelector(".install-how");
  if (how) how.textContent = installHowText(options.userAgent ?? globalThis.navigator?.userAgent ?? "");
  tip.hidden = false;
  tip.querySelector("#install-tip-ok")?.addEventListener("click", () => {
    dismissInstallTip(storage);
    tip.hidden = true;
  });
  return true;
}

export function mountIosInstallCard(doc, options = {}) {
  const card = doc?.querySelector?.("#ios-install-card") ?? doc?.getElementById?.("ios-install-card");
  if (!card) return false;
  const ua = options.userAgent ?? globalThis.navigator?.userAgent ?? "";
  const nav = options.navigator ?? globalThis.navigator ?? {};
  const standalone = options.standalone ?? isStandaloneDisplay(options.window ?? globalThis);
  const storage = options.storage ?? globalThis.localStorage;
  const iosSafari = options.iosSafari ?? isIosSafari(ua, nav);
  if (!shouldShowIosInstallCard({ iosSafari, standalone, dismissed: iosInstallWasDismissed(storage) })) {
    card.hidden = true;
    return false;
  }
  card.hidden = false;
  card.querySelector("#ios-install-dismiss")?.addEventListener("click", () => {
    dismissIosInstall(storage);
    card.hidden = true;
  });
  return true;
}

const GESTURE_SCROLL_SELECTOR = "input, textarea, select, .sheet";
const GESTURE_FIELD_SELECTOR = "input, textarea, select";

export function lockDocumentGestures(doc = globalThis.document) {
  if (!doc?.addEventListener) return false;
  const allowScroll = (event) => event.target?.closest?.(GESTURE_SCROLL_SELECTOR);
  const allowField = (event) => event.target?.closest?.(GESTURE_FIELD_SELECTOR);
  doc.addEventListener(
    "touchmove",
    (event) => {
      if (allowScroll(event)) return;
      event.preventDefault?.();
    },
    { passive: false },
  );
  for (const type of ["gesturestart", "gesturechange"]) {
    doc.addEventListener(
      type,
      (event) => {
        event.preventDefault?.();
      },
      { passive: false },
    );
  }
  for (const type of ["contextmenu", "selectstart"]) {
    doc.addEventListener(type, (event) => {
      if (allowField(event)) return;
      event.preventDefault?.();
    });
  }
  return true;
}
