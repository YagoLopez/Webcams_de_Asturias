//todo: revisar datos de openweathermap y su carga a traves de proxy. puede que funione usando jsonp
//todo: posicionar bien en el centro ion-loader android
//todo: convertir la actual arquitectura a componentes
//todo: usar una base de datos json como lokijs, etc.
//todo: usar clausula finally() en peticiones $http para simplificar tratamiento errores
//todo: posibilidad de usar google maps embed api. consultar link en carpeta temp
//todo: calcular altura en imagenes en vista mosaico.html
//todo: new feature: info de mareas
//todo: tests para carga de datos de fusion table en listadoCtrl
//todo: mejorar orientacion imagenes street view (heading)
//TODO: hacer perfilado en chrome mobile, ver como se comporta la memoria y el procesador
//TODO: hacer zoom en mapa global cuando se escoja filtro por concejo. Usar coordenadas lat lng
//TODO: new feature: añadir favoritos
//todo: new feature: geolocalizacion y busqueda webcams cercanas
//todo: probar ionic native transitions
//todo: new feature: flickr api images

var wcaModule = angular.module('wca.controllers',[]);
// ====================================================================================================================
wcaModule.controller('ListadoCtrl', function ($scope, $stateParams, Cams, Loader, Categorias) {

  var concejo = $stateParams.concejo;
  var categoria = $stateParams.categoria;

  $scope.cams = Cams.filterBy(concejo, categoria);
  Loader.hide();

  $scope.$on('$ionicView.afterEnter', function(){
    $scope.concejo = concejo;
    $scope.categoria = categoria;
    if ($scope.cams.length === Cams.getAll().length) {
      $scope.titulo = 'Todas';
    } else {
      if (categoria && $scope.cams.length > 0) {
        $scope.titulo = Categorias.capitalizeFirstLetter(categoria);
      }
      if (concejo) {
        $scope.titulo = Categorias.capitalizeFirstLetter(concejo);
      }
    }
  })
})
// ====================================================================================================================
wcaModule.controller('DetalleCtrl', function($scope, $stateParams, $ionicModal, Clima,
  Popup, Wikipedia, $ionicPopover, Cams, Cam, Loader, $location, STRINGS){

  // Init --------------------------------------------------------------------------------------------------------------

  var loaderContent = 'Cargando...' +
    '<div id="cancelLinkContainer"><button><a id="cancelLink" href="#/">Cancelar</a></div></button>';
  Loader.show(loaderContent);
  $scope.cam = Cam.create( Cams.getCamByRowid($stateParams.rowIdCam)[0] );

  // Clima Data --------------------------------------------------------------------------------------------------------

  $scope.infoMeteo = ' (Obteniendo datos del servidor...)';
  // Priority is webcam image load. Wait 1000 ms before loading clima data
  $scope.timerGetClimaData = setTimeout( function(){
    Clima.getData( Cam.lat, Cam.lng )
      .success(function(climadata){
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
    })
    .error(function(status){
        $scope.infoMeteo = STRINGS.ERROR;
        console.error(status);
    });
  }, 1000);

  // Wikipedia Info ----------------------------------------------------------------------------------------------------

  $scope.infoConcejo = 'Cargando...';
  $scope.getWikipediaInfo = function(){
    Wikipedia.info(Cam.concejo + '_(Asturias)')
      .success(function(data){
        var pageid = data.query.pageids[0];
        if(pageid) {
          $scope.infoConcejo = data.query.pages[pageid].extract;
          $scope.wikiUrl = data.query.pages[pageid].fullurl;
        }
    })
    .error(function(status){
      $scope.infoConcejo = STRINGS.ERROR;
      console.error(status);
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
        Cam.imagen = Cam.imagen + '#' + new Date().getTime().toString().substring(0, 3);
        console.log('Recargando imagen: ', Cam.imagen);
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

})
// ====================================================================================================================
wcaModule.controller('DetalleMapaCtrl', function($scope, Mapa, Cams, Cam, $stateParams, $ionicSideMenuDelegate){

  var mapa, mapaLayer, posicion;

  if (!Cam.isDefined()) {
    $scope.cam = Cams.getCamByRowid($stateParams.camId)[0];
  } else {
    $scope.cam = Cam;
  }

  $scope.$on('$ionicView.afterEnter', function() {
    mapa = Mapa.crear(document.getElementById('mapa'));
    mapaLayer = Mapa.creaFusionTableLayer();
    mapaLayer.setMap(mapa);
    posicion = {lat: $scope.cam.lat, lng: $scope.cam.lng};
    Mapa.creaMarker(posicion, mapa);
    mapa.setCenter(posicion);
    mapa.setZoom(18);
    $ionicSideMenuDelegate.canDragContent(false);
  });
})
// ====================================================================================================================
wcaModule.controller('MapaGlobalCtrl', function($scope, Mapa, Cams, Popup, Categorias){

  var layer, mapa, sqlQueryConcejos, sqlQueryCategorias, zoomLevel = 7;
  $scope.filtro = {categoria: '', concejo: ''};
  $scope.concejos = Cams.getUniqueValuesFromField('concejo');
  $scope.categorias = Cams.getUniqueValuesFromField('categoria');

  $scope.categoriaEscogida = function(categoria){
    var filtroCategoria = 'Categoria=\'' + Categorias.nombre_a_url(categoria) + '\'';
    layer.setMap(null); // borra layer antigua si la hubiera
    layer = Mapa.creaFusionTableLayer(filtroCategoria);
    layer.setMap(mapa);
    mapa.setCenter(Mapa.OVIEDO);
    mapa.setZoom(zoomLevel);
    $scope.filtro.concejo = '';
  };

  $scope.concejoEscogido = function(concejo){
    var filtroConcejo = 'Concejo=\'' + concejo + '\''; // el concejo tiene que ir entre comillas en el filtro
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

  // Activa manualmente el ciclo de deteccion de cambios de AngularJS (digest cycle) para evaluar javascript externo
  // (En este caso Google Maps). Nota: cuando $scope.$apply() da error, usar $scope.$applyAsync() o $scope.$evalAsync()
  $scope.$evalAsync(function () {
    if (!angular.equals({}, Mapa)) {
      mapa = Mapa.crear(document.getElementById('mapaglobal'));
      $scope.mostrarTodas(); // por defecto
    }
  });
})
// ====================================================================================================================
wcaModule.controller('MeteoblueCtrl', function ($scope, $location, Cam) {

  var timerMeteoblue;
  if(!Cam.isDefined()) {
    $location.path( "#/" );
    return;
  }

  $scope.cam = Cam;

  timerMeteoblue = setTimeout(function () {
    $scope.urlMeteoblue = 'https://www.meteoblue.com/meteogram-web?' +
      ('lon=' + Cam.lng) + ('&lat=' + Cam.lat) + ('&lang=es&look=CELSIUS,KILOMETER_PER_HOUR');
  }, 500);

  // On view exit, clear timers to prevent memory leaks
  $scope.$on('$ionicView.beforeLeave', function (event, data) {
    clearTimeout(timerMeteoblue);
  })
})
// ====================================================================================================================
wcaModule.controller('StreetViewCtrl', function($scope, Mapa, Popup, $ionicSideMenuDelegate, Cams, Cam, $stateParams){

  var camCoords, div, ionSpinner, streetViewService;


  if (!Cam.isDefined()) {
    $scope.cam = Cams.getCamByRowid($stateParams.camId)[0];
  } else {
    $scope.cam = Cam;
  }

  camCoords = {lat: $scope.cam.lat, lng: $scope.cam.lng};
  streetViewService = new google.maps.StreetViewService();

  $scope.$on('$ionicView.afterEnter', function() {
    div = document.getElementById('street-view');
    ionSpinner = document.querySelector('ion-spinner');
    $ionicSideMenuDelegate.canDragContent(false);
    streetViewService.getPanoramaByLocation(camCoords, Mapa.RADIO_BUSQUEDA, function (data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        //todo: revisar
        Mapa.creaStreetView2(div, data.location.latLng);
      } else {
        Popup.show('Aviso', 'Panorama StreetView no disponible en esta ubicación<br>' +status);
      }
      ionSpinner && ionSpinner.parentNode.removeChild(ionSpinner);
    })
  });

  $scope.$on('$ionicView.leave', function(){
    $ionicSideMenuDelegate.canDragContent(true);
  });

})
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
  $scope.itemMeteo = ItemsMeteo.getItemById($stateParams.id_item_meteo)[0];
  if(!$scope.itemMeteo){
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

})
// ====================================================================================================================
wcaModule.controller('MeteoCtrl', function ($scope, Popup, ItemsMeteo, Loader){

  Loader.showWithBackdrop('Cargando...');
  $scope.loading = true;
  $scope.getItemsMeteoByCategoria = function(idCategoria){
    return ItemsMeteo.getItemsByCategoriaId(idCategoria);
  }

  ItemsMeteo.loadData()
    .success(function (result) {
      $scope.loading = false;
      Loader.hide();
    })
    .error(function (status) {
      $scope.loading = false;
      Loader.hide();
      console.error(status);
    })

})
// ====================================================================================================================
wcaModule.controller('MeteoDetalleCtrl', function($scope, $stateParams, ItemsMeteo, $location){

  $scope.itemMeteo = ItemsMeteo.getItemById($stateParams.id_item_meteo)[0];

  if(!$scope.itemMeteo){
    $location.path('#/');
  }
  // $scope.$on('$ionicView.afterEnter', function(){
  //   document.getElementById('scroll-img-meteo').style.background = 'none';
  // });
})
// ====================================================================================================================
wcaModule.controller('PorCategoriaCtrl', function($scope, $window, $sce, Loader){

  var urlGraficoSectores, urlGraficoBarras;
  var graficoSectoresLoaded = false;
  var graficoBarrasLoaded = false;

  Loader.showWithBackdrop('Cargando...');

  $scope.setGraficoSectoresLoaded = function () {
    graficoSectoresLoaded = true;
    graficoBarrasLoaded && Loader.hide();
  }

  $scope.setGraficoBarrasLoaded = function () {
    graficoBarrasLoaded = true;
    graficoSectoresLoaded && Loader.hide();
  }

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

  })
// ====================================================================================================================
wcaModule.controller('PorConcejoCtrl', function($scope, $window, $sce, Loader){

  var urlConcejosMasCams, urlCamsConcejo, iframeHeigth = 550;
  var concejosConMasCamsLoaded = false;
  var camsPorConcejoLoaded = false;

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

  Loader.showWithBackdrop('Cargando...');

  $scope.setConcejosConMasCamsLoaded = function () {
    concejosConMasCamsLoaded = true;
    camsPorConcejoLoaded && Loader.hide();
  }

  $scope.setCamsPorConcejoLoaded = function () {
    camsPorConcejoLoaded = true;
    concejosConMasCamsLoaded && Loader.hide();
  }
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

})
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
})
// ====================================================================================================================
wcaModule.controller('BuscarCamsCtrl', function($scope, $filter, Cams, $location){

  var inputBuscaCam = document.getElementById('inputBuscaCam');
  $scope.busqueda = {lugar: ''};
  $scope.camsEncontradas = [];
  $scope.showImages = false;

  if(Cams.getAll().length < 1) {
    $location.path( "#/" );
    return;
  }

  $scope.buscarCams = function(param){
    $scope.showImages = false;
    if($scope.busqueda.lugar.length < 1){
      $scope.camsEncontradas = [];
      return;
    }
    $scope.camsEncontradas = Cams.buscarCams($scope.busqueda.lugar, Cams.getAll());
  }

  $scope.resetBusqueda = function($event){
    if (inputBuscaCam.value) {
      $scope.showImages = false;
      $scope.camsEncontradas = [];
      inputBuscaCam.value = '';
      inputBuscaCam.focus();
    }
  }

  $scope.toggleShowImages = function () {
    $scope.showImages = !$scope.showImages;
  }
})
// ====================================================================================================================
wcaModule.controller('ImgDetalleCtrl', function ($scope, $location, Cam) {
  if(!Cam.isDefined()){
    $location.path('#/');
    return;
  }
  $scope.cam = Cam;
})
