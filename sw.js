const cacheName = "cache-simples-v1"; // É uma boa prática versionar o nome do cache
const preCache = [
  "./", // Adiciona a raiz para garantir que a página principal funcione
  "./index.html",
  "./cat.webp",
];

// 1. Instalação do Service Worker e Cache dos arquivos
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...");
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("Service Worker: Adicionando arquivos ao cache");
      return cache.addAll(preCache);
    })
  );
  self.skipWaiting();
});

// 2. Ativação do Service Worker e Limpeza de caches antigos
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Ativando...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== cacheName) {
            console.log("Service Worker: Limpando cache antigo:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// 3. Interceptação de requisições para servir do cache (estratégia Cache First)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      const url = new URL(event.request.url);

      // serve the cat SVG from the cache if the request is
      // same-origin and the path is '/dog.webp'
      if (url.origin == location.origin && url.pathname == '/dog.webp') {
        return caches.match('/cat.webp').then((catResponse) => {
          if (catResponse) {
            return catResponse; // se achar o cat.webp, retorna
          }
          // senão, segue o fluxo normal (response ou fetch)
          return response || fetch(event.request);
        });
      }

      // Se o recurso estiver no cache, retorna do cache.
      // Senão, faz a requisição à rede.     
      return response || fetch(event.request);
    })
  );
});

 // Estratégia: Network First com fallback no cat.webp
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     (function() {
//       const url = new URL(event.request.url);

//       if (url.origin === location.origin && url.pathname === '/dog.webp') {
//         // tenta buscar dog.webp da rede
//         return fetch(event.request).then(
//           function(response) {
//             return response;
//           },
//           function() {
//             // se falhar (offline ou erro), retorna cat.webp do cache
//             return caches.match('/cat.webp');
//           }
//         );
//       }

//       // para outros arquivos → estratégia Cache First
//       return caches.match(event.request).then(function(response) {
//         return response || fetch(event.request);
//       });
//     })()
//   );
// });