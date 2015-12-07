//TODO: hacer cuadro de dialogo para mostrar imagen de cam?
//TODO: revisar las dependencias que se pasan a los controladores
//TODO: hacer una tabla propia para las categorias en fusion tables y hacer join de la tabla de webcams y la de categorias
//TODO: Hacer tabla para concejos
//TODO: Morphing icono backwards
//TODO: recordar que el codigo que se encuentra en el evento on.afterviewEnter se ejecuta siempre. Probar a quitar la cache de las vistas que usan este icono a ver que pasa

angular.module('wca.controllers',[])

.controller('AppCtrl', function($scope) {

  //// With the new view caching in Ionic, Controllers are only called
  //// when they are recreated or on app start, instead of every page change.
  //// To listen for when this page is active (for example, to refresh data),
  //// listen for the $ionicView.enter event:
  ////$scope.$on('$ionicView.enter', function(e) {
  ////});

  })

.controller('TabsCtrl', function($scope, $stateParams, SLoader, $rootScope, $ionicFilterBar,
                                 SFusionTable, $filter, $ionicScrollDelegate, SPopup, $ionicNavBarDelegate){

    //var templateLoader = "Cargando datos...";
    //$ionicLoading.show({template:templateLoader, noBackdrop:true});
    SLoader.show();
    // Guarda parametros url en variables temporales;
    var concejo = $stateParams.concejo || '';
    var idCategoria = $stateParams.idCategoria || '';

    //TODO: revisar esto. hacer un servicio para no usar rootscope?
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

      //$ionicLoading.hide();
      SLoader.hide();

    }).error(function(data, status) {
      $ionicLoading.hide();
      SPopup.show('Error', 'Fallo obteniendo datos de cámaras<br>SFusionTable.getRemoteData(): '+status)
    });

})// TabsCtrl

.controller('MapaCtrl', function($scope, $stateParams, SMapa, $rootScope){

  $rootScope.mostrarLupa = false;
  $scope.$on('$ionicView.afterEnter', function() {
    $scope.lugar = $stateParams.lugar;
    $scope.concejo = $stateParams.concejo;
    var mapa = SMapa.crear(document.getElementById('mapa'));
    var layer = SMapa.creaFusionTableLayer().setMap(mapa);

    if(!$rootScope.lat || !$rootScope.lng){
      mapa.setCenter(SMapa.OVIEDO);
      mapa.setZoom(8);
    } else {
        mapa.setCenter( {lat: $rootScope.lat, lng: $rootScope.lng} );
        mapa.setZoom(13);
    }// else
  }); // $scope.on

  // Geolocalizacion --------------------------------------------------------------------------------------------------
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
  // Fin Geolocalizacion ----------------------------------------------------------------------------------------------

}) // fin MapaGlobalCtrl

.controller('MapaGlobalCtrl', function($scope, $rootScope, SMapa, SFusionTable, SPopup){
    var layer = null;
    var mapa = null;
    var zoomLevel = 7;
    $rootScope.mostrarLupa = false;
    $scope.checked = null;

    var sqlQueryConcejos = 'SELECT Concejo FROM '+SFusionTable.TABLE_ID+' GROUP BY Concejo';
    SFusionTable.getRemoteData(sqlQueryConcejos).success(function(data){
      $scope.concejos = data.rows;
    }).error(function(status){
      SPopup.show('Error', 'Fallo cargando lista concejos: '+status);
    });

    var sqlQueryCategorias = 'SELECT Categoria FROM '+SFusionTable.TABLE_ID+' GROUP BY Categoria';
    SFusionTable.getRemoteData(sqlQueryCategorias).success(function(data){
      $scope.categorias = data.rows;
    }).error(function(status){
      SPopup.show('Error', 'Fallo cargando lista categorias: '+status);
    });

    $scope.concejoEscogido = function(concejo){

      $scope.checked = 'con';
      // elimina retornos de carro y espacios en blanco al principio y al final
      concejo = concejo.replace(/(\r\n|\n|\r)/gm,'').trim();
      var filtro = 'Concejo=\'' + concejo + '\''; // el concejo tiene que ir entre comillas
      if(layer)
        layer.setMap(null);
      layer = SMapa.creaFusionTableLayer(filtro);
      layer.setMap(mapa);
      mapa.setCenter(SMapa.OVIEDO);
      mapa.setZoom(zoomLevel);

    }; // concejo escogido

    $scope.categoriaEscogida = function(categoria){

      $scope.checked = 'cat';
      categoria = categoria.replace(/(\r\n|\n|\r)/gm,'').trim();
      var filtro = 'Categoria=\'' + categoria + '\'';
      if(layer)
        layer.setMap(null);
      layer = SMapa.creaFusionTableLayer(filtro);
      layer.setMap(mapa);
      mapa.setCenter(SMapa.OVIEDO);
      mapa.setZoom(zoomLevel);

    }; // categoria escogida

    mapa = SMapa.crear(document.getElementById('mapaglobal'));
    mapa.setCenter(SMapa.OVIEDO);
    mapa.setZoom(zoomLevel+1);

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
          SPopup.show('Aviso', 'Panorama StreetView no disponible en esta ubicación<br>' +
            'getPanoramaByLocation(): '+status);
        }
      })
    //})//hallaLatLng
  })//$scope.on

})//StreetViewCtrl

