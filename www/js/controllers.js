//TODO: intentar acceder a bbdd en el controlador del estado app para cargar los datos siempre que se inicie la app
//todo: hacer icono y Splash screen
//TODO: usar native trnsitions
//TODO: revisar las dependencias que se pasan a los controladores
//TODO: recordar que el codigo que se encuentra en el evento ionicView.afterEnter se ejecuta siempre. Probar a quitar la cache de las vistas que usan este icono a ver que pasa
//TODO: hacer perfilado en chrome mobile, ver como se comporta la memoria y el procesador al ejecutar la app
//TODO: hacer zoom en mapa global cuando se escoja filtro por concejo. Usar coordenadas lat lng
//TODO: podria ser mejor arrojar una excepcion en vez de llamaar a SPopup cada vez que hay un error. Ya se encarga el
//servicio de excepciones de capturar la excepcion y mostrar un popup. De esta forma está más centralizado el tratamiento
//de errores
//TODO: añadir favoritos

angular.module('wca.controllers',[])

// ====================================================================================================================
.controller('MapaCtrl', function($scope, SMapa, $rootScope){

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
.controller('MapaGlobalCtrl', function($scope, SMapa, SFusionTable, SPopup, SCategorias){
    var layer = null;
    var mapa = null;
    var zoomLevel = 7;
    $scope.checked = null;

    var sqlQueryConcejos = 'SELECT Concejo FROM '+SFusionTable.TABLE_ID+' GROUP BY Concejo';

    SFusionTable.getRemoteData(sqlQueryConcejos).success(function(data){
      $scope.concejos = data.rows;
    }).error(function(status){
      SPopup.show('Error', 'Fallo cargando lista concejos. El servidor no respondió: '+status);
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
.controller('PanoramioCtrl', function($scope, $ionicModal, $rootScope, SPopup){

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

    $scope.fotos = FotosPanoramio;
    $scope.nextPhoto = function(){
      if (hayFotoSiguiente())
        FotosPanoramio.setPosition( FotosPanoramio.getPosition()+1 );
    }
    $scope.prevPhoto = function(){
      if (hayFotoAnterior())
        FotosPanoramio.setPosition( FotosPanoramio.getPosition()-1 );
    }
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
      } else {
        SPopup.show('Error', 'Fallo al conectar con el servidor de fotos de Panoramio');
        console.error('PanoramioCtrl.showModal(): Fallo al conectar con el servidor de fotos de Panoramio');
      }
    }
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    // FIN DIALOGO MODAL ----------------------------------------------------------------------------------------------

})
// ====================================================================================================================
.controller('DetalleCtrl', function($scope, $stateParams, $ionicModal, SClima, $filter, $rootScope,
                                    SPopup, SWikipedia, $ionicPopover, Cam, SLoader){

    // init
    $scope.rowid = $stateParams.rowid;
    SLoader.show('Cargando...');

    if(!$rootScope.items || !$scope.rowid){
      SLoader.hide();
      SPopup.show('Aviso', 'No hay datos de cámara. Escoger otra opción de menú');
      return;
    };

    var datosCam = $filter('filter')($rootScope.items, function(cam) {
      return cam[4] == $scope.rowid;
    });
    //TODO: es cam singleton??? Si no lo es hacerlo asi
    $rootScope.cam = new Cam(datosCam);
    //console.log('rootscope.cam', $rootScope.cam);

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
    // WIKIPEDIA -----------------------------------------------------------------------------------------------------
    $scope.infoConcejo = 'Cargando...'
    $scope.getInfo = function(){
      SWikipedia.info($rootScope.cam.concejo).success(function(data){
        var pageid = data.query.pageids[0];
        if(pageid) {
          $scope.infoConcejo = data.query.pages[pageid].extract;
          $scope.wikipediaCredits = '<br>Fuente: <a href="http://org.wikipedia.es" target="_blank">Wikipedia</a>';
        }
      }).error(function(status){
        $scope.infoConcejo = 'No se ha podido obtener información remota: '+status;
      });
    }//getInfo
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
    // POPOVER -------------------------------------------------------------------------------------------------
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
    });
    // IMG RELOAD -------------------------------------------------------------------------------------------------
    $scope.reloadImg = function(){
      $rootScope.cam.imagen = $rootScope.cam.imagen + '#' + new Date().getTime();
      SLoader.show('Recargando imagen...');
      setTimeout(function(){
        $scope.$apply(function(){
          SLoader.hide();
        })
      }, 500);
    }
    // FIN IMG RELOAD -------------------------------------------------------------------------------------------------

    $scope.imgLoaded = function(){
      SLoader.hide();
    }

  })
// =====================================================================================================
.controller('StreetViewCtrl', function($scope, SMapa, $rootScope, SPopup){

  if(!$rootScope.cam) {
    SPopup.show('Error', 'Datos insuficientes. Probar otra opción de menú');
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
.controller('GifPlayerCtrl', function($scope, $interval, $stateParams, TablaMeteo, ItemMeteo, SLoader, SPopup){

    SLoader.showWithBackdrop('Cargando...');

    // Obtiene itemMeteo ------------------------------------------------------------------------------------------------

    $scope.itemMeteo = new ItemMeteo(TablaMeteo.getItemById($stateParams.id_item_meteo));

    // inicializaciones -------------------------------------------------------------------------------------------------

    $scope.currentFrame = 0;
    $scope.isGifPlaying = false;
    var timer = null;
    if(angular.equals({}, $scope.itemMeteo)){
      SLoader.hide();
      SPopup.show('Error', 'Datos insuficientes. Posibles causas: ' +
        '(1) No conexión de datos. (2) Fallo servidor remoto. Probar otra opción de menú');
      return;
    };
    var killTimer = function(){
      if(angular.isDefined(timer))
      {
        $interval.cancel(timer);
        timer = undefined;
        $scope.isGifPlaying = false;
      }
    };
    var gifAnimado = null;
    var urlImg = 'http://sat24.mobi/Image/satir/europa/sp';
    var convertDataURIToBinary = function(dataURI) {
      var BASE64_MARKER = ';base64,';
      var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
      var base64 = dataURI.substring(base64Index);
      var raw = window.atob(base64);
      var rawLength = raw.length;
      var array = new Uint8Array(new ArrayBuffer(rawLength));
      for(i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
      }
      return array;
    };








    var rangeSlider = document.getElementById('levelRange');
    $scope.playPause = function(){
      if ($scope.isGifPlaying) {
        $scope.pause();
      } else {
        $scope.play();
      }
    };
    $scope.pause= function(){
      killTimer();
      $scope.isGifPlaying = false;
      gifAnimado.pause();
    };
    $scope.play = function(){
      killTimer();
      $scope.isGifPlaying = true;
      gifAnimado.play();
      sondearPosicion();
    };
    $scope.restart= function(){
      killTimer();
      gifAnimado.pause();
      gifAnimado.move_to(0);
      rangeSlider.value = 0;
      $scope.currentFrame = 0;
    };
    $scope.forward= function(){
      killTimer();
      gifAnimado.pause();
      gifAnimado.move_relative(1);
      rangeSlider.value = gifAnimado.get_current_frame();
      $scope.currentFrame = gifAnimado.get_current_frame();
    };
    $scope.backward= function(){
      killTimer();
      gifAnimado.pause();
      gifAnimado.move_relative(-1);
      rangeSlider.value = gifAnimado.get_current_frame();
      $scope.currentFrame = gifAnimado.get_current_frame();
    };
    $scope.end= function(){
      killTimer();
      var posicionFinal = gifAnimado.get_length()-1;
      gifAnimado.pause();
      gifAnimado.move_to(posicionFinal);
      rangeSlider.value = posicionFinal;
      $scope.currentFrame = posicionFinal;
    };
    var sondearPosicion = function(){
      timer = $interval( function(){
        var currentFrame = gifAnimado.get_current_frame();
        rangeSlider.value = currentFrame;
        $scope.currentFrame = currentFrame;
      }, 50);
    };
    $scope.irPosicion = function(posicion){
      gifAnimado.move_to(posicion);
    };










    // Peticion AJAX  para obtener datos de imagenes remotas en formato base64 -------------------------------------------

    // Por usar un proxy remoto no compatible con angular hay que usar $.ajax de JQuery
    $.ajax({
      type: 'GET',
      url: $scope.itemMeteo.url,
      async: true,
      jsonpCallback: 'jsonpCallback',
      contentType: 'application/json',
      dataType: 'jsonp',
      cache: true,
      success: function(resp) {
        // ====== Cración de gifAnimado ===============================================//
        gifAnimado = new SuperGif({
          gif: document.getElementById('gif'),
          loop_mode: 0,
          draw_while_loading: 1
        });
        // ====== Carga datos resultantes de peticion ajax en gifAnimado ===============//
        gifAnimado.load_raw( convertDataURIToBinary(resp.image_data), function () {
          $scope.totalFrames = gifAnimado.get_length();
          $scope.currentFrame = gifAnimado.get_current_frame();
          $scope.gifAnimado = gifAnimado;

          // ========= PanZoom ==========================================================//
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

          //$scope.$apply();
          SLoader.hide();
        })
      },
      error: function(error) {
        console.error( error.message );
        SLoader.hide();
        SPopup.show('Error de red', 'Comprobar conexión');
      }
    });

    // player controls ----------------------------------------------------------------------------------------------

/*    var rangeSlider = document.getElementById('levelRange');
    $scope.playPause = function(){
      if ($scope.isGifPlaying) {
        $scope.pause();
      } else {
        $scope.play();
      }
    };
    $scope.pause= function(){
      killTimer();
      $scope.isGifPlaying = false;
      gifAnimado.pause();
    };
    $scope.play = function(){
      killTimer();
      $scope.isGifPlaying = true;
      gifAnimado.play();
      sondearPosicion();
    };
    $scope.restart= function(){
      killTimer();
      gifAnimado.pause();
      gifAnimado.move_to(0);
      rangeSlider.value = 0;
      $scope.currentFrame = 0;
    };
    $scope.forward= function(){
      killTimer();
      gifAnimado.pause();
      gifAnimado.move_relative(1);
      rangeSlider.value = gifAnimado.get_current_frame();
      $scope.currentFrame = gifAnimado.get_current_frame();
    };
    $scope.backward= function(){
      killTimer();
      gifAnimado.pause();
      gifAnimado.move_relative(-1);
      rangeSlider.value = gifAnimado.get_current_frame();
      $scope.currentFrame = gifAnimado.get_current_frame();
    };
    $scope.end= function(){
      killTimer();
      var posicionFinal = gifAnimado.get_length()-1;
      gifAnimado.pause();
      gifAnimado.move_to(posicionFinal);
      rangeSlider.value = posicionFinal;
      $scope.currentFrame = posicionFinal;
    };
    var sondearPosicion = function(){
      timer = $interval( function(){
        var currentFrame = gifAnimado.get_current_frame();
        rangeSlider.value = currentFrame;
        $scope.currentFrame = currentFrame;
      }, 50);
    };
    $scope.irPosicion = function(posicion){
      gifAnimado.move_to(posicion);
    };*/

  // Evento destroy ---------------------------------------------------------------------------------------------------

  $scope.$on("$destroy",function(){
      window.clearTimeout(0);
      $scope.pause();
  });

})
// ====================================================================================================================
.controller('MeteoCtrl', function($scope, SFusionTable, SPopup, TablaMeteo, SLoader){

  var showError = function(status){
    SPopup.show('Error', ' MeteoCtrl: Compruebe conexión de red. Estado: '+status );
  };
  var queryString = 'SELECT * FROM '+TablaMeteo.FUSION_TABLE_ID+' ORDER BY id ASC';

  SLoader.show('Cargando...');

  SFusionTable.getRemoteData(queryString).success(
    function(data){
      if(!data.rows){
        SLoader.hide();
        showError('Respuesta nula');
        return;
      }
      TablaMeteo.setData(data.rows);
      $scope.getItemsByCategoriaId = function(idCategoria){
        return TablaMeteo.getItemsByCategoriaId(idCategoria);
      }
      SLoader.hide();
    }
  ).error(function(status){
    SLoader.hide();
  });

})
// ====================================================================================================================
.controller('ImgViewerCtrl', function($scope, $stateParams, ItemMeteo, TablaMeteo){
    $scope.itemMeteo = new ItemMeteo( TablaMeteo.getItemById($stateParams.id_item_meteo) );
    $scope.$on('$ionicView.afterEnter', function(){
      document.getElementById('imgMeteo').style.background = 'none';
    });
})
// ====================================================================================================================
.controller('PorCategoriaCtrl', function($scope, $window, $sce, SLoader){

    $scope.$on('$ionicView.beforeEnter', function () {
      SLoader.showWithBackdrop();
    });
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

    $scope.cargaFrameTerminada = function(){
      SLoader.hide();
    }

  })
// ====================================================================================================================
.controller('PorConcejoCtrl', function($scope, $window, $sce, SLoader){

    SLoader.showWithBackdrop();
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

    $scope.cargaFrameTerminada = function(){
      SLoader.hide();
    }
  })
// ====================================================================================================================
.controller('ListadoCtrl', function($scope, $stateParams, $rootScope, $ionicFilterBar,
                                   SFusionTable, $filter, $ionicScrollDelegate, SCategorias, $ionicHistory, SLoader) {

    SLoader.show();
    var concejo = $stateParams.concejo;
    var idCategoria = $stateParams.idCategoria;
    var camsFiltradasPorUrl;

    function esSubcadena(idCategoria, urlCategoria) {
      return (urlCategoria.indexOf('categoria=' + idCategoria) > -1);
    }
    //$scope.$on('$ionicView.beforeEnter', function(){
      $ionicHistory.clearCache();
    //});
    var sqlQuery = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid,latitud,longitud FROM '+ SFusionTable.TABLE_ID;
    SFusionTable.getRemoteData(sqlQuery).success(function(data) {

      if (data.error) {
        console.error(data);
        $scope.error = 'Error consulta sql. '+data;
        SLoader.hide();
      }
      // -------------------------------------------------------------------------------------------------------------
      // FILTRO 1: filtra las cams por parametros de url: concejo y categoria
      // -------------------------------------------------------------------------------------------------------------
      camsFiltradasPorUrl = $filter('filter')(data.rows, function (cam) {
        if (concejo && idCategoria) {
          // cam[1]: concejo de camara, cam[3]: url categoria (no id de categoria, no confundir)
          return (cam[1].toLowerCase() == concejo.toLowerCase() && esSubcadena(idCategoria, cam[3]));
        } else {
          if (concejo)
            return cam[1].toLowerCase() == concejo.toLowerCase();
          if (idCategoria)
            return esSubcadena(idCategoria, cam[3]);
          if (!concejo && !idCategoria)
            return data.rows;
        }
      });
      // Inicialmente items contiene las cams filtradas solo por parametros de url
      $rootScope.items = camsFiltradasPorUrl;
      // Despues de filtrar, guardar parametros en scope. Se hace asi para que el filtrado sea mas eficiente
      $rootScope.concejo = concejo;
      $rootScope.idCategoria = idCategoria;
      if (!idCategoria || idCategoria == '') {
        $rootScope.tituloVista = 'Todas'
      } else {
        $rootScope.tituloVista = SCategorias.idCategoria_a_nombre(idCategoria);
      }
      // -------------------------------------------------------------------------------------------------------------
      // FILTRO 2: filtra las cams segun una cadena de texto que haya introducido el usuario en la barra de busqueda
      // -------------------------------------------------------------------------------------------------------------
      // este filtro se aplica sobre los datos previamente filtrados por parametros url
      //TODO: Habría que mejorar la búsqueda para que fuera menos estricta. Por ejemplo, si se introduce "puerto llanes" no se
      //encuentra "Puerto de Llanes"
      $rootScope.showFilterBar = function () {
        $rootScope.filterBarInstance = $ionicFilterBar.show({
          items: $rootScope.items,
          update: function (filteredItems, filteredText) {
            //console.log('rootscope.items', $rootScope.items);
            $rootScope.items = filteredItems;
            $ionicScrollDelegate.scrollTop(false);
          },
          cancelText: 'Cancelar',
          //done: function(){
          //},
          //cancel: function(){
          //},
          cancelOnStateChange: false
        });
      };
      SLoader.hide();
    }).error(function(data, status) {
      $scope.error = "Error obteniendo datos de webcams. ListadoCtrl.SFusionTable.getRemoteData(): "+status+
          '. Posibles causas: (1) No conexión datos. (2) Fallo servidor remoto';
      SLoader.hide();
    });

    $scope.$on('$ionicView.afterEnter', function(){
      $rootScope.mostrarLupa = true;
      $('ion-filter-bar').show();
    })

    $scope.$on('$ionicView.beforeLeave', function(){
      $rootScope.mostrarLupa = false;
      $('ion-filter-bar').hide();
    })

  })
// ====================================================================================================================
; // FIN
