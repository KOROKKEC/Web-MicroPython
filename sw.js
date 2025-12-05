// sw.js

// 每次改缓存内容就改一下这个版本号，避免旧缓存干扰
const CACHE_NAME = 'web-micropython-v3';

// 需要静态缓存的资源列表（全部同域）
const ASSETS = [
  '/',            // 根路径
  '/index.html',  // 你的主页面
  '/favicon.ico'  // 根目录的 128x128 图标
];

// 安装阶段：预缓存上面的静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// 激活阶段：清理旧版本缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// 拦截请求：优先使用缓存，没有就走网络
self.addEventListener('fetch', event => {
  // 只处理 GET 请求，其他直接放行
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      // 命中缓存则直接返回，否则走网络
      return cached || fetch(event.request);
    })
  );
});
