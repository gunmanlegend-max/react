// Name of the cache storage
const CACHE_NAME = 'gunnarz-ai-cache-v1';

// Assets that the app needs to load when offline
const urlsToCache = [
  '/',
  '/index.html'
];

// The install event prepares the cache when the app is first opened
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache successfully!');
        return cache.addAll(urlsToCache);
      })
  );
});

// The fetch event intercepts network requests to serve cached files when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If the resource is in the cache, return it; otherwise, fetch it from the internet
        return response || fetch(event.request);
      })
  );
});