.controller('GifPlayerCtrl', function($scope, $window, $interval, $stateParams, ModeloMeteo2, ItemMeteo){

  //TODO: añadir loader
  //TODO: crear servicio

  //$scope.calculateDimensions = function(gesture) {
  //  $scope.dev_width = $window.innerWidth;
  //  $scope.dev_height = $window.innerHeight;
  //  console.log('dev_width', $scope.dev_width);
  //  console.log('dev_height', $scope.dev_height);
  //}
  //
  //angular.element($window).bind('resize', function(){
  //  $scope.$apply(function() {
  //    $scope.calculateDimensions();
  //  })
  //});
  //
  //$scope.calculateDimensions();

    // Obtiene itemMeteo ----------------------------------------------------------------------------------------------
    //$scope.itemMeteo = ModeloMeteo2.getItemById($stateParams.id_item_meteo);
    //console.log('itemMeteo', $scope.itemMeteo);
    $scope.itemMeteo = new ItemMeteo(ModeloMeteo2.getItemById($stateParams.id_item_meteo));
    console.log('itemMeteo Object', $scope.itemMeteo);
    // ----------------------------------------------------------------------------------------------------------------

    $scope.$on('$ionicView.afterEnter', function(){

      // Constructor de gif en base a parametros ----------------------------------------------------------------------
      var gifAnimado = new SuperGif({
        gif: document.getElementById('gif'),
        loop_mode: 0,
        draw_while_loading: 1
        //max_width: $scope.dev_width
      });
      // Carga un gif animado remoto y lo descompone en fotogramas para procesarlo ------------------------------------
      gifAnimado.load(function(){
        $scope.totalFrames = gifAnimado.get_length();
        $scope.currentFrame = gifAnimado.get_current_frame();
        $scope.gifAnimado = gifAnimado;
        $scope.$apply();
        //console.log('canvas width', canvas.width);
        console.log('gifAnimado', gifAnimado);
        console.log('currentFrame', $scope.currentFrame);
      });
      // inicializaciones ---------------------------------------------------------------------------------------------
      $scope.currentFrame = 0;
      var isGifPlaying = false;
      var timer = null;
      var rangeSlider = document.getElementById('levelRange');
      // zoom ---------------------------------------------------------------------------------------------------------
      $scope.zoomIn = function(){
        //var gifContainer = document.getElementById('gifContainer');
        //gifContainer.className = 'gifZoomed';
      };// zoomIn
      $scope.zoomOut = function(){
        //var gifContainer = document.getElementById('gifContainer');
        //gifContainer.className = 'gifUnzoomed';
      };// zoomOut
      // zoom --------------------------------------------------------------------------------------------------------
      // pan-zoom ---------------------------------------------------------------------------------------------------
      $('.jsgif > canvas').panzoom({
        $zoomIn: $('.zoom-in'),
        $zoomOut: $('.zoom-out'),
        $zoomRange: $('.zoom-range'),
        $reset: $('.reset'),
        contain: 'invert',
        minScale: 1,
        //startTransform: 'scale(0.5)'
      }).panzoom('zoom');
      $('.jsgif > canvas').panzoom('zoom', 1.0, { silent: true });
      // player controls ----------------------------------------------------------------------------------------------
      $scope.playPause = function(){
        if (isGifPlaying) {
          $scope.pause();
        } else {
          $scope.play();
        }
      };
      $scope.play = function(){
        killTimer;
        isGifPlaying = true;
        gifAnimado.play();
        sondearPosicion();
        console.log('current frame', gifAnimado.get_current_frame());
      };
      $scope.pause= function(){
        killTimer();
        isGifPlaying = false;
        gifAnimado.pause();
        console.log('pause');
        console.log('current frame', gifAnimado.get_current_frame());
      }
      $scope.restart= function(){
        killTimer();
        isGifPlaying = false;
        gifAnimado.pause();
        gifAnimado.move_to(0);
        rangeSlider.value = 0;
        $scope.currentFrame = gifAnimado.get_current_frame();
        console.log('$scope.currentFrame', $scope.currentFrame);
      }
      $scope.forward= function(){
        killTimer();
        isGifPlaying = false;
        gifAnimado.pause();
        gifAnimado.move_relative(1);
        rangeSlider.value = gifAnimado.get_current_frame();
        $scope.currentFrame = gifAnimado.get_current_frame();
        console.log('current frame', gifAnimado.get_current_frame());
      }
      $scope.backward= function(){
        killTimer();
        isGifPlaying = false;
        gifAnimado.pause();
        gifAnimado.move_relative(-1);
        rangeSlider.value = gifAnimado.get_current_frame();
        $scope.currentFrame = gifAnimado.get_current_frame();
        console.log('current frame', gifAnimado.get_current_frame());
      }
      $scope.end= function(){
        killTimer();
        var posicionFinal = gifAnimado.get_length();
        gifAnimado.pause();
        gifAnimado.move_to(posicionFinal - 1);
        rangeSlider.value = gifAnimado.get_current_frame();
        $scope.currentFrame = gifAnimado.get_current_frame();
        console.log('current frame', gifAnimado.get_current_frame());
      }
      var sondearPosicion = function(){
        timer = $interval( function(){
          rangeSlider.value = gifAnimado.get_current_frame();
          $scope.currentFrame = gifAnimado.get_current_frame();
          //console.log('current frame', $scope.currentFrame);
        }, 50); // fin interval
      };// getposicion
      var killTimer = function(){
        if(angular.isDefined(timer))
        {
          $interval.cancel(timer);
          timer = undefined;
          isGifPlaying = false;
          console.log('timer cancelado');
        }
      };// killtimer
      $scope.irPosicion = function(posicion){
        gifAnimado.move_to(posicion);
        console.log('currentFrame', $scope.currentFrame);
        console.log('valor', posicion);
      };//irposicion
     // player controls ----------------------------------------------------------------------------------------------

    }); // scope.on

}) // gif player ctrl

