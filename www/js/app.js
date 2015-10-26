
// url completa para consultar fusion table. Usar como plantilla
//var url_api = "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps";

// url de las categorias codificada con urlencode. Usar como plantilla
//http%3A%2F%2Fwebcamsdeasturias.com%2Finterior.php%3Fcategoria%3D1

angular.module('webcams_asturias', ['ionic', 'webcams_asturias.controllers'])

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

    //// plantilla html para ionic loader
    ////var template_loader = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>Cargando datos...";
    //var template_loader = "Cargando datos...";
    //// mostrar loader
    //$ionicLoading.show({template:template_loader, noBackdrop:true});

    // construir sql query: seleccionar el listado completo de camaras
    var sql_query_string = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid FROM '+ DATOS_URL.FUSION_TABLE_ID;

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
      controller: 'ChatsCtrl'
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

  .state('app.detalle', {
  url: '/detalle/:rowid',
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
})

.factory('factoria_datos', function($http, DATOS_URL){

  //TODO: intentar resolver aqui la promesa. Devolver los datos concatenando aqui "then" de esta forma:
  var getRemoteData = function( sql_query_string ) {
    var url = DATOS_URL.API_ENDPOINT+ '?sql=' +sql_query_string+ '&key=' +DATOS_URL.API_KEY;
    console.log("url", encodeURI(url));
    return $http.get( encodeURI(url), {cache: true} );
  }

  //TODO: implementar funcion getLocalData
  var getLocalData = function(pathFile){
  }

  //TODO: hacer un filtro que englobe los dos?
  var fltrConcejo = function(cam, concejo) {
   //TODO: quitar acentos para hacer mejor la búsqueda por concejo
   if ( !concejo )
     return cam;
   else
    return cam[1].toLowerCase() == concejo.toLowerCase();
  }

  var fltrCategoria = function(cam, categoria) {
   if ( !categoria )
     return cam;
   else {
     //if(cam[3] == 'categoria=' + categoria)
     //console.log('cam[3]', cam[3]);
     return cam[3] == 'categoria=' + categoria;
   }
  }

  return {
    getRemoteData: getRemoteData,
    getLocalData:  getLocalData,
    fltrConcejo:   fltrConcejo,
    fltrCategoria: fltrCategoria,
  }
})

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
