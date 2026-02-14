// src/web/sw.ts
var sw = self;
var CACHE_NAME = "math-facts-v2";
var APP_SHELL = [
	"/",
	"/app.js",
	"https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css",
];
sw.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
	);
});
sw.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME)
						.map((key) => caches.delete(key)),
				),
			),
	);
});
sw.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then(
			(cached) =>
				cached ||
				fetch(event.request).then((response) => {
					if (response.ok && event.request.method === "GET") {
						const clone = response.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, clone);
						});
					}
					return response;
				}),
		),
	);
});
