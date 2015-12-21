//TODO: revisar las dependencias que se pasan a los controladores
//TODO: recordar que el codigo que se encuentra en el evento on.afterviewEnter se ejecuta siempre. Probar a quitar la cache de las vistas que usan este icono a ver que pasa
//TODO: hacer perfilado, ver como se comporta la memoria y el procesador al ejecutar la app
//TODO: que en ios aparezca abajo la barra de pestañas
//TODO: hacer zoom en maapa global cuando se escoja filtro por concejo. Usar coordenaadas lat lng
//TODO: buscar imagen e icono para splash screen e icono de app
//TODO: podria ser mejor arrojar una excepcion en vez de llamaar a SPopup cada vez que hay un error. Ya se encarga el
//servicio de excepciones de capturar la excepcion y mostrar un popup. De esta forma está más centralizado el tratamiento
//de errores
//TODO: no se que pasa con el titulo del listado. revisar
//TODO: borrar console.logs

angular.module('wca.controllers',[])

// ====================================================================================================================
.controller('AppCtrl', function($scope) {

  //// With the new view caching in Ionic, Controllers are only called
  //// when they are recreated or on app start, instead of every page change.
  //// To listen for when this page is active (for example, to refresh data),
  //// listen for the $ionicView.enter event:
  ////$scope.$on('$ionicView.enter', function(e) {
  ////});
  })
