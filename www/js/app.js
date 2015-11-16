
// url completa para consultar fusion table. Usar como plantilla
//var url_api = "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps";

// url de las categorias codificada con urlencode. Usar como plantilla
//http%3A%2F%2Fwebcamsdeasturias.com%2Finterior.php%3Fcategoria%3D1

angular.module('webcams_asturias',
  ['ionic', 'webcams_asturias.controllers', 'jett.ionic.filter.bar', 'ngMaterial'/*,'ionicLazyLoad'*/])

.run(function($ionicPlatform) {
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
      templateUrl: 'templates/search.html',
      controller: 'SearchCtrl'
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

  .state('app.single', {
  url: '/playlists/:playlistId',
  views: {
    'menuContent': {
      templateUrl: 'templates/playlist.html',
      controller: 'PlaylistCtrl'
    }
  }
  })


  //TODO: utilizar resolve en la definicion de estado para obtener datos remotos en vez de en metodo run(). Probar a ver
  .state('app.tabs', {
    url: '/tabs?categoria&concejo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/tabs.html',
        controller: 'TabsCtrl'
      }
    }//,
    //resolve: {
    //  resolvedCams: function ($q, factoria_datos) {
    //    return factoria_datos;
    //  }
    //}
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

  .state('app.tabs.mosaico', {
  url: '/mosaico',
  views: {
  'tab-mosaico': {
    templateUrl: 'templates/mosaico.html',
    controller: 'MosaicoCtrl'
    }
  }
  })

  .state('app.mapa', {
    url: '/mapa?lugar&concejo&categoria',
    //cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/mapa.html',
        controller: 'MapaCtrl'
      }
    }
  })

  .state('app.streetview', {
    url: '/streetview?lugar&concejo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/streetview.html',
        controller: 'StreetViewCtrl'
      }
    }
  })

  .state('app.panoramio', {
    url: '/panoramio?lat&lng&lugar&concejo',
    //cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/panoramio.html',
        controller: 'PanoramioCtrl'
      }
    }
  })

  .state('app.detalle', {
    url: '/detalle/:rowid',
    views: {
      'menuContent': {
        templateUrl: 'templates/detalle.html',
        controller:'DetalleCtrl'
      }
    }
  })


; // fin de estados

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/tabs/listado');
})

.factory('factoria_datos', function($http, DATOS_URL){

    var getRemoteData = function( sql_query_string ) {
      var url = DATOS_URL.API_ENDPOINT+ '?sql=' +sql_query_string+ '&key=' +DATOS_URL.API_KEY;
      console.log("url", encodeURI(url));
      return $http.get( encodeURI(url), {cache: true} );
    }

    var getLocalData = function(path_fichero){
      return $http.get(path_fichero);
    }
    return {
      getRemoteData: getRemoteData,
      getLocalData: getLocalData
    }
})

.service('Panoramio', function(){

  var getPanoramio = function(domElement){
    var cadenaBusqueda = {
      'tag': 'Oviedo'
      //,
      //'rect': {'sw': {'lat': -30, 'lng': 10.5}, 'ne': {'lat': 50.5, 'lng': 30}}
    };
    var opciones_panoramio = {'width': 400, 'height': 400};
    //var widget_panoramio = new panoramio.PhotoWidget('divPanoramio', cadenaBusqueda, opciones_panoramio);
    var widget_panoramio = new panoramio.PhotoWidget(domElement, cadenaBusqueda, opciones_panoramio);

    widget_panoramio.setPosition(0);
    console.log('widget_panoramio', widget_panoramio);

  }
  return {
    getPanoramio: getPanoramio
  }

}) // Panoramio

.service('GMapsService', function(DATOS_URL){

    // punto de referencia para geocoder y centro de mapa por defecto
    var OVIEDO = {lat: 43.3667, lng: -5.8333};

    var hallaLatLng = function (domElement, lugar, concejo, fn){
      var request = {
        location: OVIEDO,
        radius: '1',
        query: "'"+lugar+","+concejo+"'"
      };
      placesService = new google.maps.places.PlacesService(domElement);
      placesService.textSearch(request, callback);
      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          fn(results[0].geometry.location);
        } else {
          console.log('hallaLatLng(): no se han podido hallar coordenadas');
        }
      }
    }// hallaLatLng

    var creaStreetView = function(domElement, locationLatLng){
      return new google.maps.StreetViewPanorama( domElement, {
        pov: {heading: 0, pitch: 0},
        position: locationLatLng,
        zoom: 1
      });
    }

    var creaMapa = function (domElement){
      var mapa = new google.maps.Map(domElement,  {
        mapTypeId: google.maps.MapTypeId.TERRAIN
      });
      layer = new google.maps.FusionTablesLayer({
        map: mapa,
        //heatmap: { enabled: false },
        query: {
          select: 'col7',
          from: DATOS_URL.FUSION_TABLE_ID,
          where: ''
        },
        options: {
          styleId: 6,
          templateId: 8
        }
      });
      return mapa;
    } // creaMapa()

    return {
      OVIEDO: OVIEDO,
      creaMapa: creaMapa,
      hallaLatLng: hallaLatLng,
      creaStreetView: creaStreetView
    }
}) // GMapsService

.constant('DATOS_URL', {
    API_ENDPOINT: 'https://www.googleapis.com/fusiontables/v2/query',
    FUSION_TABLE_ID: '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF',
    API_KEY: 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps'
})

.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
  }
  return fallbackSrc;
})

.config(['$compileProvider', function ($compileProvider) {
  // disable debug info
  $compileProvider.debugInfoEnabled(true);
}]);



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

// CORS request
//angular.module('webcams_asturias')
//  .config(function($httpProvider) {
//    $httpProvider.defaults.useXDomain = true;
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//  });

; // FIN
