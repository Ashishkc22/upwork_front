// /**
//  * Stores data in the browser cache.
//  * @param {String} cacheName - The name of the cache to store data in.
//  * @param {String} requestKey - The key (URL or identifier) for the cache entry.
//  * @param {Response} response - The response object to store in the cache.
//  */
// export async function storeInCache(cacheName, requestKey, response) {
//   try {
//     const cache = await caches.open(cacheName);
//     await cache.put(requestKey, response);
//     console.log(`Data stored in cache: ${cacheName} - ${requestKey}`);
//   } catch (error) {
//     console.error("Error storing data in cache:", error);
//   }
// }

// /**
//  * Fetches data from the browser cache.
//  * @param {String} cacheName - The name of the cache to fetch data from.
//  * @param {String} requestKey - The key (URL or identifier) for the cache entry.
//  * @returns {Response|null} - The cached response or null if not found.
//  */
// export async function fetchFromCache(cacheName, requestKey) {
//   try {
//     const cache = await caches.open(cacheName);
//     const cachedResponse = await cache.match(requestKey);
//     if (cachedResponse) {
//       console.log(`Data fetched from cache: ${cacheName} - ${requestKey}`);
//       return cachedResponse;
//     }
//     console.log(`No cache match found for: ${requestKey}`);
//     return null;
//   } catch (error) {
//     console.error("Error fetching data from cache:", error);
//     return null;
//   }
// }

// function convertBlobToBase64(blob) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();

//     reader.onloadend = () => {
//       resolve(reader.result);
//     };

//     reader.onerror = reject;

//     reader.readAsDataURL(blob);
//   });
// }

// export async function cacheImageData(url, imageImage) {
//   if (url) {
//   }
// }

// export async function getMyCacheImages(urls = []) {
//   if (urls.length) {
//     const imageUrls = {};
//     for (let url of urls) {
//       const imageImage = url.split("/")?.[2] || url;
//       const imageDataUrl = await fetchFromCache("my-image-cache", imageImage);
//       if (!imageDataUrl) {
//         const response = await fetch(url);
//         const v = await response.blob();
//         const imageUrl = await convertBlobToBase64(v);
//         if (response.ok) {
//           imageUrls[imageImage] = imageUrl;
//           storeInCache("my-image-cache", imageImage, imageUrl);
//         }
//       }
//     }
//     return imageUrls;
//   }
// }

// export async function loadFontFromCache(fontUrl) {
//   if ("caches" in window) {
//     try {
//       const cache = await caches.open("font-cache-v1");
//       const cachedResponse = await cache.match(fontUrl);
//       if (cachedResponse) {
//         return cachedResponse.url;
//       }
//       // If the font isn't in the cache, fetch it from the network
//       const response = await fetch(fontUrl);
//       cache.put(fontUrl, response.clone());
//       return response.url;
//     } catch (error) {
//       console.error("Error fetching font from cache:", error);
//       return fontUrl; // Fallback to the original URL
//     }
//   }
//   return fontUrl;
// }

// export async function cacheGoogleFont(fontUrl) {
//   if ("caches" in window) {
//     try {
//       const cache = await caches.open("font-cache-v1");
//       const cachedResponse = await cache.match(fontUrl);
//       if (cachedResponse) {
//         return cachedResponse.text();
//       }

//       const response = await fetch(fontUrl);
//       const cssText = await response.text();

//       // Find and cache the font files referenced in the CSS
//       const fontUrls = Array.from(cssText.matchAll(/url\(([^)]+)\)/g)).map(
//         (match) => match[1]
//       );

//       await Promise.all(
//         fontUrls.map(async (url) => {
//           const absoluteUrl = new URL(url, fontUrl).href;
//           const fontResponse = await fetch(absoluteUrl);
//           cache.put(absoluteUrl, fontResponse);
//         })
//       );

//       cache.put(
//         fontUrl,
//         new Response(cssText, { headers: { "Content-Type": "text/css" } })
//       );
//       return cssText;
//     } catch (error) {
//       console.error("Error caching Google Fonts:", error);
//       return null;
//     }
//   }
//   return null;
// }