// ====================================================================================================================
.controller('TabsCtrl', function($scope, $stateParams, SLoader, $rootScope, $ionicFilterBar,
                                 SFusionTable, $filter, $ionicScrollDelegate, SPopup, $ionicNavBarDelegate, SCategorias){

    SLoader.show();
    var concejo = $stateParams.concejo;
    var idCategoria = $stateParams.idCategoria;

    //TODO: revisar esto. hacer un servicio para no usar rootscope?
    $rootScope.mostrarLupa = true;

    function esSubcadena(idCategoria, urlCategoria) {
      return (urlCategoria.indexOf('categoria='+idCategoria) > -1);
    }

    //TODO: cachear las imagenes
    var sqlQuery = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid,latitud,longitud FROM '+ SFusionTable.TABLE_ID;
    SFusionTable.getRemoteData(sqlQuery).success(function(data){

      //console.log('data', data);

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

      if(!idCategoria || idCategoria == ''){
        $scope.tituloVista = 'Lista completa'
      } else {
        $scope.tituloVista = SCategorias.idCategoria_a_nombre(idCategoria);
      }

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

      SLoader.hide();

    }).error(function(data, status) {
      $ionicLoading.hide();
      SPopup.show("Error", "Fallo obteniendo datos de cámaras<br>SFusionTable.getRemoteData(): "+status)
    });

})
// ====================================================================================================================
.controller('MapaCtrl', function($scope, $stateParams, SMapa, $rootScope){

  $rootScope.mostrarLupa = false;

  $scope.$on('$ionicView.afterEnter', function() {
    var mapa = SMapa.crear(document.getElementById('mapa'));
    var layer = SMapa.creaFusionTableLayer().setMap(mapa);
    var posicion = {lat: $rootScope.cam.lat, lng: $rootScope.cam.lng};

    if(!$rootScope.cam){
      mapa.setCenter(SMapa.OVIEDO);
      mapa.setZoom(8);
    } else {
        SMapa.creaMarker(posicion, mapa);
        mapa.setCenter(posicion);
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

})
// ====================================================================================================================
.controller('MapaGlobalCtrl', function($scope, $rootScope, SMapa, SFusionTable, SPopup, SCategorias){
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

    $scope.urlCategoria_a_nombre = function(url){
      return SCategorias.url_a_nombre(url);
    }

    $scope.concejoEscogido = function(concejo){
      $scope.checked = 'con';
      // elimina retornos de carro y espacios en blanco al principio y al final
      concejo = concejo.replace(/(\r\n|\n|\r)/gm,'').trim();
      var filtroConcejo = 'Concejo=\'' + concejo + '\''; // el concejo tiene que ir entre comillas
      layer.setMap(null); // borra layer anterior si la hubiera
      layer = SMapa.creaFusionTableLayer(filtroConcejo);
      layer.setMap(mapa);
      mapa.setCenter(SMapa.OVIEDO);
      mapa.setZoom(zoomLevel);
    }; // concejo escogido

    $scope.categoriaEscogida = function(categoria){
      $scope.checked = 'cat';
      categoria = categoria.replace(/(\r\n|\n|\r)/gm,'').trim();
      var filtroCategoria = 'Categoria=\'' + categoria + '\'';
      layer.setMap(null); // borra layer antigua si la hubiera
      layer = SMapa.creaFusionTableLayer(filtroCategoria);
      layer.setMap(mapa);
      mapa.setCenter(SMapa.OVIEDO);
      mapa.setZoom(zoomLevel);
    }; // categoria escogida

    $scope.mostrarTodos = function(){
      $scope.checked = null;
      if(layer)
        layer.setMap(null);
      layer = SMapa.creaFusionTableLayer();
      layer.setMap(mapa);
      mapa.setCenter(SMapa.OVIEDO);
      mapa.setZoom(zoomLevel);
      document.getElementById('selectConcejo').selectedIndex = -1;
      document.getElementById('selectCategoria').selectedIndex = -1;
    };

    mapa = SMapa.crear(document.getElementById('mapaglobal'));
    $scope.mostrarTodos(); // por defecto

})
// ====================================================================================================================
.controller('PanoramioCtrl', function($scope, $stateParams, SMapa, $ionicModal, $rootScope, SPopup){

    if(!$rootScope.cam){
      SPopup.show('Error', 'Faltan datos. Probar otra opción de Menú');
      return;
    }
    var lat = $rootScope.cam.lat;
    var lng = $rootScope.cam.lng;
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
    $ionicModal.fromTemplateUrl('templates/modal-panoramio.html', {
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

})
// ====================================================================================================================
.controller('DetalleCtrl', function($scope, $stateParams, $ionicModal, SMapa, SClima, $filter, $rootScope,
                                    SPopup, SWikipedia, $ionicSlideBoxDelegate, $ionicPopover, Cam, SLoader){

    $scope.rowid = $stateParams.rowid;
    $rootScope.mostrarLupa = false;

    if(!$rootScope.items || !$scope.rowid){
      SPopup.show('Aviso', 'No hay datos de cámara. Escoger otra opción de menú');
      return;
    };

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
    });

    var datosCam = $filter('filter')($rootScope.items, function(cam) {
      return cam[4] == $scope.rowid;
    });

    //TODO: es cam singleton??? Si no lo es hacerlo asi
    $rootScope.cam = new Cam(datosCam);
    console.log('rootscope.cam', $rootScope.cam);

    // CLIMA ---------------------------------------------------------------------------------------------------------
    var div = document.getElementById('void');
    SClima.getData( $rootScope.cam.lat, $rootScope.cam.lng ).success(function(climadata){
      if(climadata.weather){
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
      } else {
        $scope.descripcion = 'No se ha podido obtener infromación meteorológica'
      }
    }).error(function(status){
      SPopup.show('Error', 'SClima.getData(): '+status)
    });
    // FIN CLIMA -----------------------------------------------------------------------------------------------------

    // WIKIPEDIA -----------------------------------------------------------------------------------------------------
    $scope.getInfo = function(){
      SWikipedia.info($rootScope.cam.concejo).success(function(data){
        var pageid = data.query.pageids[0];
        if(pageid) {
          $scope.infoConcejo = data.query.pages[pageid].extract;
          console.log('extract', $scope.infoConcejo);
        }
      }).error(function(status){
        $scope.infoConcejo = 'No se ha podido obtener información remota: '+status;
      });
    }//getInfo
    // WIKIPEDIA -----------------------------------------------------------------------------------------------------

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

    $scope.tipvisibility = false;
    $scope.reloadImg = function(){
      $rootScope.cam.imagen = $rootScope.cam.imagen + '#' + new Date().getTime();
      $scope.tipvisibility = true;
      console.log('scope.tipvisibility', $scope.tipvisibility);

      setTimeout(function(){
        $scope.$apply(function(){
          $scope.tipvisibility = false;
          console.log('scope.tipvisibility apagado', $scope.tipvisibility);
        })
      }, 800);
    }

})
// =====================================================================================================
.controller('StreetViewCtrl', function($scope, SMapa, $stateParams, $rootScope, SPopup){

  $rootScope.mostrarLupa = false;

  if(!$rootScope.cam) {
    SPopup.show('Error', 'Faltan datos. Probar otra opción de menú');
    return;
  }
  var coords = {lat: $rootScope.cam.lat, lng: $rootScope.cam.lng};

  $scope.$on('$ionicView.afterEnter', function() {
    var div = document.getElementById('street-view');
      var streetViewService = new google.maps.StreetViewService();
      streetViewService.getPanoramaByLocation(coords, SMapa.RADIO_BUSQUEDA, function (data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          SMapa.creaStreetView(div, data.location.latLng);
        } else {
          SPopup.show('Aviso', 'Panorama StreetView no disponible en esta ubicación<br>' +
            'getPanoramaByLocation(): '+status);
        }
      })
  })//$scope.on

})
// ====================================================================================================================
.controller('GifPlayerCtrl', function($scope, $window, $interval, $stateParams, TablaMeteo, ItemMeteo, SLoader,
                                      $state, $rootScope, SPopup){

  //TODO: crear servicio de esto
  SLoader.showWithBackdrop();

  // Obtiene itemMeteo ------------------------------------------------------------------------------------------------
  $scope.itemMeteo = new ItemMeteo(TablaMeteo.getItemById($stateParams.id_item_meteo));
  console.log('tipo imagen', $scope.itemMeteo.tipoImagen);

  // inicializaciones -------------------------------------------------------------------------------------------------
  $scope.currentFrame = 0;
  var isGifPlaying = false;
  var timer = null;
  if(angular.equals({}, $scope.itemMeteo)){
    SLoader.hide();
    SPopup.show('Error', 'No se han podido descargar datos remotos. Comprobar conexión de red');
    return;
  }
  // Detencion de timer -----------------------------------------------------------------------------------------------
  var killTimer = function(){
    if(angular.isDefined(timer))
    {
      $interval.cancel(timer);
      timer = undefined;
      isGifPlaying = false;
      console.log('timer cancelado');
    }
  };// killtimer

  // Evento ionicView.afterEnter --------------------------------------------------------------------------------------
  $scope.$on('$ionicView.afterEnter', function(){
      // Constructor de gif en base a parametros ----------------------------------------------------------------------
      var gifAnimado = new SuperGif({
        gif: document.getElementById('gif'),
        loop_mode: 0,
        draw_while_loading: 1
        //on_end: SLoader.hide()
        //max_width: $scope.dev_width
      });
      // Carga gif animado remoto y lo descompone en fotogramas para procesarlo ---------------------------------------
      gifAnimado.load(function(){
        $scope.totalFrames = gifAnimado.get_length();
        $scope.currentFrame = gifAnimado.get_current_frame();
        $scope.gifAnimado = gifAnimado;
        $scope.$apply();
        SLoader.hide();
        console.log('gifAnimado', gifAnimado);
        console.log('currentFrame', $scope.currentFrame);
      });
      var rangeSlider = document.getElementById('levelRange');
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
        killTimer();
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
          console.log('current frame', $scope.currentFrame);
        }, 50); // fin interval
      };// sondear posicion
      $scope.irPosicion = function(posicion){
        gifAnimado.move_to(posicion);
        console.log('currentFrame', $scope.currentFrame);
        console.log('valor', posicion);
      };//irposicion
      // player controls ----------------------------------------------------------------------------------------------

    }); // scope.on

  // Evento destroy ---------------------------------------------------------------------------------------------------
  $scope.$on("$destroy",function(){
      console.log('ondestroy -> pause animation');
      window.clearTimeout();
      $scope.pause();
    });

})
// ====================================================================================================================
.controller('MeteoCtrl', function($scope, $rootScope, SFusionTable, SPopup, TablaMeteo, SLoader){

  $rootScope.mostrarLupa = false;
  var showError = function(status){
    SPopup.show(
      'Error', ' MeteoCtrl: Compruebe conexión de red. Estado: '+status );
  };
  var queryString = 'SELECT * FROM '+TablaMeteo.FUSION_TABLE_ID;

  SLoader.show();

  SFusionTable.getRemoteData(queryString).success(
    function(data){
      if(!data.rows){
        SLoader.hide();
        showError('No data');
        return;
      }
      TablaMeteo.setData(data.rows);
      $scope.getItemsByCategoriaId = function(idCategoria){
        return TablaMeteo.getItemsByCategoriaId(idCategoria);
      }
      SLoader.hide();
    }//success
  ).error(function(status){
    SLoader.hide();
  });//error

})
// ====================================================================================================================
.controller('ImgViewerCtrl', function($scope, $stateParams, ItemMeteo, TablaMeteo){
    $scope.itemMeteo = new ItemMeteo( TablaMeteo.getItemById($stateParams.id_item_meteo) );
    $scope.$on('$ionicView.afterEnter', function(){
      document.getElementById('gifScroll').style.background = 'none';
    });
})
// ====================================================================================================================
  .controller('PorCategoriaCtrl', function($scope, $window, $sce){

     //Calculo de dimensiones de ventana al redimensionar
    $scope.calculateDimensions = function(gesture) {
      $scope.dev_width = $window.innerWidth;
      $scope.dev_height = $window.innerHeight;
      //console.log('dev_width', $scope.dev_width);
      //console.log('dev_height', $scope.dev_height);
    }
    angular.element($window).bind('resize', function(){
      $scope.$apply(function() {
        $scope.calculateDimensions();
      })
    });
    $scope.calculateDimensions();

    var urlGraficoSectores='https://www.google.com/fusiontables/embedviz?containerId=googft-gviz-canvas&' +
      'q=select+col1%3E%3E1%2C+count()+from+13UohUM23CESgCHVm8LZdhEQOieWzd96oImsgc1qH+group+by+col1%3E%3E1+order+by+count()+desc+limit+10' +
      '&viz=GVIZ&t=PIE&uiversion=2&gco_forceIFrame=false&gco_hasLabelsColumn=true&' +
      'gco_useFirstColumnAsDomain=true&gco_is3D=false&gco_pieHole=0.5&gco_booleanRole=certainty&' +
      'gco_hAxis=%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%7D&' +
      'gco_vAxes=%5B%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%7D%2C%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%7D%5D' +
      '&gco_title=&gco_pieSliceText=value&gco_legend=&' +
      'width=' + $scope.dev_width +'&height=' + $scope.dev_height/2;

    var urlGraficoBarras='https://www.google.com/fusiontables/embedviz?containerId=googft-gviz-canvas&' +
      'q=select+col1%3E%3E1%2C+count()+from+13UohUM23CESgCHVm8LZdhEQOieWzd96oImsgc1qH+group+by+col1%3E%3E1+order+by+count()+desc+limit+50&' +
      'viz=GVIZ&t=COLUMN&uiversion=2&gco_forceIFrame=false&gco_hasLabelsColumn=true&' +
      'gco_vAxes=%5B%7B%22title%22%3Anull%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%2C+%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22logScale%22%3Afalse%2C+%22gridlines%22%3A%7B%22count%22%3A%2210%22%7D%2C+%22minorGridlines%22%3A%7B%22count%22%3A%222%22%7D%7D%2C%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%2C+%22logScale%22%3Afalse%7D%5D&' +
      'gco_useFirstColumnAsDomain=true&gco_isStacked=false&gco_booleanRole=certainty&' +
      'gco_hAxis=%7B%22useFormatFromData%22%3Atrue%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%2C+%22viewWindow%22%3Anull%2C+%22viewWindowMode%22%3Anull%7D&' +
      'gco_legend=none&gco_title=&gco_domainAxis=%7B%22direction%22%3A1%7D&' +
      'gco_series=%7B%220%22%3A%7B%22errorBars%22%3A%7B%22errorType%22%3A%22none%22%7D%7D%7D&gco_theme=&' +
      'width=' + $scope.dev_width +'&height=' + $scope.dev_height/2;

    $scope.urlGraficoSectores = $sce.trustAsResourceUrl(urlGraficoSectores);
    $scope.urlGraficoBarras = $sce.trustAsResourceUrl(urlGraficoBarras);

  })
