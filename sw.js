// Network-first service worker.
// Enables proper "installed app" (standalone) behavior on Android/Chrome,
// while never getting stuck serving an old cached version:
// it always tries the network first, and only falls back to a cached
// copy if the device is offline.

const CACHE_NAME = 'alpha-glass-v1';

self.addEventListener('install', function(event){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event){
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(function(response){
        const copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(function(){
        return caches.match(event.request);
      })
  );
});
