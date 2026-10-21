/*
 * This service worker intentionally unregisters itself.
 *
 * Earlier preview versions cached application assets. During a deployment,
 * those workers could serve stale HTML in place of JavaScript, producing an
 * "Unexpected token '<'" syntax error and leaving the page blank.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith('dayframe-shell-'))
            .map(key => caches.delete(key)),
        ),
      )
      .then(() => self.registration.unregister()),
  );
});

self.addEventListener('fetch', () => {
  // Do not intercept requests. The browser or hosting server should provide
  // the current application assets.
});