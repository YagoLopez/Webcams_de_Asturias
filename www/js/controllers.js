//TODO: hacer cuadro de dialogo para mostrar imagen de cam?
//TODO: revisar las dependencias que se pasan a los controladores
//TODO: hacer una tabla propia para las categorias en fusion tables y hacer join de la tabla de webcams y la de categorias
//TODO: Hacer tabla para concejos
//TODO: Morphing icono backwards

angular.module('wca.controllers',[])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  })

.controller('TabsCtrl', function($scope, $stateParams, $ionicLoading, $rootScope, $ionicFilterBar,
                                 SFusionTable, $filter, $ionicScrollDelegate, SPopup, $ionicNavBarDelegate){

    // mostrar loader
    var icono_spinner = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>";
    var template_loader = "Cargando datos...";
    $ionicLoading.show({template:template_loader, noBackdrop:true});
    // Guarda parametros url en variables temporales;
    var concejo = $stateParams.concejo || '';
    var idCategoria = $stateParams.idCategoria || '';

    //TODO: revisar esto
    $rootScope.mostrarLupa = true;
    // elimina search bar si estuviera activada al mostrar la vista
    //if ($rootScope.filterBarInstance)
    //  $rootScope.filterBarInstance();
    //console.log('rootScope.filterBarInstance', $rootScope.filterBarInstance);

    // inicializa filter bar
    //$rootScope.filterBarInstance = null;


    function esSubcadena(idCategoria, urlCategoria) {
      return (urlCategoria.indexOf('categoria='+idCategoria) > -1);
    }

    //TODO: cachear las imagenes
    var sqlQuery = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid FROM '+ SFusionTable.TABLE_ID;
    SFusionTable.getRemoteData(sqlQuery).success(function(data){

      // -------------------------------------------------------------------------------------------------------------
      // FILTRO 1: filtra las cams por parametros de url: concejo y categoria
      // -------------------------------------------------------------------------------------------------------------
      var camsFiltradasPorUrl = $filter('filter')(data.rows, function(cam){
        if (concejo && idCategoria) {
          // cam[1]: concejo de camara, cam[3]: url categoria (no id de categoria, no confundir)
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

      // Inicialmente items contiene las cams filtradas solo por parametros de url
      $rootScope.items = camsFiltradasPorUrl;
      // Despues de filtrar, guardar parametros en scope. Se hace asi para que el filtrado sea mas eficiente
      $rootScope.concejo = concejo;
      $rootScope.idCategoria = idCategoria;

      // -------------------------------------------------------------------------------------------------------------
      // FILTRO 2: filtra las cams segun una cadena de texto que haya introducido el usuario
      // -------------------------------------------------------------------------------------------------------------
      // este filtro se aplica sobre los datos previamente filtrados por url
      //TODO: Habría que mejorar la búsqueda para que fuera menos estricta. Por ejemplo, si se introduce "puerto llanes" no se
      //encuentra "Puerto de Llanes"

      $rootScope.showFilterBar = function () {
        $rootScope.filterBarInstance = $ionicFilterBar.show({
          items: $rootScope.items,
          update: function (filteredItems, filteredText) {
            $rootScope.items = filteredItems;
            $ionicScrollDelegate.scrollTop(false);
          },
          cancelText: 'Cancelar',
          //done: function(){
          //  $ionicSideMenuDelegate.canDragContent(false);
          //  console.log('no se puede abrir el menu');
          //
          //},
          //cancel: function(){
            // destruye fileter bar
            //$rootScope.filterBarInstance();
            //console.log('filter bar destroyed');
          //},
          cancelOnStateChange: true
        });
      };

      $ionicLoading.hide();

    }).error(function(data, status) {
      $ionicLoading.hide();
      SPopup.show('Error', 'Fallo obteniendo datos de cámaras->SFusionTable.getRemoteData(): '+status)
    });

})// TabsCtrl

.controller('MapaCtrl', function($scope, $stateParams, SMapa, $rootScope){

    $rootScope.mostrarLupa = false;

    $scope.$on('$ionicView.afterEnter', function() {

    var mapa = SMapa.creaMapa( document.getElementById('mapa') );
    $scope.lugar = $stateParams.lugar;
    $scope.concejo = $stateParams.concejo;

    if(!$rootScope.lat || !$rootScope.lng){
      mapa.setCenter(SMapa.OVIEDO);
      mapa.setZoom(8);
    } else {
        mapa.setCenter( {lat: $rootScope.lat, lng: $rootScope.lng} );
        mapa.setZoom(13);
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

.controller('MapaGlobalCtrl', function($scope, $rootScope, SMapa){
    $rootScope.lat = null;
    $rootScope.lng = null;
    $rootScope.mostrarLupa = false;
    var mapa = SMapa.creaMapa(document.getElementById('mapaglobal'));
    mapa.setCenter(SMapa.OVIEDO);
    mapa.setZoom(8);
}) //mapaglobalctrl

.controller('PanoramioCtrl', function($scope, $stateParams, SMapa, $ionicModal, $rootScope){

    var lat = $rootScope.lat;
    var lng = $rootScope.lng;
    var OFFSET = 0.002;
    var hayFotoSiguiente = function(){
      return !FotosPanoramio.getAtEnd();
    }
    var hayFotoAnterior = function(){
      return !FotosPanoramio.getAtStart();
    }
    var rectanguloBusqueda = { 'rect': {
      'sw': {'lat': lat-OFFSET, 'lng': lng-OFFSET},
      'ne': {'lat': lat+OFFSET, 'lng': lng+OFFSET}
    }};
    var divCreditos = document.getElementById('divCreditos');
    var FotosPanoramio = new panoramio.PhotoWidget('divPanoramio', rectanguloBusqueda, null);
    FotosPanoramio.setPosition(0);

    $rootScope.mostrarLupa = false;
    $scope.lugar = $stateParams.lugar;
    $scope.concejo = $stateParams.concejo;
    $scope.fotos = FotosPanoramio;
    $scope.nextPhoto = function(){
      if (hayFotoSiguiente())
        FotosPanoramio.setPosition( FotosPanoramio.getPosition()+1 );
    }
    $scope.prevPhoto = function(){
      if (hayFotoAnterior())
        FotosPanoramio.setPosition( FotosPanoramio.getPosition()-1 );
    }

  //TODO: avisar cuando no hay fotos panoramio

    // DIALOGO MODAL ----------------------------------------------------------------------------------------------
    $ionicModal.fromTemplateUrl('templates/modal-img.html', {
      scope: $scope,
      animation: 'scale-in'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.showModal= function (){
      if(FotosPanoramio.getPhoto()){
        $scope.urlImg = FotosPanoramio.getPhoto().Ya[0].url;
        $scope.titulo = FotosPanoramio.getPhoto().getPhotoTitle();
        $scope.autor = FotosPanoramio.getPhoto().getOwnerName();
        $scope.urlAutor = FotosPanoramio.getPhoto().getOwnerUrl();
        $scope.modal.show();
      } else
        console.log('showModal(): no se han encontrado fotos panoramio');
    }
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    // FIN DIALOGO MODAL ----------------------------------------------------------------------------------------------

}) // panoramio ctrl

.controller('DetalleCtrl', function($scope, $stateParams, $ionicModal, SMapa, SClima, $filter, $rootScope,
                                    SPopup, SWikipedia, $ionicSlideBoxDelegate, $ionicPopover){

    $scope.rowid = $stateParams.rowid;
    $rootScope.mostrarLupa = false;

    if(!$rootScope.items || !$scope.rowid){
      SPopup.show('Aviso', 'No hay datos de cámara/s. Escoger otra opción de menú');
      return;
    };

    var cam = $filter('filter')($rootScope.items, function(cam) {
      return cam[4] == $scope.rowid;
    });
    $scope.lugar = cam[0][0];
    $scope.concejo = cam[0][1];
    $scope.imagen = cam[0][2];
    $scope.categoria = cam[0][3];
    // CLIMA ---------------------------------------------------------------------------------------------------------
    var div = document.getElementById('void');
    SMapa.hallaLatLng(div, $scope.lugar, $scope.concejo, function(coords){

      //TODO: no usar rootscope. Crear un servicio para almacenar lat, lng, lugar, concejo y compartir entre controllers
      $rootScope.lat = coords.lat();
      $rootScope.lng = coords.lng();

      SClima.getData( $rootScope.lat, $rootScope.lng ).success(function(climadata){
        //console.log('datos de clima', climadata);
        $scope.descripcion = climadata.weather[0].description;
        $scope.temp = climadata.main.temp;
        $scope.presion = climadata.main.pressure;
        $scope.humedad = climadata.main.humidity;
        $scope.nubosidad = climadata.clouds.all;
        $scope.velocidadViento = climadata.wind.speed;
        $scope.direccionViento = climadata.wind.deg;
        //volumen precipitaciones ultimas 3 horas
        //$scope.precipitacion = climadata.rain['3h'];
        //url icono: http://openweathermap.org/img/w/10n.png
        $scope.iconoUrl = 'http://openweathermap.org/img/w/'+climadata.weather[0].icon+'.png' ;

      }).error(function(status){
        SPopup.show('Error', 'SClima.getData(): '+status)
      });
    });// hallalatlng
    // FIN CLIMA -----------------------------------------------------------------------------------------------------

    // WIKIPEDIA -----------------------------------------------------------------------------------------------------
    SWikipedia.info($scope.concejo).success(function(data){
      var pageid = data.query.pageids[0];
      if(pageid) {
        $scope.infoConcejo = data.query.pages[pageid].extract;
        //console.log('extract', $scope.infoConcejo);
      }
    }).error(function(status){
      console.warn(status);
    });
    // FIN WIKIPEDIA -------------------------------------------------------------------------------------------------

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

    $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
    });

})// DetalleCtrl

.controller('StreetViewCtrl', function($scope, SMapa, $stateParams, $rootScope, SPopup){

  $scope.lugar = $stateParams.lugar || '';
  $scope.concejo = $stateParams.concejo || '';
  $rootScope.mostrarLupa = false;

  var coords = {lat: $rootScope.lat, lng: $rootScope.lng};

  if(!coords.lat || !coords.lng) {
    SPopup.show('Aviso', 'Faltan coordenadas geográficas');
    return;
  }

  $scope.$on('$ionicView.afterEnter', function() {

    var div = document.getElementById('street-view');
    //SMapa.hallaLatLng(div, $scope.lugar, $scope.concejo, function (coords) {
      var streetViewService = new google.maps.StreetViewService();
      streetViewService.getPanoramaByLocation(coords, SMapa.RADIO_BUSQUEDA, function (data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          SMapa.creaStreetView(div, data.location.latLng);
          //SMapa.creaStreetView( div, {lat:$rootScope.lat, lng:$rootScope.lng} );
        } else {
          SPopup.show('Error', 'No se ha encontrado StreetView->getPanoramaByLocation(): '+status);
        }
      })
    //})//hallaLatLng

  })//$scope.on

})//StreetViewCtrl


; // FIN
