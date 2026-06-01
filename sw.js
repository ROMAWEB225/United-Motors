const CACHE_NAME = "sav-fleet-v2";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",
];

// Installation : mise en cache des ressources statiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Interception des requêtes : stratégie "Cache d'abord, puis réseau"
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            // Mettre en cache les nouvelles ressources (optionnel)
            if (
              event.request.url.startsWith(self.location.origin) ||
              event.request.url.includes("leaflet") ||
              event.request.url.includes("sheetjs") ||
              event.request.url.includes("html2pdf")
            ) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
            }
            return fetchResponse;
          })
        );
      })
      .catch(() => {
        // Optionnel : retourner une page hors ligne personnalisée
        return caches.match("./index.html");
      }),
  );
});

// Nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});
