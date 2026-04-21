const CACHE = "speedometer-hud-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js"
];
const EXTERNAL_ASSETS = [
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-solid-900.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      await cache.addAll(APP_SHELL);
      await Promise.allSettled(EXTERNAL_ASSETS.map(async url => {
        const req = new Request(url, { mode: "no-cors" });
        const res = await fetch(req);
        await cache.put(req, res);
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
