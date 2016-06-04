
var app = angular.module('wca', ['ionic', 'wca.controllers', 'wca.services', 'jett.ionic.filter.bar'])

// Configuracion ======================================================================================================
app.config(function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider,
                 $ionicFilterBarConfigProvider, $logProvider) {

    // enable/disable debug info
    $compileProvider.debugInfoEnabled(false);
    // remove back button text completely
    $ionicConfigProvider.backButton.previousTitleText(false).text(' ');
    // enable/disable native scroll
    if (!ionic.Platform.isIOS()) {
      $ionicConfigProvider.scrolling.jsScrolling(false);
    }
    $ionicFilterBarConfigProvider.placeholder('Buscar');
    $ionicFilterBarConfigProvider.transition('vertical');
    // num templates to prefetch
    $ionicConfigProvider.templates.maxPrefetch();
    // disable angular log system
    $logProvider.debugEnabled(false);
    $compileProvider.debugInfoEnabled(false);
    // desactivar transiciones de estado
    $ionicConfigProvider.views.transition('none');
    // nav bar title position for all platforms
    $ionicConfigProvider.navBar.alignTitle('center');

// Estados ------------------------------------------------------------------------------------------------------------

  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.mapa', {
    url: '/mapa',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/mapa.html',
        controller: 'MapaCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.mapaglobal', {
    url: '/mapaglobal',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/mapa-global.html',
        controller: 'MapaGlobalCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.streetview', {
    url: '/streetview',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/streetview.html',
        controller: 'StreetViewCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.panoramio', {
    url: '/panoramio',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/panoramio.html',
        controller: 'PanoramioCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.detalle', {
    url: '/detalle/:rowid',
    cache: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/detalle.html',
        controller: 'DetalleCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.gif-player', {
    url: '/gif-player/:id_item_meteo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/gif-player.html',
        controller: 'GifPlayerCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.meteo', {
    url: '/meteo',
    cache: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/meteo.html',
        controller: 'MeteoCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.img-viewer', {
    url: '/img-viewer/:id_item_meteo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/img-viewer.html',
        controller: 'ImgViewerCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.stats', {
    url: '/stats',
    cache: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/stats.html'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.heatmap', {
    url: '/heatmap',
    cache: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/heatmap.html'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.por_categoria', {
    url: '/por_categoria',
    cache: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/por_categoria.html',
        controller: 'PorCategoriaCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.por_concejo', {
    url: '/por_concejo',
    cache: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/por_concejo.html',
        controller: 'PorConcejoCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.listado', {
    url: '/listado?concejo&idCategoria',
    cache: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/listado.html',
        controller: 'ListadoCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------
  $stateProvider.state('app.mosaico', {
    url: '/mosaico?concejo&idCategoria',
    cache: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/mosaico.html',
        controller: 'ListadoCtrl'
      }
    }
  });
// -------------------------------------------------------------------------------------------------------------------

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('app/listado?idCategoria=7');

})
// Inicializaciones ===================================================================================================
app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    ionic.Platform.isFullScreen = true;
  });
})
// ====================================================================================================================
app.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
  };
  return fallbackSrc;
});
// ====================================================================================================================
app.directive('iframeOnload', [function(){
  return {
    scope: {
      callBack: '&iframeOnload'
    },
    link: function(scope, element, attrs){
      element.on('load', function(){
        return scope.callBack();
      })
    }
  }}]);
// ====================================================================================================================
app.directive('imageonload', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('load', function() {
          //call the function that was passed
          scope.$apply(attrs.imageonload);
        });
      }
    };
  });
// ====================================================================================================================

