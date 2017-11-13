//todo: arreglar service worker
//todo: usar google maps embed api. consultar link en carpeta temp
//todo: tamaño e icons en manifest.json
//todo: detalles en meteo.html no aparecen
//todo: calcular altura en imagenes en vista mosaico.html
//todo: cancelar carga de imagen en vista detalle.html como en gif-player.html
//todo: info de mareas
//todo: en vista "detalle.html", "buscar.html", etc. usar resolve para comprobar si hay cams en rootscope y en caso contrario, cargarlas usando el servicio Cams
//todo: tests para carga de datos de fusion table en listadoCtrl
//todo: borrar comentarios en services.js
//todo: mejorar orientacion imagenes street view (heading)
//TODO: podria ser mejor arrojar una excepcion en vez de llamar a Popup cada vez que hay un error. Ya se encarga el
//TODO: servicio de excepciones de capturar la excepcion y mostrar un popup. De esta forma está más centralizado el tratamiento
//TODO: de errores
//TODO: hacer perfilado en chrome mobile, ver como se comporta la memoria y el procesador
//TODO: hacer zoom en mapa global cuando se escoja filtro por concejo. Usar coordenadas lat lng
//TODO: añadir favoritos
//todo: geolocalizacion y busqueda webcams cercanas

var wcaModule = angular.module('wca.controllers',[]);
// ====================================================================================================================
wcaModule.controller('ListadoCtrl', function ($scope, $stateParams, $rootScope, STRINGS,
  $filter, $ionicScrollDelegate, Cams, Categorias, Loader) {

  var concejo = $stateParams.concejo;
  var idCategoria = $stateParams.idCategoria;
  $rootScope.cams = [];
  $scope.camsFiltradas = [];

  Loader.show('Cargando...');
  // if($rootScope.cams.length === 0){
  //   Cams.getRemoteData(sqlQuery)
  //     .then(function (response) {
  //       var listaCams = response.data.rows;
  //       // Lista de todas las cams sin filtrar
  //       $rootScope.cams = listaCams;
  //       // Lista cams filtradas por concejo y categoria
  //       $scope.camsFiltradas = Cams.filtrarPor(concejo, idCategoria, listaCams);
  //       Loader.hide();
  //     })
  //     .catch(function (error) {
  //       $scope.error = STRINGS.ERROR;
  //       throw(error);
  //     });
  // } else {
  //   $scope.camsFiltradas = Cams.filtrarPor(concejo, idCategoria, response);
  // }


  Cams.getAll()
    .then(function () {
      $scope.cams = Cams.filtrarPor(concejo, idCategoria);
      Loader.hide();
    });


  $scope.$on('$ionicView.afterEnter', function(){
    $scope.concejo = concejo;
    $scope.idCategoria = idCategoria;
    if (!idCategoria || idCategoria === '') {
      $scope.tituloVista = 'Todas'
    } else {
      $scope.tituloVista = Categorias.idCategoria_a_nombre(idCategoria);
    }
  });
});
// ====================================================================================================================
wcaModule.controller('MapaCtrl', function($scope, Mapa, $rootScope, $location){

  var mapa, layer, posicion;
  if(!$rootScope.cam){
    $location.path( "#/" );
    return;
  }
  $scope.$on('$ionicView.afterEnter', function() {
    mapa = Mapa.crear(document.getElementById('mapa'));
    layer = Mapa.creaFusionTableLayer().setMap(mapa);
    posicion = {lat: $rootScope.cam.lat, lng: $rootScope.cam.lng};
    Mapa.creaMarker(posicion, mapa);
    mapa.setCenter(posicion);
    mapa.setZoom(18);
  });
});
// ====================================================================================================================
wcaModule.controller('MapaGlobalCtrl', function($scope, $rootScope, $filter, Mapa, Cams, Popup,
  Categorias){

  var layer, mapa, sqlQueryConcejos, sqlQueryCategorias, zoomLevel = 7;
  sqlQueryConcejos = 'SELECT Concejo FROM '+Cams.TABLE_ID+' GROUP BY Concejo';
  sqlQueryCategorias = 'SELECT Categoria FROM '+Cams.TABLE_ID+' GROUP BY Categoria';
  $scope.filtro = {categoria: '', concejo: ''};

  //todo: refactorizar y trasladar a servicio Cams
  Cams.getRemoteData(sqlQueryConcejos).success(function(data){
    $scope.concejos = data.rows;
  }).error(function(status){
    console.error('MapaGlobalCtrl.getRemoteData() status:', status);
  });

  Cams.getRemoteData(sqlQueryCategorias).success(function(data){
    $scope.categorias = data.rows;
  }).error(function(status){
    console.error('MapaGlobalCtrl.getRemoteData() status:', status);
  });

  //todo: sustituir remote queries por filtros sobre datos de $rootScope.cams
  // console.log('rootScope.cams', $rootScope.cams);
  // $scope.categorias = $filter('filter')($rootScope.cams, function(cam) {
  //   console.log('filtering categorias', cam[3]);
  // });

  $scope.urlCategoria_a_nombre = function(url){
    return Categorias.url_a_nombre(url);
  };

  $scope.categoriaEscogida = function(categoria){
    var filtroCategoria;
    categoria = categoria.replace(/(\r\n|\n|\r)/gm,'').trim();
    filtroCategoria = 'Categoria=\'' + categoria + '\'';
    layer.setMap(null); // borra layer antigua si la hubiera
    layer = Mapa.creaFusionTableLayer(filtroCategoria);
    layer.setMap(mapa);
    mapa.setCenter(Mapa.OVIEDO);
    mapa.setZoom(zoomLevel);
    $scope.filtro.concejo = '';
  };

  $scope.concejoEscogido = function(concejo){
    // Elimina retornos de carro y espacios en blanco al principio y al final
    var filtroConcejo;
    concejo = concejo.replace(/(\r\n|\n|\r)/gm,'').trim();
    filtroConcejo = 'Concejo=\'' + concejo + '\''; // el concejo tiene que ir entre comillas
    layer.setMap(null); // borra layer anterior si la hubiera
    layer = Mapa.creaFusionTableLayer(filtroConcejo);
    layer.setMap(mapa);
    mapa.setCenter(Mapa.OVIEDO);
    mapa.setZoom(zoomLevel);
    $scope.filtro.categoria = '';
  };

  $scope.mostrarTodas = function(){
    layer && layer.setMap(null);
    layer = Mapa.creaFusionTableLayer();
    layer.setMap(mapa);
    mapa.setCenter(Mapa.OVIEDO);
    mapa.setZoom(zoomLevel);
    $scope.filtro.categoria = '';
    $scope.filtro.concejo = '';
  };

  // Activa manualmente el ciclo de deteccion de cambios de angular (digest cycle) para evaluar javascript externo
  // (En este caso google maps). Nota: $scope.$apply() da error.
  setTimeout(function () {
    mapa = Mapa.crear(document.getElementById('mapaglobal'));
    $scope.mostrarTodas(); // por defecto
  }, 0);
});
// ====================================================================================================================
wcaModule.controller('DetalleCtrl', function($scope, $stateParams, $ionicModal, Clima, $filter, $rootScope,
  Popup, Wikipedia, $ionicPopover, Cam, Loader, $location, Cams, STRINGS){

  // Init --------------------------------------------------------------------------------------------------------------

  Loader.show('Cargando...');
  if(Cams.listaCams.length < 1 || !$stateParams.rowid){
    $location.path('#/'); // si no hay lista de cams redirigir a root
    return;
  }
  $rootScope.cam = new Cam( Cams.getCamByRowid($stateParams.rowid) );

  // Clima Data --------------------------------------------------------------------------------------------------------

  $scope.infoMeteo = ' (Obteniendo datos del servidor...)';
  // Priority is webcam image load. Wait 1000 ms before loading clima data
  $scope.timerGetClimaData = setTimeout( function(){
    Clima.getData( $rootScope.cam.lat, $rootScope.cam.lng ).success(function(climadata){
      if(climadata.weather){
        $scope.infoMeteo = climadata.weather[0].description;
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
        $scope.infoMeteo = STRINGS.ERROR;
      }
    }).error(function(status){
      $scope.infoMeteo = STRINGS.ERROR;
      console.error('Clima.getData(): ', status);
    });
  }, 1000);

  // Wikipedia Info ----------------------------------------------------------------------------------------------------

  $scope.infoConcejo = 'Cargando...';
  $scope.getWikipediaInfo = function(){
    Wikipedia.info($rootScope.cam.concejo + '_(Asturias)').success(function(data){
      var pageid = data.query.pageids[0];
      if(pageid) {
        $scope.infoConcejo = data.query.pages[pageid].extract;
        $scope.wikiUrl = data.query.pages[pageid].fullurl;
      }
    }).error(function(status){
      $scope.infoConcejo = STRINGS.ERROR;
      console.error('Wikipedia.info()', status)
    })
  };

  // Popover Menu ------------------------------------------------------------------------------------------------------

  $ionicPopover.fromTemplateUrl('templates/popover.html', {scope: $scope})
    .then(function(popover) {$scope.popover = popover});

  // Reload image ------------------------------------------------------------------------------------------------------

  $scope.reloadImg = function(){
    Loader.show('Recargando imagen...');
    setTimeout(function(){
      $scope.$apply(function(){
        $rootScope.cam.imagen = $rootScope.cam.imagen + '#' + new Date().getTime().toString().substring(0, 3);
        console.log('Recargando imagen: ', $rootScope.cam.imagen);
        Loader.hide();
      })
    }, 600);
  };

  $scope.imgLoaded = function(){
    Loader.hide();
  };

  // Live Cycle Events -------------------------------------------------------------------------------------------------

  // On view-exit, clear timers to prevent memory leaks
  $scope.$on('$ionicView.beforeLeave', function (event, data) {
    clearTimeout($scope.timerGetClimaData);
  })

});
// ====================================================================================================================
wcaModule.controller('MeteoblueCtrl', function ($scope, $rootScope, $location) {

  // todo: crear una funcion en Servicio Cam: checkCamExists()
  if(!$rootScope.cam){
    $location.path('#/'); // si no hay datos de cam redirigir a root y abortar
    return;
  }

  $scope.timerMeteoblue = setTimeout(function () {
    $scope.$apply(function () {
      $scope.urlMeteoblue = 'https://www.meteoblue.com/meteogram-web?' +
        ('lon=' + $rootScope.cam.lng) + ('&lat=' + $rootScope.cam.lat) + ('&lang=es&look=CELSIUS,KILOMETER_PER_HOUR');
    })
  }, 500);

  // On view exit, clear timers to prevent memory leaks
  $scope.$on('$ionicView.beforeLeave', function (event, data) {
    clearTimeout($scope.timerMeteoblue);
  })
});
// ====================================================================================================================
wcaModule.controller('StreetViewCtrl', function($scope, Mapa, $rootScope, Popup, $location, $ionicSideMenuDelegate){

  // Initializations
  if(!$rootScope.cam) {
    $location.path( "#/" );
    return;
  }
  var coords = {lat: $rootScope.cam.lat, lng: $rootScope.cam.lng};
  $ionicSideMenuDelegate.canDragContent(false);

  $scope.$on('$ionicView.afterEnter', function() {
    var div = document.getElementById('street-view');
    var loader = document.querySelector('.loader');
    var streetViewService = new google.maps.StreetViewService();
    streetViewService.getPanoramaByLocation(coords, Mapa.RADIO_BUSQUEDA, function (data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        //todo: revisar
        Mapa.creaStreetView2(div, data.location.latLng);
      } else {
        Popup.show('Aviso', 'Panorama StreetView no disponible en esta ubicación<br>' +status);
      }
      loader.parentNode.removeChild(loader);
    })
  });

  $scope.$on('$ionicView.leave', function(){
    $ionicSideMenuDelegate.canDragContent(true);
  });

});
// ====================================================================================================================
wcaModule.controller('GifPlayerCtrl', function($scope, $interval, $stateParams, ItemsMeteo, ItemMeteo, Loader,
  Popup, $location, STRINGS){

  // Inicializaciones -------------------------------------------------------------------------------------------------

  var timer, killTimer, gifAnimado, convertDataURIToBinary, rangeSlider, sondearPosicion, successAjax, errorAjax,
    makeGifAnimadoPanZoom;
  var loadingHtml = 'Cargando...<br/>El proceso puede tardar' +
    '<div id="cancelLinkContainer"><button><a id="cancelLink" href="#/app/meteo">Cancelar</a></div></button>';

  Loader.showWithBackdrop(loadingHtml);
  $scope.currentFrame = 0;
  $scope.isGifPlaying = false;
  $scope.itemMeteo = new ItemMeteo(ItemsMeteo.getItemById($stateParams.id_item_meteo));
  if(angular.equals({}, $scope.itemMeteo)){
    Loader.hide();
    $location.path( '#/' );
    return;
  }
  // Fin Inicializaciones ---------------------------------------------------------------------------------------------

  killTimer = function(){
    if(angular.isDefined(timer)) {
      $interval.cancel(timer);
      timer = undefined;
      $scope.isGifPlaying = false;
    }
  };

  convertDataURIToBinary = function(dataURI) {
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

  makeGifAnimadoPanZoom = function (htmlElement) {
    htmlElement.panzoom({
      $zoomIn: $('.zoom-in'),
      $zoomOut: $('.zoom-out'),
      $zoomRange: $('.zoom-range'),
      $reset: $('.reset'),
      minScale: 1, maxScale: 4, increment: 0.5, rangeStep: 0.1, duration: 200, contain: 'invert'
    });
  };

  successAjax = function(response) {
    // ====== Creacion de gifAnimado ===============================================
    gifAnimado = new SuperGif({
      gif: document.getElementById('gif'),
      loop_mode: 0,
      draw_while_loading: 1
    });
    // ====== Carga datos resultantes de peticion ajax en gifAnimado ==============
    gifAnimado.load_raw( convertDataURIToBinary(response.image_data), function () {
      $scope.totalFrames = gifAnimado.get_length();
      $scope.currentFrame = gifAnimado.get_current_frame();
      $scope.gifAnimado = gifAnimado;

      // player controls
      rangeSlider = document.getElementById('levelRange');
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
      sondearPosicion = function(){
        timer = $interval( function(){
          var currentFrame = gifAnimado.get_current_frame();
          rangeSlider.value = currentFrame;
          $scope.currentFrame = currentFrame;
        }, 50);
      };
      $scope.irPosicion = function(posicion){
        gifAnimado.move_to(posicion);
      };
      makeGifAnimadoPanZoom($('.jsgif > canvas'));
      Loader.hide();
    })
  };

  errorAjax = function(ajaxRequest, textStatus, error) {
    if (error.message === "jsonpCallback was not called"){
      console.warn('Abortando peticion ajax');
      ajaxRequest.abort();
      ajaxRequest = null;
      return;
    }
    document.getElementById('gif').src = '';
    console.error(error);
    Loader.hide();
    Popup.show('Error', STRINGS.ERROR);
    // $location.path(' #/app/meteo' );
  };

  // Peticion AJAX  para obtener datos de imagenes remotas en formato base64 ------------------------------------------
  // Por usar un proxy remoto no compatible con Angular, hay que usar $.ajax de JQuery
  $.ajax({
    type: 'GET',
    url: $scope.itemMeteo.url,
    async: true,
    jsonpCallback: 'jsonpCallback',
    contentType: 'application/json',
    dataType: 'jsonp',
    cache: true,
    success: successAjax,
    error: errorAjax
  });

  // Evento destroy view ----------------------------------------------------------------------------------------------
  $scope.$on("$destroy",function(){
    window.clearTimeout(0);
    $scope.pause && $scope.pause();
  });
  // Fin evento destroy view ------------------------------------------------------------------------------------------

});
// ====================================================================================================================
wcaModule.controller('MeteoCtrl', function($scope, Cams, Popup, ItemsMeteo, Loader){

  var queryString = 'SELECT * FROM '+ItemsMeteo.FUSION_TABLE_ID+' ORDER BY id ASC';
  var showError = function(status){
    Popup.show('Error', ' MeteoCtrl: Compruebe conexión de red. Estado: '+status );
  };
  Loader.showWithBackdrop('Cargando...');
  $scope.loading = true;

  Cams.getRemoteData(queryString).success(
    function(data){
      if(!data.rows){
        Loader.hide();
        showError('Respuesta nula');
        $scope.loading = false;
        return;
      }
      ItemsMeteo.setData(data.rows);
      $scope.getItemsByCategoriaId = function(idCategoria){
        return ItemsMeteo.getItemsByCategoriaId(idCategoria);
      };
      Loader.hide();
      $scope.loading = false;
    }
  ).error(function(status){
    Loader.hide();
    $scope.loading = false;
  });

});
// ====================================================================================================================
wcaModule.controller('MeteoDetalleCtrl', function($scope, $stateParams, ItemMeteo, ItemsMeteo, $location){

  $scope.itemMeteo = new ItemMeteo( ItemsMeteo.getItemById($stateParams.id_item_meteo) );

  if(angular.equals({}, $scope.itemMeteo)){
    $location.path('#/');
  }
  // $scope.$on('$ionicView.afterEnter', function(){
  //   document.getElementById('scroll-img-meteo').style.background = 'none';
  // });
});
// ====================================================================================================================
wcaModule.controller('PorCategoriaCtrl', function($scope, $window, $sce){

  var urlGraficoSectores, urlGraficoBarras;

  // $scope.$on('$ionicView.beforeEnter', function () {
  //   Loader.showWithBackdrop('Cargando...');
  // });
  //Calculo de dimensiones de ventana al redimensionar
  $scope.calculateDimensions = function(gesture) {
    if($window.innerWidth > 765){
      $scope.dev_width = $window.innerWidth - 270;
    } else {
      $scope.dev_width = $window.innerWidth;
    }
    $scope.dev_height = $window.innerHeight;
  };
  angular.element($window).bind('resize', function(){
    $scope.$apply(function() {
      $scope.calculateDimensions();
    })
  });
  $scope.calculateDimensions();

  urlGraficoSectores='https://www.google.com/fusiontables/embedviz?containerId=googft-gviz-canvas&' +
    'q=select+col1%3E%3E1%2C+count()+from+13UohUM23CESgCHVm8LZdhEQOieWzd96oImsgc1qH+group+by+col1%3E%3E1+order+by+count()+desc+limit+10' +
    '&viz=GVIZ&t=PIE&uiversion=2&gco_forceIFrame=false&gco_hasLabelsColumn=true&' +
    'gco_useFirstColumnAsDomain=true&gco_is3D=false&gco_pieHole=0.5&gco_booleanRole=certainty&' +
    'gco_hAxis=%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%7D&' +
    'gco_vAxes=%5B%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%7D%2C%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%7D%5D' +
    '&gco_title=&gco_pieSliceText=value&gco_legend=&' +
    'width=' + $scope.dev_width +'&height=' + $scope.dev_height/2;

  urlGraficoBarras='https://www.google.com/fusiontables/embedviz?containerId=googft-gviz-canvas&' +
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

  $scope.cargaIFrameTerminada = function(){
    // Loader.hide();
    alert();
  }

  });
// ====================================================================================================================
wcaModule.controller('PorConcejoCtrl', function($scope, $window, $sce){

  var urlConcejosMasCams, urlCamsConcejo, iframeHeigth = 550;

  // $scope.endLoad = false;
  $scope.calculateDimensions = function(gesture) {
    if($window.innerWidth > 765){
      $scope.dev_width = $window.innerWidth - 270;
    } else {
      $scope.dev_width = $window.innerWidth;
    }
  };
  angular.element($window).bind('resize', function(){
    $scope.$apply(function() {
      $scope.calculateDimensions();
    })
  });
  $scope.calculateDimensions();

  urlConcejosMasCams = 'https://www.google.com/fusiontables/embedviz?containerId=googft-gviz-canvas&' +
    'q=select+col3%3E%3E0%2C+count()+from+13UohUM23CESgCHVm8LZdhEQOieWzd96oImsgc1qH+group+by+col3%3E%3E0+order+by+count()+desc+limit+10' +
    '&viz=GVIZ&t=COLUMN&uiversion=2&gco_forceIFrame=false&gco_hasLabelsColumn=true&' +
    'gco_vAxes=%5B%7B%22title%22%3Anull%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%2C+%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22gridlines%22%3A%7B%22count%22%3A%226%22%7D%2C+%22minorGridlines%22%3A%7B%22count%22%3A%221%22%7D%7D%2C%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3Anull%2C+%22min%22%3Anull%7D%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%7D%5D&' +
    'gco_useFirstColumnAsDomain=true&gco_isStacked=false&gco_booleanRole=certainty&' +
    'gco_hAxis=%7B%22useFormatFromData%22%3Atrue%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%2C+%22viewWindow%22%3Anull%2C+%22viewWindowMode%22%3Anull%2C+%22slantedText%22%3Atrue%2C+%22slantedTextAngle%22%3A90%7D' +
    '&gco_legend=none&gco_title=&gco_series=%7B%220%22%3A%7B%22targetAxisIndex%22%3A0%7D%7D&' +
    'width=' + $scope.dev_width +'&height='+ iframeHeigth;

  urlCamsConcejo = 'https://www.google.com/fusiontables/embedviz?containerId=googft-gviz-canvas&' +
      'q=select+col3%3E%3E0%2C+count()+from+13UohUM23CESgCHVm8LZdhEQOieWzd96oImsgc1qH+group+by+col3%3E%3E0+order+by+col3%3E%3E0+asc+limit+100&' +
      'viz=GVIZ&t=COLUMN&uiversion=2&gco_forceIFrame=false&gco_hasLabelsColumn=true&' +
      'gco_vAxes=%5B%7B%22title%22%3A%22%22%2C+%22minValue%22%3A0%2C+%22maxValue%22%3A11%2C+%22useFormatFromData%22%3Afalse%2C+%22viewWindow%22%3A%7B%22max%22%3A11%2C+%22min%22%3A0%7D%2C+%22logScale%22%3Afalse%2C+%22viewWindowMode%22%3A%22explicit%22%2C+%22gridlines%22%3A%7B%22count%22%3A%22-1%22%7D%2C+%22minorGridlines%22%3A%7B%22count%22%3A%221%22%7D%2C+%22formatOptions%22%3A%7B%22source%22%3A%22none%22%7D%7D%2C%7B%22useFormatFromData%22%3Atrue%2C+%22viewWindow%22%3A%7B%22max%22%3A10%2C+%22min%22%3A0%7D%2C+%22minValue%22%3A0%2C+%22maxValue%22%3A10%2C+%22logScale%22%3Afalse%2C+%22title%22%3A%22N%C3%BAmero+webcams%22%2C+%22formatOptions%22%3A%7B%22scaleFactor%22%3Anull%7D%2C+%22gridlines%22%3A%7B%22count%22%3A%2210%22%7D%2C+%22minorGridlines%22%3A%7B%22count%22%3A%220%22%7D%2C+%22viewWindowMode%22%3A%22pretty%22%7D%5D&' +
      'gco_useFirstColumnAsDomain=true&gco_isStacked=false&gco_booleanRole=certainty&' +
      'gco_hAxis=%7B%22useFormatFromData%22%3Atrue%2C+%22minValue%22%3Anull%2C+%22maxValue%22%3Anull%2C+%22viewWindow%22%3Anull%2C+%22viewWindowMode%22%3Anull%2C+%22title%22%3A%22%22%2C+%22slantedText%22%3Atrue%2C+%22slantedTextAngle%22%3A90%7D&' +
      'gco_legend=none&gco_title=&gco_domainAxis=%7B%22direction%22%3A1%7D&' +
      'gco_series=%7B%220%22%3A%7B%22targetAxisIndex%22%3A0%2C+%22errorBars%22%3A%7B%22errorType%22%3A%22none%22%7D%7D%7D&' +
      'width=' + $scope.dev_width +'&height=' + iframeHeigth;

  $scope.urlConcejosMasCams = $sce.trustAsResourceUrl(urlConcejosMasCams);
  $scope.urlCamsConcejo = $sce.trustAsResourceUrl(urlCamsConcejo);

});
// ====================================================================================================================
wcaModule.controller('WindyCtrl', function($scope, Loader, $sce, $stateParams){

  var windyTipo = $stateParams.tipo;
  Loader.show('Cargando...');

  if(windyTipo === 'viento'){
    $scope.windyUrl = $sce.trustAsResourceUrl('https://embed.windytv.com/embed2.html?lat=40.280&lon=-3.647&zoom=5&' +
      'level=surface&overlay=wind&menu=true&message=true&marker=&forecast=12&calendar=now&location=coordinates&' +
      'type=map&actualGrid=&metricWind=km%2Fh&metricTemp=%C2%B0C');
    $scope.windyTitle = 'Viento';
  }

  if(windyTipo === 'oleaje'){
    $scope.windyUrl = $sce.trustAsResourceUrl('https://embed.windytv.com/embed2.html?lat=40.280&lon=-3.647&zoom=5&' +
      'level=surface&overlay=waves&menu=true&message=true&marker=&forecast=12&calendar=now&location=coordinates&' +
      'type=map&actualGrid=&metricWind=km%2Fh&metricTemp=%C2%B0C');
    $scope.windyTitle = 'Oleaje';
  }

  $scope.cargaIFrameTerminada = function(){
    Loader.hide();
  }
});
// ====================================================================================================================
wcaModule.controller('BuscarCamsCtrl', function($scope, $rootScope, $filter, Cams, Loader, $location){

  var inputBuscaCam = document.getElementById('inputBuscaCam');
  $scope.busqueda = {lugar: ''};
  $scope.camsEncontradas = [];
  $scope.showImages = false;

  if(Cams.listaCams.length < 1){
    $location.path('#/'); // si no hay lista de cams redirigir a root y abortar
    return;
  }

  $scope.buscarCams = function(param){
    var matchCondition1, matchCondition2;
    $scope.showImages = false;
    if($scope.busqueda.lugar.length < 1){
      $scope.camsEncontradas = [];
      return;
    }
    // $scope.camsEncontradas = Cams.buscarCams($scope.busqueda.lugar, $rootScope.cams);
    $scope.camsEncontradas = Cams.buscarCams($scope.busqueda.lugar, Cams.listaCams);
  };

  $scope.resetBusqueda = function($event){
    $scope.showImages = false;
    $scope.camsEncontradas = [];
    inputBuscaCam.value = '';
    setTimeout(function () {
      inputBuscaCam.focus();
    }, 500);
  };

  $scope.toggleShowImages = function () {
    $scope.showImages = !$scope.showImages;
  }
});
