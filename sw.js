// service-worker.js

// Única fuente de verdad de la versión. Al cambiarla, se actualiza
// el chip del banner y se invalida la caché antigua automáticamente.
const VERSION = 'v1.2';
const CACHE_NAME = `logic-generator-${VERSION}`;
const urlsToCache = [
  './',
  './index.html',
  // Agrega aquí otros recursos si los tienes (CSS, JS externos, etc.)
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  self.skipWaiting(); // activar la nueva versión inmediatamente tras instalarse
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar solicitudes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - devolver respuesta
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activar y limpiar cache viejo
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1 && cacheName.startsWith('logic-generator-')) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // tomar el control de la página inmediatamente
  );
});

// Responder con la versión actual cuando la página la solicita
// (usado por el chip del banner en index.html)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_VERSION') {
    const port = event.ports && event.ports[0];
    if (port) {
      port.postMessage({ version: VERSION, cache: CACHE_NAME });
    }
  }
});
