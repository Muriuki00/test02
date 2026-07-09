// Sales Tracker Service Worker
// Increment this version number every time you push an update to GitHub
var VERSION = 'v3';
var CACHE = 'sales-tracker-' + VERSION;

// On install — cache the app
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(['./', './index.html']);
    })
  );
  self.skipWaiting();
});

// On activate — delete old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// On fetch — network first, fall back to cache
// This means: always try to get the latest from GitHub first.
// If offline, serve the cached version so the app still works.
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // Got a fresh response — update the cache silently
        var copy = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, copy);
        });
        return response;
      })
      .catch(function() {
        // Offline — serve from cache
        return caches.match(e.request);
      })
  );
});
