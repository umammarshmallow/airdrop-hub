/* ==========================================
   AIRDROP HUB — MINIMAL SERVICE WORKER
   Only exists to satisfy PWA installability
   (Chrome requires a registered SW with a
   fetch handler before it fires the native
   "Add to Home Screen" prompt).
========================================== */

const CACHE_NAME = "airdrop-hub-shell-v6";

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );

});

self.addEventListener("activate", (event) => {

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );

  self.clients.claim();

});

self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );

});
