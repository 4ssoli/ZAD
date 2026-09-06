/* ============================================================
   ZAD — service worker
   Makes the site usable without a connection, which matters for
   students on weak or metered internet.

   Strategy
     pages and code    cache first, then refresh in the background
                       (stale-while-revalidate) so moving between
                       the quiz, the glossary and the home page is
                       instant instead of waiting on the network
     PDFs and images   cache first, they never change under a name
     Supabase and CDN  never cached, always live

   The trade-off of stale-while-revalidate: right after you deploy,
   a returning visitor sees the previous version for one load and
   the new one from the next navigation onwards.

   IMPORTANT — bump CACHE_VERSION on every deploy.
   Changing this string is what tells the browser a new worker
   exists: it installs, deletes the old cache, takes over, and
   shell.js reloads the page once so the visitor sees the new
   build straight away. Leave the number alone and returning
   visitors can keep the previous version for a load or two.
   ============================================================ */
const CACHE_VERSION = 'zad-v4';
const SHELL = [
  './',
  'index.html',
  'quiz.html',
  'glossary.html',
  'dashboard.html',
  'signin.html',
  'manifest.json',
  'assets/icon.svg',
  'assets/css/zad.css',
  'assets/js/config.js',
  'assets/js/supabase.js',
  'assets/js/i18n.js',
  'assets/js/data.js',
  'assets/js/stats.js',
  'assets/js/resources.js',
  'assets/js/quiz-data.js',
  'assets/js/criteria.js',
  'assets/js/glossary.js',
  'assets/js/ui.js',
  'assets/js/auth.js',
  'assets/js/userdata.js',
  'assets/js/shell.js',
  'assets/js/sheets.js',
  'assets/js/app-home.js',
  'assets/js/app-quiz.js',
  'assets/js/app-glossary.js',
  'assets/js/app-dashboard.js',
  'assets/js/app-signin.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // addAll fails the whole install if one file 404s, so add them
      // one by one and let any single miss pass quietly.
      .then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Anything off-origin (Supabase, the CDN bundle, Google Fonts) goes
  // straight to the network: caching auth calls would be wrong.
  if (url.origin !== self.location.origin) return;

  const isAsset = /\.(pdf|png|jpg|jpeg|svg|webp|woff2?)$/i.test(url.pathname);

  if (isAsset) {
    // cache first — a PDF never changes under the same name
    event.respondWith(
      caches.match(request).then(hit => hit || fetch(request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(request, copy));
        return res;
      }).catch(() => hit))
    );
    return;
  }

  /* Pages and code: answer from the cache immediately when we have it, and
     refresh the copy in the background for next time. This is what makes
     switching pages feel instant rather than a fresh download each time. */
  event.respondWith(
    caches.match(request).then(hit => {
      const network = fetch(request)
        .then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(request, copy));
          }
          return res;
        })
        .catch(() => null);

      // cached copy now, network update behind it
      if (hit) return hit;

      return network.then(res => res || offlineFallback(request));
    })
  );
});

/* Netlify serves this site with Pretty URLs, so a link can arrive as "/quiz"
   with no extension. Offline, look for the ".html" file we actually cached
   before giving up and showing the home page. */
function offlineFallback(request) {
  const path = new URL(request.url).pathname.replace(/^\//, '') || 'index.html';
  const candidates = [
    path,
    path + '.html',
    path.replace(/\/$/, '') + '/index.html',
    'index.html',
  ];
  return caches.open(CACHE_VERSION).then(cache =>
    candidates.reduce(
      (chain, name) => chain.then(res => res || cache.match(name)),
      Promise.resolve(null)
    ).then(res => res || new Response(
      '<h1>غير متصل · Offline</h1><p>افتح الصفحة مرة واحدة وأنت متصل ليتم حفظها.</p>',
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    ))
  );
}
