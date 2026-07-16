// Service Worker: сеть в приоритете для HTML и JS/CSS-бандлов (у них
// хэш в имени файла меняется при каждой сборке), кэш — только запасной
// вариант на случай отсутствия интернета. Раньше кэш был "агрессивным"
// (cache-first) и после каждого обновления сайта показывал СТАРУЮ версию
// со ссылками на уже несуществующие файлы сборки — отсюда белый экран.

const CACHE_VERSION = "v2";
const CACHE_NAME = `qed-math-space-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
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
  const url = event.request.url;

  // Supabase / API — всегда только сеть, никогда не кэшируем
  if (url.includes("supabase.co") || url.includes("/api/")) {
    return;
  }

  // Навигация (сама HTML-страница) и файлы сборки (/assets/...) —
  // "сеть первой": пробуем свежую версию, кэш используем только если
  // интернета совсем нет. Это и есть исправление белого экрана.
  const isNavigation = event.request.mode === "navigate";
  const isBuildAsset = url.includes("/assets/");

  if (isNavigation || isBuildAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Остальное (иконки, манифест и т.п.) — кэш первым, это безопасно,
  // так как такие файлы меняются редко.
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
