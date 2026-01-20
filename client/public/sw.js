const CACHE_NAME = "nexus-os-v1";
const URLS_TO_CACHE = ["/", "/index.html", "/manifest.json", "/vite.svg"];

// Install: Cache Core Files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// Activate: Clean Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch: Network First, Fallback to Cache
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests (like API calls to Supabase/Backend for now)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network works, cache the fresh copy
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // If network fails, return cached version
        return caches.match(event.request);
      }),
  );
});
