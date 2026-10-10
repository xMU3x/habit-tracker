// =============================================
// SERVICE WORKER — وِرد PWA
// =============================================
const SW_VERSION = 'v1.1.0';
const CACHE_NAME = `werd-cache-${SW_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

// الملفات اللي هتتخزن للشغل أوف لاين
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap'
];

// =============================================
// INSTALL — تخزين الملفات الأساسية
// =============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...', SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching files...');
      // نخزن الملفات المتاحة ونتجاهل اللي مش موجودة
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Could not cache:', url, err))
        )
      );
    }).then(() => {
      console.log('[SW] Installed successfully');
      return self.skipWaiting(); // تفعيل فوري
    })
  );
});

// =============================================
// ACTIVATE — مسح الـ cache القديمة
// =============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...', SW_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('werd-cache-') && name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activated — controlling all clients');
      return self.clients.claim();
    })
  );
});

// =============================================
// FETCH — استراتيجية الشبكة
// =============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات غير HTTP
  if (!request.url.startsWith('http')) return;

  // API calls — Network First (مهم تكون fresh دايمًا)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Google Fonts — Cache First
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // باقي الملفات — Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// =============================================
// استراتيجيات الـ Cache
// =============================================

// Network First: جرب الشبكة أولاً، لو فشلت خد من الـ cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    // لو API فشلت وما فيش cache — return error JSON
    return new Response(JSON.stringify({ error: 'offline', message: 'لا يوجد اتصال بالإنترنت' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache First: خد من الـ cache، لو مش موجود اجيب من الشبكة
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate: اعرض الـ cache فوراً وحدّث في الخلفية
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(async () => {
      // لو الشبكة فشلت وما فيش cache — ارجع صفحة أوف لاين
      if (request.destination === 'document') {
        const offlinePage = await cache.match(OFFLINE_PAGE);
        return offlinePage || new Response('أنت غير متصل بالإنترنت', {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      return new Response('Offline', { status: 503 });
    });

  return cachedResponse || fetchPromise;
}

// =============================================
// PUSH NOTIFICATIONS
// =============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: '☽ وِرد',
    body: 'وصل إشعار جديد',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'werd-reminder',
    renotify: true,
    requireInteraction: false,
    data: { url: '/' }
  };

  try {
    if (event.data) {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    renotify: data.renotify,
    requireInteraction: data.requireInteraction,
    vibrate: [200, 100, 200],
    dir: 'rtl',
    lang: 'ar',
    data: data.data || {},
    actions: [
      { action: 'open', title: '📲 فتح التطبيق' },
      { action: 'dismiss', title: '✕ إغلاق' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// =============================================
// NOTIFICATION CLICK
// =============================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // لو التطبيق مفتوح — ركز عليه
        for (const client of clients) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // لو مش مفتوح — افتح نافذة جديدة
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// =============================================
// BACKGROUND SYNC (لو الحفظ فشل يتبعت لما تعود للنت)
// =============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingSaves());
  }
});

async function syncPendingSaves() {
  // نقرأ العمليات المعلقة من الـ cache ونبعتها
  try {
    const cache = await caches.open('pending-saves');
    const keys = await cache.keys();
    for (const request of keys) {
      const response = await cache.match(request);
      const payload = await response.json();
      try {
        await fetch('/api/data/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        await cache.delete(request);
        console.log('[SW] Synced pending save:', payload.key);
      } catch (e) {
        console.log('[SW] Still offline, will retry later');
      }
    }
  } catch (e) {
    console.error('[SW] Sync failed:', e);
  }
}

// =============================================
// MESSAGE — تواصل مع الـ app
// =============================================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: SW_VERSION });
  }
});

console.log('[SW] Service Worker loaded:', SW_VERSION);
