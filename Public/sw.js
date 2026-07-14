// Простой Service Worker: кэширует статику сайта, чтобы приложение
// открывалось быстрее и частично работало даже при плохом интернете.
// Это НЕ полноценный офлайн-режим (данные всё равно берутся из Supabase),
// но обязательное условие для установки сайта как приложения.

const CACHE_NAME = "qed-math-space-v1";
const PRECACHE_URLS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Не кэшируем запросы к Supabase/API — там всегда нужны свежие данные
  if (event.request.url.includes("supabase.co") || event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      );
    })
  );
});