.controller('SatSpCtrl', function($scope, $http, $window){
}) // SatSpCtrl

.controller('MeteoCtrl', function($scope, $rootScope, SFusionTable, $http, SPopup, ModeloMeteo2, SLoader){

  var showError = function(){
  var queryString = 'SELECT * FROM '+ModeloMeteo2.TABLE_METEO_ID;
  $rootScope.mostrarLupa = false;

  SPopup.show(
    'Error', ' MeteoCtrl: NO DATA. Compruebe conexión de red' );
  };

  SLoader.show();

  SFusionTable.getRemoteData(queryString)
    .success(function(data){
      if(!data.rows){
        showError();
        return;
      }
      modeloMeteo = new ModeloMeteo(data.rows);
      $scope.getItemsByCategoriaId = function(idCategoria){
        return modeloMeteo.getItemsByCategoriaId(idCategoria);
      }
      SLoader.hide();
    })//success
    .error(function(status){
      showError();
    });//error

}) // MeteoCtrl

.controller('MeteoCtrl2', function($scope, $rootScope, SFusionTable, SPopup, ModeloMeteo2, SLoader){

  $rootScope.mostrarLupa = false;
  var showError = function(status){
    SPopup.show(
      'Error', ' MeteoCtrl: Compruebe conexión de red. Estado: '+status );
  };
  var queryString = 'SELECT * FROM '+ModeloMeteo2.TABLE_METEO_ID;

  SLoader.show();

  SFusionTable.getRemoteData(queryString).success(
    function(data){
      if(!data.rows){
        SLoader.hide();
        showError('No data');
        return;
      }
      ModeloMeteo2.setData(data.rows);
      $scope.getItemsByCategoriaId = function(idCategoria){
        return ModeloMeteo2.getItemsByCategoriaId(idCategoria);
      }
      SLoader.hide();
    }//success
  ).error(function(status){
    SLoader.hide();
  });//error

})//MeteoCtrl2

; // FIN
