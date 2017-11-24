// todo: en modo offline mostrar una aviso al usuario
// todo: 'install' event is for old caches deletion. use it?

var CACHE_NAME = 'wca';
// Urls containing this strings will be bypassed by the service worker. They wont be served through the sw.
var WHITE_LIST = ['wewebcams', 'openweather', 'meteociel', 'meteogram'];

if( 'undefined' === typeof window){
  importScripts('uris-to-cache.js');
}

/** --------------------------------------------------------------------------------------------------------------------
 * Service worker registration
 */
if ('serviceWorker' in navigator) {
  // navigator.serviceWorker.register('wca-sw.js', {scope: '/Webcams_de_Asturias/www/'}).then(function() {
  navigator.serviceWorker.register('wca-sw.js').then(function(registration) {
    // console.log('sw: registration ok, scope: ', registration.scope);
  }).catch(function(err) {
    console.error(err);
  });
}
/** --------------------------------------------------------------------------------------------------------------------
 * 'Install' event. Writing files to browser cache
 *
 * @param {string} Event name ('install')
 * @param {function} Callback function with event data
 *
 */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        // console.log('sw: installing files into cache');
        return cache.addAll(URIS_TO_CACHE);
      })
      .then(function () {
        return self.skipWaiting();
      })
  )
});
/** --------------------------------------------------------------------------------------------------------------------
 * 'Activate' event. Service worker is activated
 *
 * @param {string} Event name ('activate')
 * @param {function} Callback function with event data
 *
 */
self.addEventListener('activate', function (event) {
  // A call to claim() forces a "controllerchange" event on serviceWorker
  event.waitUntil(self.clients.claim());
  console.info('sw: service worker installed and activated');
});
/** --------------------------------------------------------------------------------------------------------------------
/**
 * Helper fn. If a url is in WHITE_LIST then avoid loading it through the service worker
 * Avoids CORS problems

 * @param url
 * @returns {boolean}
 */
var isInWhiteList = function (url) {
  var i;
  for (i = 0; i < WHITE_LIST.length; i++) {
    if (url.indexOf(WHITE_LIST[i]) > -1) {
      return true;
    }
  }
}
/** --------------------------------------------------------------------------------------------------------------------
 * 'Fetch' event. Browser tries to get resources making a request
 *
 * @param {string} Event name ('fetch')
 * @param {function} Callback function with event data
 *
 */
self.addEventListener('fetch', function(fetchEvent) {
  var request = fetchEvent.request;
  var url = request.url;
  // todo: Refactorizar las peticiones a imagenes para evitar ser controladas por el service worker
  // todo: averiguar si se esta offline

  if (isInWhiteList(url)) {
    return;
  }

  fetchEvent.respondWith(
    // test if the request is cached
    caches.match(request)
      .then(function(response) {
        if(response){
          // 1) if request is cached, response will be returned from browser cache
          // console.log('request is cached: ', fetchEvent.request.url);
          return response;
        } else {
          // 2) if request is not cached, fetch response from network
          // console.log('request is not cached: ', fetchEvent.request.url);
          return fetch(request /* ,{mode: 'no-cors'} */)
        }
      })
      .catch(function (error) {
        // if request is not cached nor network available, return fallback page
        // console.log('caches.match() error: ', error);
        return caches.match('index.html');
      })
  )
});
