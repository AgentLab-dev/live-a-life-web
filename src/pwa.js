export const INSTALL_TIP_KEY = "live-a-life-install-tip";

export function isStandaloneDisplay(win = globalThis) {
  return Boolean(win.matchMedia?.("(display-mode: standalone)")?.matches || win.navigator?.standalone);
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

export function installHowText(ua = "") {
  if (isAppleTouchDevice(ua)) return "iPhone: tap Share, then Add to Home Screen.";
  return "Android: tap Install app or Add to Home Screen.";
}

export function registerServiceWorker(workerContainer = globalThis.navigator?.serviceWorker) {
  if (!workerContainer?.register) return Promise.resolve(null);
  return workerContainer.register("./sw.js").catch(() => null);
}

export function mountInstallTip(root, options = {}) {
  const tip = root?.querySelector?.("#install-tip");
  if (!tip) return false;
  const standalone = options.standalone ?? isStandaloneDisplay(options.window ?? globalThis);
  const storage = options.storage ?? globalThis.localStorage;
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
