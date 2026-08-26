/*
 * Design reminder: the offline layer stays invisible and dependable, matching the calm utility of the training journal.
 */
const CACHE_NAME = "gymapp-shell-v3";
const BASE_URL = self.location.pathname.replace(/sw\.js$/, "");
const APP_SHELL = [
  BASE_URL,
  `${BASE_URL}manifest.json`,
  `${BASE_URL}icon-192.png`,
  `${BASE_URL}icon-512.png`,
  `${BASE_URL}apple-touch-icon.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(BASE_URL));
    }),
  );
});
