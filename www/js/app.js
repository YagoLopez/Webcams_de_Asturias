
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

// url completa para consultar fusion table. Usar como plantilla
//var url_api = "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps";

// url de las categorias codificada con urlencode. Usar como plantilla
//http%3A%2F%2Fwebcamsdeasturias.com%2Finterior.php%3Fcategoria%3D1

//TODO: hacer una funcion que se encargue de cargar las imagenes remotas y que avise cuando no se pueden cargar y de
//intentar cargarlas de nuevo

angular.module('webcams_asturias', ['ionic', 'webcams_asturias.controllers'])

// inicializacion
.run(function($ionicPlatform, $ionicLoading, factoria_datos, DATOS_URL, $rootScope) {
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

    // cargar datos remotos durante la fase de inicializacion ------------------------------------------------------

    // plantilla html para ionic loader
    var template_loader = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>Cargando datos...";

    // mostrar loader
    $ionicLoading.show({template:template_loader, noBackdrop:true});

    // construir sql query: seleccionar el listado completo de camaras
    var sql_query_string = 'SELECT Lugar,Concejo,Imagen,Categoria,ROWID FROM '+ DATOS_URL.FUSION_TABLE_ID;

    // obtener datos remotos
    factoria_datos.getRemoteData( sql_query_string ).success(function(data){
      // guarda datos remotos en $rootScope para compartir entre controladores
      $rootScope.listacams = data;
      console.log('$rootScope.listacams', $rootScope.listacams);
    }).error(function(data, status){
        console.log('Error obteniendo datos remotos: ', status);
    })
    // fin cargar datos remotos durante la fase de inicializacion --------------------------------------------------

  });
})

// rutas
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

    //.state('app.listacams', {
    //  url: '/listacams',
    //  views: {
    //    'menuContent': {
    //      templateUrl: 'templates/listacams.html',
    //      controller: 'ListacamsCtrl'
    //    }
    //  }
    //})

    .state('app.single', {
      url: '/playlists/:playlistId',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlist.html',
          controller: 'PlaylistCtrl'
        }
      }
    })

    .state('app.detalle', {
      url: '/detalle/:rowid',
      name: 'detalle',
      views: {
        'menuContent': {
          templateUrl: 'templates/detalle.html',
          controller: 'DetallecamCtrl'
        }
      }
    })

    //TODO: utilizar resolve en la definicion de estado para obtener datos remotos en vez de en metodo run(). Probar a ver
  .state('app.tabs', {
      url: '/tabs?categoria&concejo',
      cache:false,
      views: {
        'menuContent': {
          templateUrl: 'templates/tabs.html',
          controller: 'TabsCtrl'
        }
      }
    })

  .state('app.tabs.listado', {
      url: '/listado',
      views: {
        'tab-listado': {
        templateUrl: 'templates/listado.html',
        controller:'ListadoCtrl'
        }
      }
    })

    //probar a recoger los parametros de query string en un resolver
  .state('app.tabs.mosaico', {
    url: '/mosaico',
    views: {
      'tab-mosaico': {
        templateUrl: 'templates/mosaico.html',
        controller: 'MosaicoCtrl'
      }
    }
  })

; // fin de estados

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/tabs/listado');
});

// factoria para obtencion de datos remotos
angular.module('webcams_asturias').factory('factoria_datos', function($http, DATOS_URL){

  //TODO: intentar resolver aqui la promesa. Devolver los datos concatenando aqui "then" de esta forma:
  var getRemoteData = function( sql_query_string ) {
    var url = DATOS_URL.API_ENDPOINT+ '?sql=' +sql_query_string+ '&key=' +DATOS_URL.API_KEY;
    console.log("url", encodeURI(url));
    return $http.get( encodeURI(url), {cache: true} );
  }

  var getRemoteImg = function ( url ) {
    //var resultado = $http.get( url, {cache: true, headers: {
    //  'Access-Control-Allow-Headers': 'image/jpg',
    //  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    //  'Access-Control-Allow-Origin': '*'
    //}} )
    //  .success(function(data, status, header, config){
    //  console.log('data', data);
    //  console.log('data', status);
    //  console.log('data', header);
    //  console.log('data', config);
    //
    //})
    //  .error(function(data, status, header, config){
    //    console.log('data', data);
    //    console.log('data', status);
    //    console.log('data', header);
    //    console.log('data', config);
    //
    //})
  }

  // TODO: hacer funcion getLocalData para obtener datos en local
  return {
    getRemoteData: getRemoteData,
    getRemoteImg: getRemoteImg
  }
});

// constantes
angular.module('webcams_asturias').constant('DATOS_URL', {
    API_ENDPOINT: 'https://www.googleapis.com/fusiontables/v2/query',
    FUSION_TABLE_ID: '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF',
    API_KEY: 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps'
  }
) // fin constant

// directiva fallbackSrc
.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
  }
  return fallbackSrc;
});


// CORS request
//angular.module('webcams_asturias')
//  .config(function($httpProvider) {
//    $httpProvider.defaults.useXDomain = true;
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//  });

