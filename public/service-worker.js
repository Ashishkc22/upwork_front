// const CACHE_NAME = "my-cache-v1";
// const IMAGE_CACHE_NAME = "image-cache-v1";
// const FONT_CACHE_NAME = "font-cache-v1";
// const urlsToCache = [
//   "/v1cardImages/support.png",
//   "/v1cardImages/cardLogo.png",
//   "/v1cardImages/phone.png",
//   "/v1cardImages/loc.png",
//   "/v1cardImages/waterMark.png",
//   "/fonts/Poppins-Light.ttf",
//   "/fonts/Poppins-Regular.ttf",
//   "/fonts/Poppins-Light.ttf",
//   "/fonts/Poppins-Regular.ttf",
// ];

// // Install the service worker and cache assets
// self.addEventListener("install", (event) => {
//   console.info("Install even");
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
//   );
// });

// // Fetch event handler to serve cached assets
// self.addEventListener("fetch", (event) => {
//   const requestUrl = new URL(event.request.url);
//   // Check if the request is for an image
//   if (requestUrl.pathname.startsWith("/v1cardImages")) {
//     event.respondWith(
//       caches.open(IMAGE_CACHE_NAME).then((cache) => {
//         return cache.match(event.request).then((cachedResponse) => {
//           if (cachedResponse) {
//             return cachedResponse;
//           }
//           return fetch(event.request).then((networkResponse) => {
//             // Cache the new image
//             cache.put(event.request, networkResponse.clone());
//             return networkResponse;
//           });
//         });
//       })
//     );
//   } else if (requestUrl.pathname.startsWith("/fonts")) {
//     event.respondWith(
//       caches.open(FONT_CACHE_NAME).then((cache) => {
//         return cache.match(event.request).then((cachedResponse) => {
//           if (cachedResponse) {
//             return cachedResponse;
//           }
//           return fetch(event.request).then((networkResponse) => {
//             // Cache the new font
//             cache.put(event.request, networkResponse.clone());
//             return networkResponse;
//           });
//         });
//       })
//     );
//   } else {
//     event.respondWith(
//       caches
//         .match(event.request)
//         .then((response) => response || fetch(event.request))
//     );
//   }
// });

// // Activate event handler to clean up old caches
// self.addEventListener("activate", (event) => {
//   console.log("Active event");

//   const cacheWhitelist = [CACHE_NAME, IMAGE_CACHE_NAME];
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (!cacheWhitelist.includes(cacheName)) {
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });
