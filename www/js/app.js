// url completa para consultar fusion table. Usar como plantilla
//var url_api = "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps";

angular.module('wca', ['ionic', 'wca.controllers', 'wca.services',
  'jett.ionic.filter.bar' /*, 'ngMaterial' 'ionicLazyLoad'*/])

.run(function($ionicPlatform, $animate) {
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
  });
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider,
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
    // num templates to prefetch
    $ionicConfigProvider.templates.maxPrefetch();

    // disable angular log system
    $logProvider.debugEnabled(false);
    $compileProvider.debugInfoEnabled(false);

    // desactivr transiciones de ionic
    $ionicConfigProvider.views.transition('none');

    $stateProvider
// -------------------------------------------------------------------------------------------------------------------
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
    //    ,
    //controller: 'AppCtrl'
  })
// -------------------------------------------------------------------------------------------------------------------
/*
  //TODO: utilizar resolve en la definicion de estado para obtener datos remotos en vez de en metodo run(). Probar a ver
  .state('app.tabs', {
    url: '/tabs?idCategoria&concejo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/tabs.html',
        controller: 'TabsCtrl'
      }
    }//,
    //resolve: {
    //  resolvedCams: function ($q, SFusionTable) {
    //    return SFusionTable;
    //  }
    //}
  })
*/
// -------------------------------------------------------------------------------------------------------------------
//  .state('app.tabs.listado', {
//  url: '/listado',
//  cache: false,
//  views: {
//    'tab-listado': {
//    templateUrl: 'templates/listado.html'
//    }
//  }
//  })
// -------------------------------------------------------------------------------------------------------------------
//  .state('app.tabs.mosaico', {
//  url: '/mosaico',
//  cache: false,
//  views: {
//    'tab-mosaico': {
//    templateUrl: 'templates/mosaico.html'
//    }
//  }
//  })
// -------------------------------------------------------------------------------------------------------------------
  .state('app.mapa', {
    url: '/mapa',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/mapa.html',
        controller: 'MapaCtrl'
      }
    }
  })
// -------------------------------------------------------------------------------------------------------------------
  .state('app.mapaglobal', {
    url: '/mapaglobal',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/mapa-global.html',
        controller: 'MapaGlobalCtrl'
      }
    }
  })
// -------------------------------------------------------------------------------------------------------------------
  .state('app.streetview', {
    url: '/streetview',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/streetview.html',
        controller: 'StreetViewCtrl'
      }
    }
  })
// -------------------------------------------------------------------------------------------------------------------
  .state('app.panoramio', {
    url: '/panoramio',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/panoramio.html',
        controller: 'PanoramioCtrl'
      }
    }
  })
// -------------------------------------------------------------------------------------------------------------------
      .state('app.detalle', {
        url: '/detalle/:rowid',
        cache: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/detalle.html',
            controller: 'DetalleCtrl'
          }
        }
      })
// -------------------------------------------------------------------------------------------------------------------
  .state('app.gif-player', {
    url: '/gif-player/:id_item_meteo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/gif-player.html',
        controller: 'GifPlayerCtrl'
      }
    }
  })
// -------------------------------------------------------------------------------------------------------------------
  .state('app.meteo', {
    url: '/meteo',
    cache: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/meteo.html',
        controller: 'MeteoCtrl'
      }
    }
  })
// -------------------------------------------------------------------------------------------------------------------
  .state('app.img-viewer', {
    url: '/img-viewer/:id_item_meteo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/img-viewer.html',
        controller: 'ImgViewerCtrl'
      }
    }
  })
// -------------------------------------------------------------------------------------------------------------------
      .state('app.stats', {
        url: '/stats',
        cache: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/stats.html'
          }
        }
      })
// -------------------------------------------------------------------------------------------------------------------
      .state('app.heatmap', {
        url: '/heatmap',
        cache: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/heatmap.html'
          }
        }
      })
// -------------------------------------------------------------------------------------------------------------------
      .state('app.por_categoria', {
        url: '/por_categoria',
        cache: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/por_categoria.html',
            controller: 'PorCategoriaCtrl'
          }
        }
      })
// -------------------------------------------------------------------------------------------------------------------
      .state('app.por_concejo', {
        url: '/por_concejo',
        cache: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/por_concejo.html',
            controller: 'PorConcejoCtrl'
          }
        }
      })
// -------------------------------------------------------------------------------------------------------------------
      .state('app.listado2', {
        url: '/listado2?concejo&idCategoria',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/listado2.html',
            controller: 'Listado2Ctrl'
          }
        }
      })
// -------------------------------------------------------------------------------------------------------------------
      .state('app.mosaico2', {
        url: '/mosaico2?concejo&idCategoria',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/mosaico2.html',
            controller: 'Listado2Ctrl'
          }
        }
      })
// -------------------------------------------------------------------------------------------------------------------

; // fin de estados

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('app/listado2?idCategoria=7');

// -------------------------------------------------------------------------------------------------------------------

})

.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
  };
  return fallbackSrc;
})


/*
.filter('concejoFltr', function(){

  var filtro = function(datos_cam, concejo){
    console.log('datos_cam.rows desde filter', datos_cam.rows)
  if (!concejo)
    return datos_cam.rows;
  else
    return datos_cam.rows;
  }
return filtro;
    /!*
      $scope.isActive = function(user) {
        return user.User.Stats[0].active === "1";
      };
      and then in your HTML:

        <div ng-repeat="user in _users | filter:isActive">
        {{user.User.userid}}
      </div>
    *!/

    //var myRedObjects = $filter('filter')(myObjects, { color: "red" });


})
*/

 //CORS request
//angular.module('wca').config(function($httpProvider) {
//    $httpProvider.defaults.useXDomain = true;
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//  });

; // FIN
