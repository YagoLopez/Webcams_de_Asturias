//TODO: hacer cuadro de dialogo para mostrar imagen de cam?
//TODO: revisar las dependencias que se pasan a los controladores
//TODO: hacer una tabla propia para las categorias en fusion tables y hacer join de la tabla de webcams y la de categorias
//TODO: Hacer tabla para concejos

angular.module('wca.controllers',[])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  })

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope) {
  })

.controller('TabsCtrl', function($scope, $stateParams, $ionicLoading, $rootScope, $ionicFilterBar,
                                 factoria_datos, DATOS_URL, $filter, $ionicScrollDelegate){

    // mostrar loader
    var icono_spinner = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>";
    var template_loader = "Cargando datos...";
    $ionicLoading.show({template:template_loader, noBackdrop:true});

    //TODO: eliminar esta animacion
    $rootScope.animarListItems = true;

    // elimina search bar si estuviera activada al mostrar la vista
    if ($rootScope.filterBarInstance)
      $rootScope.filterBarInstance();

    // Guarda parametros url en variables temporales;
    var concejo = $stateParams.concejo || '';
    var idCategoria = $stateParams.idCategoria || '';

    function esSubcadena(idCategoria, urlCategoria) {
      return (urlCategoria.indexOf('categoria='+idCategoria) > -1);
    }

    //TODO: cachear las imagenes
    var sql_query = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid FROM '+ DATOS_URL.FUSION_TABLE_ID;
    factoria_datos.getRemoteData(sql_query).success(function(data){

      // -------------------------------------------------------------------------------------------------------------
      // FILTRO 1: filtra las cams por parametros de la url: concejo y categoria
      // -------------------------------------------------------------------------------------------------------------
      var camsFiltradasPorUrl = $filter('filter')(data.rows, function(cam){
        if (concejo && idCategoria) {
          // cam[1] concejo de camara, cam[3] url categoria, no id de categoria, no confundir
          return (cam[1].toLowerCase() == concejo.toLowerCase() && esSubcadena(idCategoria, cam[3]));
        } else {
          if (concejo)
            return cam[1].toLowerCase() == concejo.toLowerCase();
          if (idCategoria)
            return esSubcadena(idCategoria, cam[3]);
          if(!concejo && !idCategoria)
            return data.rows;
        }
      });

      //if (camsFiltradasPorUrl.length == 0)
      //  camsFiltradasPorUrl = data.rows;

      // Aqui items contiene las cams inicialmente filtradas por parametros de url
      $rootScope.items = camsFiltradasPorUrl;
      // Despues de filtrar guardar parametros en scope. Se hace asi para que el filtrado sea mas rapido
      $scope.concejo = concejo;
      $scope.idCategoria = idCategoria;

      // -------------------------------------------------------------------------------------------------------------
      // FILTRO 2: filtra las cams segun una cadena de texto que haya introducido el usuario
      // -------------------------------------------------------------------------------------------------------------
      // este filtro se aplica sobre los datos previamente filtrados por url
      //TODO: Habría que mejorar la búsqueda para que fuera menos estricta. Por ejemplo, si se introduce "puerto llanes" no se
      //encuentra "Puerto de Llanes"

      $rootScope.showFilterBar = function () {
        //TODO: quitar lo de animarlistitems
        $rootScope.animarListItems = false;
        $rootScope.filterBarInstance = $ionicFilterBar.show({
          items: $rootScope.items,
          update: function (filteredItems, filteredText) {
            $rootScope.items = filteredItems;
            $ionicScrollDelegate.scrollTop(false);
          },
          cancelText: 'Cancelar',
          cancelOnStateChange: true
        });
      };

      $ionicLoading.hide();

    }).error(function(data, status) {
      $ionicLoading.hide();
      console.log('Error obteniendo datos remotos: ', status);
    });

})// TabsCtrl

.controller('ListadoCtrl', function($ionicHistory, $scope){

  }) // fin ListadoCtrl

.controller('MosaicoCtrl', function($scope, $ionicHistory){
    //TODO: borrar esto
    //
    //$ionicHistory.nextViewOptions({
    //  historyRoot: true,
    //  disableBack: true,
    //  disableAnimate: true
    //});

    //$ionicHistory.nextViewOptions({
    //  historyRoot: true
    //})
}) // fin MosaicoCtrl

