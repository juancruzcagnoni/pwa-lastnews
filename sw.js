const cacheName = "pwa-parcial-1-dwm3ap-cagnoni-juancruz";
const assets = [
  "index.html",
  "css/style.css",
  "js/main.js",
  "manifest.json",
  "img/icon-192x192.png",
  "img/icon-256x256.png",
  "img/icon-384x384.png",
  "img/icon-512x512.png",
  "img/logo.png",
  "img/main.png",
];

self.addEventListener("install", (event) => {
  console.log("El SW se instaló");
  // Permite que el Service Worker tome el control de la aplicación de inmediato.
  self.skipWaiting();

  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      // Precachea los archivos especificados en el array 'assets'.
      cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("El SW se activó");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
        // Filtra los cachés antiguos que no coinciden con 'cacheName'.
          .filter((name) => name !== cacheName)
          // Elimina los cachés antiguos en paralelo.
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Si se encuentra una coincidencia en el caché, se devuelve la respuesta del caché.
        return response;
      } else {
        return fetch(event.request).catch(() => {
          // Si no hay conexión a internet, se devuelve la página "index.html" desde el caché.
          return caches.match("index.html");
        });
      }
    })
  );
});
