const CACHE = "live-a-life-shell-2a1185fb";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./qr-play.png",
  "./splash/apple-splash-750x1334.png",
  "./splash/apple-splash-1334x750.png",
  "./splash/apple-splash-1242x2208.png",
  "./splash/apple-splash-2208x1242.png",
  "./splash/apple-splash-1125x2436.png",
  "./splash/apple-splash-2436x1125.png",
  "./splash/apple-splash-828x1792.png",
  "./splash/apple-splash-1792x828.png",
  "./splash/apple-splash-1170x2532.png",
  "./splash/apple-splash-2532x1170.png",
  "./splash/apple-splash-1179x2556.png",
  "./splash/apple-splash-2556x1179.png",
  "./splash/apple-splash-1284x2778.png",
  "./splash/apple-splash-2778x1284.png",
  "./splash/apple-splash-1290x2796.png",
  "./splash/apple-splash-2796x1290.png",
  "./splash/apple-splash-1206x2622.png",
  "./splash/apple-splash-2622x1206.png",
  "./splash/apple-splash-1320x2868.png",
  "./splash/apple-splash-2868x1320.png",
  "./assets/index-CMe1Nn6j.js",
  "./assets/index-Dd4j7Gnc.css",
  "./assets/start-Ch6HknWo.js",
  /*__PRECACHE__*/
];

async function putShell(cache) {
  await Promise.all(
    SHELL.map(async (url) => {
      const response = await fetch(url, { cache: "reload" });
      if (!response || !response.ok) throw new Error(url);
      await cache.put(url, response.clone());
      if (response.url) await cache.put(response.url, response);
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => putShell(cache))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const navigation = event.request.mode === "navigate" || url.pathname.endsWith("/");

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await caches.match(event.request);
      if (cached && !navigation) return cached;
      try {
        const response = await fetch(event.request);
        if (response && response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        if (cached) return cached;
        if (navigation) {
          const shell = (await caches.match("./index.html")) || (await caches.match("./"));
          if (shell) return shell;
        }
        throw error;
      }
    })(),
  );
});
