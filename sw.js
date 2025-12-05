// sw.js
const CACHE_NAME = 'web-micropython-v1';
const ASSETS = [
  '/',             // 根路径
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // 如果有本地图标文件也加上：
  // '/icon-192.png',
  // '/icon-512.png',
  // 还有你将来自己下载到本地的 js / css
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});
