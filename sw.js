const CACHE_NAME = "site-report-cache-v1";
const CORE_ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigation/API calls, cache-first for static core assets.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isCoreAsset = CORE_ASSETS.some((a) => url.pathname.endsWith(a.replace("./", "")));

  if (isCoreAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // All other requests (Supabase API, fonts, CDN scripts) go straight to network.
});