// ====================================================================================================================
  .controller('PorConcejoCtrl', function($scope, $window, $sce){
    //Calculo de dimensiones de ventana al redimensionar
    $scope.calculateDimensions = function(gesture) {
      $scope.dev_width = $window.innerWidth;
      $scope.dev_height = $window.innerHeight;
      //console.log('dev_width', $scope.dev_width);
      //console.log('dev_height', $scope.dev_height);
    }
    angular.element($window).bind('resize', function(){
      $scope.$apply(function() {
        $scope.calculateDimensions();
      })
    });
    $scope.calculateDimensions();

    var urlConcejosMasCams = 'https://www.google.com/fusiontables/embedviz?containerId=googft-gviz-canvas&' +
      'q=select+col3%3E%3E0%2C+count()+from+13UohUM23CESgCHVm8LZdhEQOieWzd96oImsgc1qH+group+by+col3%3E%3E0+order+by+count()+desc+limit+10' +
      '&viz=GVIZ&t=COLUMN&uiversion=2&gco_forceIFrame=false&gco_hasLabelsColumn=true&' +
      'gco_vAxes=%5B%7B%22title%22%3Anull%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%2C+%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22gridlines%22%3A%7B%22count%22%3A%226%22%7D%2C+%22minorGridlines%22%3A%7B%22count%22%3A%221%22%7D%7D%2C%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%7D%5D&' +
      'gco_useFirstColumnAsDomain=true&gco_isStacked=false&gco_booleanRole=certainty&' +
      'gco_hAxis=%7B%22useFormatFromData%22%3Atrue%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%2C+%22viewWindow%22%3Anull%2C+%22viewWindowMode%22%3Anull%2C+%22slantedText%22%3Atrue%2C+%22slantedTextAngle%22%3A90%7D' +
      '&gco_legend=none&gco_title=&gco_series=%7B%220%22%3A%7B%22targetAxisIndex%22%3A0%7D%7D&' +
      'width=' + $scope.dev_width +'&height=' + $scope.dev_height/2;


    var urlCamsConcejo = 'https://www.google.com/fusiontables/embedviz?containerId=googft-gviz-canvas&' +
      'q=select+col3%3E%3E0%2C+count()+from+13UohUM23CESgCHVm8LZdhEQOieWzd96oImsgc1qH+group+by+col3%3E%3E0+order+by+col3%3E%3E0+asc+limit+100&' +
      'viz=GVIZ&t=COLUMN&uiversion=2&gco_forceIFrame=false&gco_hasLabelsColumn=true&' +
      'gco_vAxes=%5B%7B%22title%22%3A%22%22%2C+%22minValue%22%3A0%2C+%22maxValue%22%3A11%2C+%22useFormatFromData%22%3Afalse%2C+%22viewWindow%22%3A%7B%22max%22%3A11%2C+%22min%22%3A0%7D%2C+%22logScale%22%3Afalse%2C+%22viewWindowMode%22%3A%22explicit%22%2C+%22gridlines%22%3A%7B%22count%22%3A%22-1%22%7D%2C+%22minorGridlines%22%3A%7B%22count%22%3A%221%22%7D%2C+%22formatOptions%22%3A%7B%22source%22%3A%22none%22%7D%7D%2C%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3A10%2C+%22min%22%3A0%7D%2C+%22minValue%22%3A0%2C+%22maxValue%22%3A10%2C+%22logScale%22%3Afalse%2C+%22title%22%3A%22N%C3%BAmero+webcams%22%2C+%22formatOptions%22%3A%7B%22scaleFactor%22%3Anull%7D%2C+%22gridlines%22%3A%7B%22count%22%3A%2210%22%7D%2C+%22minorGridlines%22%3A%7B%22count%22%3A%220%22%7D%2C+%22viewWindowMode%22%3A%22pretty%22%7D%5D&' +
      'gco_useFirstColumnAsDomain=true&gco_isStacked=false&gco_booleanRole=certainty&' +
      'gco_hAxis=%7B%22useFormatFromData%22%3Atrue%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%2C+%22viewWindow%22%3Anull%2C+%22viewWindowMode%22%3Anull%2C+%22title%22%3A%22%22%2C+%22slantedText%22%3Atrue%2C+%22slantedTextAngle%22%3A90%7D&' +
      'gco_legend=none&gco_title=&gco_domainAxis=%7B%22direction%22%3A1%7D&' +
      'gco_series=%7B%220%22%3A%7B%22targetAxisIndex%22%3A0%2C+%22errorBars%22%3A%7B%22errorType%22%3A%22none%22%7D%7D%7D&' +
      'width=' + $scope.dev_width +'&height=' + $scope.dev_height/2;


    $scope.urlConcejosMasCams = $sce.trustAsResourceUrl(urlConcejosMasCams);
    $scope.urlCamsConcejo = $sce.trustAsResourceUrl(urlCamsConcejo);

  })
// ====================================================================================================================

; // FIN
