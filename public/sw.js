// Service Worker for PWA - Secure caching and offline support

const CACHE_NAME = 'crm-zion-v1';
const urlsToCache = [
  '/manifest.json',
  '/favicon.png'
];

// Install event - cache resources safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url).catch(err => console.log(`Failed to cache ${url}:`, err)))
        );
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache if available, else fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
