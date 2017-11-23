// todo: en modo offline mostrar una aviso al usuario
// todo: 'install' event is for old caches deletion. use it?
// todo: split URIS_TO_CACHE into two arrays for easy configuration and merge them
// todo: use es6

var CACHE_NAME = 'wca';

var URIS_TO_CACHE = [

  '/',
  'index.html',
  'https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20Lugar,%20Concejo,%20Imagen%20,Categoria,%20rowid,%20latitud,%20longitud%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps&callback=angular.callbacks._0',

  // CSS
  'lib/ionic/ionic.min.1.3.3.css',
  'css/styles.css',

  // SCRIPTS
  'lib/ionic/ionic.bundle.min.1.3.3.js',
  'js/app.js',
  'js/services.js',
  'js/controllers.js',
  'js/directives.js',
  'lib/jquery/jquery-3.2.1.min.js',
  'lib/jquery/jquery.panzoom.3.1.1.min.js',
  'lib/libgif-js/libgif.js',
  'wca-sw.js',

  // TEMPLATES
  'templates/buscar.html',
  'templates/detalle.html',
  'templates/gif-player.html',
  'templates/heatmap.html',
  'templates/listado.html',
  'templates/detalle-mapa.html',
  'templates/mapa-global.html',
  'templates/menu.html',
  'templates/meteo.html',
  'templates/meteo-detalle.html',
  'templates/detalle-img.html',
  'templates/detalle-meteoblue.html',
  'templates/mosaico.html',
  'templates/popover.html',
  'templates/por_categoria.html',
  'templates/por_concejo.html',
  'templates/stats.html',
  'templates/detalle-streetview.html',
  'templates/windy.html',

  // IMAGES
  'img/bckgrnd6.jpg',
  'img/clock.png',
  'img/eu.png',
  'img/icon-river.png',
  'img/imgFail.png',
  'img/offline-img.png',
  'img/map3.png',
  'img/red-marker.png',
  'img/spain2.png',
  'img/loader/6.gif',
  'res/36x36.png',

  // FONTS
  'lib/fonts/ionicons.svg?v=2.0.1',
  'lib/fonts/ionicons.eot?v=2.0.1',
  'lib/fonts/ionicons.ttf?v=2.0.1',
  'lib/fonts/ionicons.woff?v=2.0.1',

  // RESOURCES
  'manifest.json',
  'favicon.png'

];

// Url containing this strings will be bypassed by the service worker. They wont be served through the sw.
var WHITE_LIST = ['wewebcams', 'openweather', 'meteociel', 'meteogram'];

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