.controller('MapaCtrl', function($scope, $stateParams, GMapsService, $rootScope){

/*
  1) crear mapa
  2) si no hay NI lugar NI concejo -> mapa por defecto
     en cualquier otro caso -> crear mapa en funcion de parametros: lugar, concejo (idCategoria?)
 */
  $scope.$on('$ionicView.afterEnter', function() {

    var OVIEDO = GMapsService.OVIEDO;
    var lugar = $stateParams.lugar || '';
    var concejo = $stateParams.concejo || '';
    var filtro = '';

    $scope.verStreetView = function () {
      $scope.streetViewVsible = streetView.getVisible();
      if ($scope.streetViewVsible == false) {
        streetView.setVisible(true);
        $scope.streetViewVsible = true;
      } else {
        streetView.setVisible(false);
        $scope.streetViewVsible = false;
      }
    }

    var mapa = GMapsService.creaMapa( document.getElementById('mapa') );
    var streetView = mapa.getStreetView({ pov: {heading: 0, pitch: 0} });

    if(!lugar && !concejo){
      mapa.setCenter(OVIEDO);
      mapa.setZoom(8);
      streetView.setPosition(OVIEDO);
    } else {
      GMapsService.hallaLatLng(mapa, lugar, concejo, function(coords){
        mapa.setCenter(coords);
        mapa.setZoom(13);
        // busca coordenadas cercanas donde existan imagenes de street view
        var streetViewService = new google.maps.StreetViewService();
        streetViewService.getPanoramaByLocation(coords, GMapsService.RADIO, function(data, status) {
          if (status == google.maps.StreetViewStatus.OK) {
            streetView.setPosition(data.location.latLng);
          } else {
            console.log('getPanoramaByLocation(): No se ha encontrado panorama Street View')
          }
        });
      }) // hallalatlng
    }// else

  }); // $scope.on

// ---------------------------------------------------------------------------

  /* ---------------------------------------------------------
  // Try HTML5 geolocation
      if (navigator.geolocation) {
        console.log("Device supports Geolocation");
        navigator.geolocation.getCurrentPosition(function(position) {
          console.log("Enter getCurrentPosition");
          var pos = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);
          console.log(pos);
          $scope.map.setCenter(pos);

          var myLocation = new google.maps.Marker({
            position: pos,
            map: $scope.map,
            content: 'Your location'
          });
        });
      } else {
        // Device doesn't support Geolocation
        console.log("Device doesn't support Geolocation");
      }
    };
  */

}) // fin MapaGlobalCtrl

.controller('PanoramioCtrl', function($scope, $stateParams, GMapsService, $ionicModal){

    var lugar = $stateParams.lugar;
    var concejo = $stateParams.concejo;
    var idCategoria = $stateParams.idCategoria
    //var css = {'width': 200, 'height': 200};
    var rectanguloBusqueda = null;
    var divCreditos = null;
    var widgetPanoramio = null;

    divCreditos = document.getElementById('divCreditos');
    GMapsService.hallaLatLng(divCreditos, lugar,  concejo, function(coords){

      var lat = coords.lat();
      var lng = coords.lng();
      var OFFSET = 0.002;

      rectanguloBusqueda = { 'rect': {
        'sw': {'lat': lat-OFFSET, 'lng': lng-OFFSET},
        'ne': {'lat': lat+OFFSET, 'lng': lng+OFFSET}
      }};

      widgetPanoramio = new panoramio.PhotoWidget('divPanoramio', rectanguloBusqueda, null);
      widgetPanoramio.setPosition(0);

    }); // hallaLatLng

    $scope.getPhoto = function (){
      return widgetPanoramio.getPhoto();
    }

    // DIALOGO MODAL ----------------------------------------------------------------------------------------------
    $ionicModal.fromTemplateUrl('templates/modal-img.html', {
      scope: $scope,
      animation: 'scale-in'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.showModal= function (){
      if(widgetPanoramio.getPhoto()){
        $scope.urlImg = widgetPanoramio.getPhoto().Ya[0].url;
        $scope.titulo = widgetPanoramio.getPhoto().cd;
        $scope.autor = widgetPanoramio.getPhoto().Xc;
        $scope.urlAutor = widgetPanoramio.getPhoto().Yc;
        $scope.modal.show();
      } else
        console.log('showModal(): no se han encontrado fotos panoramio')
    }

    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    // FIN DIALOGO MODAL ----------------------------------------------------------------------------------------------

}) // panoramio ctrl

.controller('DetalleCtrl', function($scope, $stateParams, $ionicModal){

    $scope.rowid = $stateParams.rowid;

    // DIALOGO MODAL -------------------------------------------------------------------------------------------------
    $ionicModal.fromTemplateUrl('templates/modal-detalle.html', {
      scope: $scope,
      animation: 'scale-in'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.showModal= function (){
      $scope.modal.show();
    }

    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    // FIN DIALOGO MODAL ----------------------------------------------------------------------------------------------

  })// DetalleCtrl

.controller('StreetViewCtrl', function($scope, GMapsService, $stateParams){

  var lugar = $stateParams.lugar || '';
  var concejo = $stateParams.concejo || '';

  $scope.$on('$ionicView.afterEnter', function() {

    var div = document.getElementById('street-view');
    GMapsService.hallaLatLng(div, lugar, concejo, function (coords) {
      var streetViewService = new google.maps.StreetViewService();
      streetViewService.getPanoramaByLocation(coords, GMapsService.RADIO, function (data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          GMapsService.creaStreetView(div, data.location.latLng);
        } else {
          console.log('getPanoramaByLocation(): No se ha encontrado panorama Street View')
        }
      })
    })//hallaLatLng

  })//$scope.on

})//StreetViewCtrl

.controller('RepeatCtrl', function ($scope){
})

.controller('SearchCtrl', function($scope, $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate){
  $scope.miarray=[1,2,3,4,5,6,7,8,9];

 }) // fin SearchCtrl controller


; // FIN
