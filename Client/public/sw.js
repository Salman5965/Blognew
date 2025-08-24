/**
 * Service Worker for SilentVoice - Performance & Caching
 */

const CACHE_NAME = "SilentVoice-v1";
const STATIC_CACHE = "SilentVoice-static-v1";
const DYNAMIC_CACHE = "SilentVoice-dynamic-v1";
const API_CACHE = "SilentVoice-api-v1";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/images/placeholder.jpg",
  "/images/default-avatar.png",
  "/images/default-cover.jpg",
];

// API endpoints to cache
const API_ENDPOINTS = ["/api/blogs", "/api/auth/verify", "/api/users/profile"];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE),
    ]),
  );

  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );

  // Take control of all clients
  self.clients.claim();
});

// Fetch event - handle all network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Determine cache strategy based on request type
  let strategy = CACHE_STRATEGIES.NETWORK_FIRST;
  let cacheName = DYNAMIC_CACHE;

  if (isStaticAsset(request)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
    cacheName = STATIC_CACHE;
  } else if (isAPIRequest(request)) {
    strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    cacheName = API_CACHE;
  } else if (isImageRequest(request)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
    cacheName = DYNAMIC_CACHE;
  }

  event.respondWith(handleRequest(request, strategy, cacheName));
});

// Handle requests based on strategy
async function handleRequest(request, strategy, cacheName) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName);

    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName);

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName);

    default:
      return networkFirst(request, cacheName);
  }
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Cache-first strategy failed:", error);

    // Try to return cached version as fallback
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/offline.html");
    }

    return new Response("Network error", { status: 408 });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn("Network request failed, trying cache:", error);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/offline.html");
    }

    return new Response("Offline", { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always try to update cache in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // If no cached version, wait for network
  return fetchPromise;
}

// Utility functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname === "/" ||
    url.pathname === "/index.html"
  );
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith("/api/");
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    request.destination === "image" ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg")
  );
}

// Background sync for failed requests
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log("Background sync triggered");
}

// Push notifications (if needed)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      data: data.data,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

// Message handling from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_URLS") {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.payload);
      }),
    );
  }
});