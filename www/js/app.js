
var app = angular.module('wca', ['ionic', 'wca.controllers', 'wca.services', 'jett.ionic.filter.bar']);

// Configuracion ======================================================================================================
app.config(function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider,
                 $ionicFilterBarConfigProvider, $logProvider, $httpProvider) {

    // enable/disable debug info
    $compileProvider.debugInfoEnabled(false);
    // remove back button text totally
    $ionicConfigProvider.backButton.previousTitleText(false).text(' ');
    // enable/disable native scroll
    if (!ionic.Platform.isIOS()) {
      $ionicConfigProvider.scrolling.jsScrolling(false);
    }
    // filterbar config
    $ionicFilterBarConfigProvider.placeholder('Buscar');
    $ionicFilterBarConfigProvider.transition('vertical');
    // num templates to prefetch
    $ionicConfigProvider.templates.maxPrefetch(0);
    // disable angular log system
    $logProvider.debugEnabled(false);
    // disable state transitions
    // $ionicConfigProvider.views.transition('none');
    // nav bar title position for all platforms
    $ionicConfigProvider.navBar.alignTitle('center');
    $httpProvider.useApplyAsync(true);

// Estados ------------------------------------------------------------------------------------------------------------

  $stateProvider.state('app', {
    url: '/app', abstract: true, templateUrl: 'templates/menu.html'
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.mapa', {
    url: '/mapa',
    cache: false,
    views: {'menuContent': {templateUrl: 'templates/mapa.html', controller: 'MapaCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.mapaglobal', {
    url: '/mapaglobal',
    cache: false,
    views: {'menuContent': {templateUrl: 'templates/mapa-global.html', controller: 'MapaGlobalCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.streetview', {
    url: '/streetview',
    cache: false,
    views: {'menuContent': {templateUrl: 'templates/streetview.html', controller: 'StreetViewCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.detalle', {
    url: '/detalle/:rowid',
    cache: true,
    views: {'menuContent': {templateUrl: 'templates/detalle.html', controller: 'DetalleCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.gif-player', {
    url: '/gif-player/:id_item_meteo',
    cache: false,
    views: {'menuContent': {templateUrl: 'templates/gif-player.html', controller: 'GifPlayerCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.meteo', {
    url: '/meteo',
    cache: true,
    views: {'menuContent': {templateUrl: 'templates/meteo.html', controller: 'MeteoCtrl'}
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.meteo-detalle', {
    url: '/meteo-detalle/:id_item_meteo',
    cache: false,
    views: {'menuContent': {templateUrl: 'templates/meteo-detalle.html', controller: 'MeteoDetalleCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.stats', {
    url: '/stats',
    cache: true,
    views: {'menuContent': {templateUrl: 'templates/stats.html'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.heatmap', {
    url: '/heatmap',
    cache: true,
    views: {'menuContent': {templateUrl: 'templates/heatmap.html'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.por_categoria', {
    url: '/por_categoria',
    cache: true,
    views: {'menuContent': {templateUrl: 'templates/por_categoria.html', controller: 'PorCategoriaCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.por_concejo', {
    url: '/por_concejo',
    cache: true,
    views: {'menuContent': {templateUrl: 'templates/por_concejo.html', controller: 'PorConcejoCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.listado', {
    url: '/listado?concejo&idCategoria',
    cache: false,
    views: {'menuContent': {templateUrl: 'templates/listado.html', controller: 'ListadoCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.mosaico', {
    url: '/mosaico?concejo&idCategoria',
    cache: true,
    views: {'menuContent': {templateUrl: 'templates/mosaico.html', controller: 'ListadoCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.viento', {
    url: '/viento',
    cache: true,
    views: {'menuContent': {templateUrl: 'templates/viento.html',controller: 'VientoCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.buscar', {
    url: '/buscar',
    cache: false,
    views: {'menuContent': {templateUrl: 'templates/buscar.html', controller: 'BuscarCtrl'}}
  });
// -------------------------------------------------------------------------------------------------------------------

  $urlRouterProvider.otherwise('app/listado?idCategoria=7');

});
// Inicializaciones ===================================================================================================
app.run(function($ionicPlatform, $rootScope, $window) {

  // halla anchura de pantalla para dibujar o no menu-button en ion-nav-bar (en 'menu.html')
  ionic.on('resize', function(){
    $rootScope.$apply(function(){
      $rootScope.screenWidth = $window.innerWidth;
      // console.log('resize event', $rootScope.screenWidth);
    })
  });
  $rootScope.screenWidth = $window.innerWidth;

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    // if (window.StatusBar) {
    //   org.apache.cordova.statusbar required
    //   StatusBar.styleDefault();
    //   ionic.Platform.isFullScreen = true;
    // }
  });

});

