// =====================================================
// SERVICE WORKER - Repuestos Electromecánicos PWA
// =====================================================
// Este archivo activa el botón "Instalar app" en Chrome.
// También guarda la app en caché para que cargue más rápido.

const CACHE_NAME = 'repuestos-v2'; // ← subido de v1 a v2 a propósito: fuerza a limpiar el caché viejo que se había llenado

// Archivos que se guardan offline
const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Al instalar: guardar archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARCHIVOS_CACHE).catch(() => {
        // Si algún archivo falla, continuar igual
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Al activar: limpiar cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Al pedir recursos: intentar red primero, luego caché
self.addEventListener('fetch', event => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  // Solo intervenimos en archivos de nuestro propio sitio (html/js/css/imágenes propias).
  // Todo lo que va a Firebase, Firestore, Cloudinary, Google APIs, etc. pasa directo a la red
  // SIN intentar guardarlo en caché — eso es lo que llenaba la cuota y colgaba el login.
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia en caché, pero si no entra (cuota llena) no rompemos la respuesta
        const copia = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia)).catch(() => {});
        return response;
      })
      .catch(() => {
        // Sin internet: devolver desde caché
        return caches.match(event.request);
      })
  );
});
