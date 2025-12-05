// sw.js
const CACHE_NAME = 'web-micropython-v1';

// 把你运行 IDE 必须的资源都列出来
const ASSETS = [
  './',
  './index.html',
  './favicon.ico',

  // 远程 CDN 资源（必须先在线成功访问一次，才会被缓存）
  'https://cdn.jsdelivr.net/npm/xterm@5.1.0/lib/xterm.js',
  'https://cdn.jsdelivr.net/npm/xterm@5.1.0/css/xterm.css',
  'https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.7.0/lib/xterm-addon-fit.js',
  'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.2/ace.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module'
];

// 安装阶段：预缓存所有资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll 里任何一个失败都会导致整个 install 失败，
      // 所以可以根据需要删掉有问题的 URL
      return cache.addAll(ASSETS);
    })
  );
  // 立刻接管旧版本
  self.skipWaiting();
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截：优先用缓存，没有就走网络，网络失败再兜底
self.addEventListener('fetch', event => {
  const req = event.request;

  // 对导航请求（HTML）单独处理，确保离线启动时至少能拿到 index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => {
        return cached || fetch(req);
      })
    );
    return;
  }

  // 其它请求：cache-first
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req)
        .then(resp => {
          // 在线时把新资源也塞进缓存（可选）
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, copy);
          });
          return resp;
        })
        .catch(() => {
          // 没缓存、没网络就算了，可在这里做备用处理
          return new Response('Offline and no cached version available', {
            status: 503,
            statusText: 'Offline'
          });
        });
    })
  );
});
