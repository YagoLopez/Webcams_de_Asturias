// Url completa para consultar fusion table. Usar como plantilla
// https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps
var wcaModule = angular.module('wca.services',[]);
// ====================================================================================================================
//todo: añadir getCamsById, getCamsByConcejoCategoria
wcaModule.service('Cams', function ($http, $filter, Cam, STRINGS){

  this.FUSION_TABLE_ID = '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF';

  this.listAll = [];

  this.getAll = function () {
    return this.listAll;
  }

  this.loadData = function (pathToFile) {
    var httpRequest;
    var self = this;
    var sqlQuery = 'SELECT Lugar, Concejo, Imagen ,Categoria, rowid, latitud, longitud FROM '+ this.FUSION_TABLE_ID;
    var url = STRINGS.FUSION_TABLES_ENDPOINT + '?sql=' +(sqlQuery)+ '&key=' + STRINGS.FUSION_TABLES_API_KEY +
      '&callback=JSON_CALLBACK';
    if(pathToFile){
      httpRequest = $http.get( pathToFile, {cache: true} ); // load local json file with data for testing purposes
    } else {
      httpRequest = $http.jsonp( encodeURI(url), {cache: true} );
    }
    return httpRequest
      .success(function (response) {
        response.rows.map(function(datosCam){
          self.listAll.push( new Cam(datosCam) );
        })
      })
      .error(function (error) {
        throw(error);
      })
  }

  this.getRemoteData = function( sqlQueryString ) {
    var url = STRINGS.FUSION_TABLES_ENDPOINT+ '?sql=' +(sqlQueryString)+ '&key=' + STRINGS.FUSION_TABLES_API_KEY +
      '&callback=JSON_CALLBACK';
    // console.log(url);
    return $http.jsonp( encodeURI(url), {cache: true} );
  }

  function esSubcadena(idCategoria, urlCategoria) {
    return (urlCategoria.indexOf('categoria=' + idCategoria) > -1);
  }

  this.filterBy = function(concejo, categoria){

    var result;
    var self = this;

    return $filter('filter')(this.listAll, function(cam) {
      if (concejo && categoria) {
        result = cam.concejo.toLowerCase() === concejo.toLowerCase() && categoria.toLowerCase() === cam.categoria.toLowerCase();
      } else {
        if (concejo){
          result = cam.concejo.toLowerCase() === concejo.toLowerCase();
        }
        if (categoria){
          result = categoria.toLowerCase() === cam.categoria.toLowerCase();
        }
        if (!concejo && !categoria){
          result = self.all;
        }
      }
      return result;
    })
  }

  this.getCamByRowid = function (rowid) {
    return $filter('filter')(this.listAll, function(cam) {
      return cam.id === rowid;
    })
  }

  this.buscarCams = function (searchString) {
    return $filter('filter')(this.listAll, function(cam) {
      var matchCondition1 = cam.lugar.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
      var matchCondition2 = cam.concejo.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
      if(matchCondition1 || matchCondition2){
        return cam;
      }
    })
  }
});
// ====================================================================================================================
wcaModule.factory('Cam', function(Categorias){

  /**
   * @param arrayDatosCam {array}
   * @constructor
   */
  function Cam(arrayDatosCam){
    if(arrayDatosCam.length > 0) {
      this.lugar = arrayDatosCam[0];
      this.concejo = arrayDatosCam[1];
      this.imagen = arrayDatosCam[2];
      this.categoria = Categorias.url_a_nombre( arrayDatosCam[3] );
      this.id = arrayDatosCam[4];
      this.lat = arrayDatosCam[5];
      this.lng = arrayDatosCam[6];
    } else {
      throw new Error('Datos de Cam insuficientes');
    }
  }

  /**
   * Static factory function needed to create Cam singleton object and share cam data between views
   * @param obj {object}
   */
  Cam.create = function(obj){
    if(!angular.equals({}, obj)) {
      this.lugar = obj.lugar;
      this.concejo = obj.concejo;
      this.imagen = obj.imagen;
      this.categoria = obj.categoria;
      this.id = obj.id;
      this.lat = obj.lat;
      this.lng = obj.lng;
      return Cam;
    } else {
      throw new Error('Datos de Cam insuficientes');
    }
  }

  //todo: comprobar esta funcion
  Cam.isDefined = function () {
    return this.lat && this.lng;
  }

  return Cam;
});
// ====================================================================================================================
wcaModule.service('Mapa', function(Cams){

  var placesService, request, mapa;

  if (typeof google === 'undefined'){
    window.location = 'index.html';
    return;
  }

  this.OVIEDO = {lat: 43.4667, lng: -5.8333}; // centro de mapa vista global
  this.RADIO_BUSQUEDA = 500; // radio de búsqueda de panorama StreetView a partir de coordenadas de cam (metros)
  // this.GOOGLE_EMBBED_API_KEY = 'AIzaSyC9mdwZ_BSwmP_aAaTvBGHZC7t_UPYso6k';

  this.hallaLatLng = function (domElement, lugar, concejo, fn){
    request = {
      query: "'"+lugar+", "+concejo+", Asturias, España'",
      lenguage: 'es'
    };
    placesService = new google.maps.places.PlacesService(domElement);
    placesService.textSearch(request, callback);
    function callback(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        //console.log('Debugging resultados de busqueda street view results[0]', results[0]);
        fn(results[0].geometry.location);
      } else {
        throw new Error('No se han podido hallar coordenadas para panorama StreetView');
      }
    }
  }

  this.creaStreetView = function(domElement, locationLatLng){
    return new google.maps.StreetViewPanorama( domElement, {
      pov: {heading: 0, pitch: 0},
      position: locationLatLng,
      zoom: 1
    });
  }

  this.creaStreetView2 = function(domElement, locationLatLng, heading){
    return new google.maps.StreetViewPanorama( domElement, {
      pov: {heading: heading || 0, pitch: 0},
      position: locationLatLng,
      zoom: 1
    });
  }

  this.crear = function (domElement){
    mapa = new google.maps.Map(domElement,  {
      mapTypeControl: true,
      mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
      mapTypeId: google.maps.MapTypeId.HYBRID
    });
    return mapa;
  }

  this.creaFusionTableLayer = function(filtroMarkers){
    layer = new google.maps.FusionTablesLayer({
      heatmap: { enabled: false },
      query  : { select: 'col7', from: Cams.FUSION_TABLE_ID, where: filtroMarkers },
      options: { styleId: 6, templateId: 8 }
    });
    return layer;
  }

  this.creaMarker = function(posicionLatLng, mapa, titulo){
    var marker = new google.maps.Marker({
      position: posicionLatLng,
      map: mapa,
      title: titulo,
      icon: 'img/red-marker.png'
      //icon: 'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0'
      //animation: google.maps.Animation.DROP
    });
  }

  this.onMapLoaded = function(mapa, loader){
    google.maps.event.addListenerOnce(mapa, 'idle', function(){
      loader.hide();
    });
  }
})
// ====================================================================================================================
wcaModule.service('Clima', function($http){
  this.urlCorsProxy = 'https://cors-anywhere.herokuapp.com/';
  this.getData = function(lat, lng){
    return $http.get( this.urlCorsProxy + 'http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+
      '&appid=b7514b5aaf43d023c350462fd57a1791&lang=es&units=metric', {cache:true} );
  };
});
// ====================================================================================================================
wcaModule.service('Popup', function($ionicPopup, Loader){
  this.show = function(titulo, msg) {
    Loader.hide();
    $ionicPopup.alert({ title: titulo, template: msg });
  }
})
// ====================================================================================================================
wcaModule.service('Wikipedia', function($http){

  this.info = function(termino){
    return $http.jsonp('https://es.wikipedia.org/w/api.php?'+
      'action=query&prop=extracts|info&exintro&titles='+termino+
      '&format=json&explaintext&redirects&inprop=url&indexpageids&callback=JSON_CALLBACK', {cache: true});
  }

  this.infoRelacionada = function(termino){
    return $http.get('https://es.wikipedia.org/w/api.php?'+
      'action=query&list=search&srsearch='+termino+'&utf8=&format=json', {cache: true});
  }

  /** Respuesta en formato xml */
  this.infoLatLngGeonames = function(lat, lng){
    return $http.get('http://api.geonames.org/findNearbyWikipedia?'+
      'lat='+lat+'&lng='+lng+'&username=yagolopez&lang=es', {cache: true});
  }

  this.infoLatLngWikipedia = function(lat, lng, radioBusqueda){
    var url = 'https://es.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius='+radioBusqueda+
      '&gscoord='+lat+'|'+lng+'&format=json&callback=JSON_CALLBACK';
    return $http.jsonp(url, {cache: true});
  }

  this.infoAmpliada = function (termino){
    return $http.get('https://es.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&titles='+termino+
      '&rvprop=content&rvsection=0&rvparse');
  }

  /** Bueno para lugares concretos con descripción breve */
  this.openSearch = function(termino){
    return $http.jsonp('https://es.wikipedia.org/w/api.php?action=opensearch&'+
      'search='+termino+'&callback=JSON_CALLBACK', {cache: true});
  }
})
// ====================================================================================================================
wcaModule.service('ItemsMeteo', function($http, $filter, ItemMeteo, STRINGS){

  var FUSION_TABLE_ID = '1Y_vt2nTVFSYHpMuwe0u60bQzp4FlLtc33A8qd2_x';

  this.all = [];

  this.loadData = function() {

    var self = this;
    var sqlQueryString = 'SELECT * FROM '+FUSION_TABLE_ID+' ORDER BY id ASC';
    var url = STRINGS.FUSION_TABLES_ENDPOINT+ '?sql=' +(sqlQueryString)+ '&key=' + STRINGS.FUSION_TABLES_API_KEY +
      '&callback=JSON_CALLBACK';

    return $http.jsonp( encodeURI(url), {cache: true} )
      .success(function (results) {
        // console.log(results);
        results.rows.map(function(itemData){
          self.all.push( new ItemMeteo(itemData) );
        })
      })
      .error(function (error) {
        console.log(error);
      });
  }

  this.getItemsByCategoriaId = function(idCategoria) {
    return $filter('filter')(this.all, function (item) {
      return (idCategoria.toString() === item.idCategoria);
    }, true);
  }

  this.getItemById = function(idItem) {
    return $filter('filter')(this.all, function (item) {
      return (idItem.toString() === item.id);
    }, true);
  }
})
// ====================================================================================================================
wcaModule.factory('ItemMeteo', function(){

  var urlProxy = 'https://script.google.com/macros/s/AKfycbyX6ViYZ2IuHEurQXJ--t_UOqRTyQZ9yGeSeLcbiM7ZSVcTujTw/exec?url=';
  //var urlProxy = 'https://cors-anywhere.herokuapp.com/';
  //var urlProxy = 'http://www.whateverorigin.org/get?url='
  //var urlProxy = 'http://anyorigin.com/get?url=';
  //var urlProxy = 'http://dontfilter.us/browse.php?&f=norefer&u=';
  //var urlProxy = 'http://proxy2974.my-addr.org/myaddrproxy.php/';

  function ItemMeteo(arr){
    if(arr.length > 0){
      this.id = arr[0];
      this.info = arr[1];
      this.categoria = arr[2]; // No confundir this.categoria con this.idCategoria ni this.id
      this.nombre = arr[3];
      this.espectro = arr[4];
      this.fuente = arr[5];
      this.urlNoProxy = arr[6];
      this.url = urlProxy + (arr[6])+ '&callback=jsonpCallback';
      this.idCategoria= arr[7];
      this.tipoImagen= arr[8];
      this.urlFuente = arr[9];
    }
  }
  return ItemMeteo;
})
// ====================================================================================================================
wcaModule.service('Loader', function($ionicLoading){

  var spinnerIco = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>";
  var contenidoLoader = "Cargando datos...";

  this.show = function(texto){
    if(texto){
      contenidoLoader = texto;
    }
    $ionicLoading.show({template: contenidoLoader, noBackdrop: true, hideOnStateChange: true, duration: 60*1000 });
  }

  this.showWithBackdrop = function(texto){
    if(texto){
      contenidoLoader = texto;
    }
    $ionicLoading.show({template: contenidoLoader, noBackdrop: false, hideOnStateChange: true, duration: 60*1000});
  }

  this.hide = function(){
    $ionicLoading.hide();
  }
})
// ====================================================================================================================
wcaModule.factory('$exceptionHandler', function($injector) {
  return function(exception, cause) {
    var Popup = $injector.get('Popup');
    console.error(exception);
    Popup.show( 'Error', 'Data: '+(exception || exception.data)+ '<br>Status: '+(exception.status)+
      '<br>Text: '+exception.statusText+ '<br>Message: '+(exception.message) );
  }
})
// ====================================================================================================================
wcaModule.service('Categorias', function(){
  var nombreCategoria;
  var urlBaseCategoria = 'http://webcamsdeasturias.com/interior.php?categoria=';

  this.url_a_nombre = function(urlCategoria){
    (urlCategoria === urlBaseCategoria+'1') && (nombreCategoria = 'Poblaciones');
    (urlCategoria === urlBaseCategoria+'2') &&  (nombreCategoria = 'Puertos');
    (urlCategoria === urlBaseCategoria+'3') &&  (nombreCategoria = 'Montaña');
    (urlCategoria === urlBaseCategoria+'5') &&  (nombreCategoria = 'Ríos');
    (urlCategoria === urlBaseCategoria+'7') && (nombreCategoria = 'Playas');
    return nombreCategoria;
  };

  this.idCategoria_a_nombre = function(idCategoria){
    return this.url_a_nombre(urlBaseCategoria+idCategoria);
  }

  this.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
})
// ====================================================================================================================
wcaModule.constant('STRINGS', {
  FUSION_TABLES_API_KEY: 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps',
  FUSION_TABLES_ENDPOINT: 'https://www.googleapis.com/fusiontables/v2/query',
  ERROR: 'No se han podido obtener datos remotos. Posibles causas: ' +
    '(1) Sin conexión de datos. (2) Fallo de servidor remoto',
  RECARGANDO_IMG: 'Recargando imagen...'
})
