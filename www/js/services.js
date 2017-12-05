// Url completa para consultar fusion table. Usar como plantilla
// https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps
var wcaModule = angular.module('wca.services',[]);
// ====================================================================================================================
wcaModule.service('Cams', function ($http, $filter, Cam, STRINGS){

  // var sqlQueryConcejos = 'SELECT Concejo FROM '+Cams.FUSION_TABLE_ID+' GROUP BY Concejo';
  // var sqlQueryCategorias = 'SELECT Categoria FROM '+Cams.FUSION_TABLE_ID+' GROUP BY Categoria';

  var listAllCams = [];

  this.FUSION_TABLE_ID = '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF';

  function getUrlFusionTableQuery(sqlQueryString) {
    return STRINGS.FUSION_TABLES_ENDPOINT + '?sql=' +(sqlQueryString)+ '&key=' + STRINGS.FUSION_TABLES_API_KEY +
      '&callback=JSON_CALLBACK';
  }

  this.add = function (cam) {
    listAllCams.push(cam);
  }

  this.getAll = function () {
    return listAllCams;
  }

  this.getRemoteData = function( sqlQueryString ) {
    return $http.jsonp( encodeURI(getUrlFusionTableQuery(sqlQueryString)), {cache: true} );
  }

  this.loadRemoteData = function (pathToFile) {
    var httpRequest;
    var sqlQueryString = 'SELECT Lugar, Concejo, Imagen ,Categoria, rowid, latitud, longitud FROM '+ this.FUSION_TABLE_ID;
    if(pathToFile){
      httpRequest = $http.get( pathToFile, {cache: true} ); // load local json file with data for testing purposes
    } else {
      httpRequest = $http.jsonp( encodeURI(getUrlFusionTableQuery(sqlQueryString)), {cache: true} );
    }
    return httpRequest
  }

  this.filterBy = function(concejo, categoria){

    var result;
    var self = this;

    return $filter('filter')(listAllCams, function(cam) {
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
          result = listAllCams;
        }
      }
      return result;
    })
  }

  this.getCamByRowid = function (rowid) {
    return $filter('filter')(listAllCams, function(cam) {
      return cam.id === rowid;
    })
  }

  this.buscarCams = function (searchString) {
    return $filter('filter')(listAllCams, function(cam) {
      var matchCondition1 = cam.lugar.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
      var matchCondition2 = cam.concejo.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
      if(matchCondition1 || matchCondition2){
        return cam;
      }
    })
  }

  this.getUniqueValuesFromField = function (objKey) {
    var cam, uniqueValuesList = [];
    for (i = 0; i < listAllCams.length; i++) {
      cam = listAllCams[i];
      if (uniqueValuesList.indexOf( cam[objKey]) === -1 ) {
        uniqueValuesList.push( cam[objKey] );
      }
    }
    return uniqueValuesList;
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
      this.urlCategoria = arrayDatosCam[3];
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
      this.urlCategoria = obj.urlCategoria;
      this.id = obj.id;
      this.lat = obj.lat;
      this.lng = obj.lng;
      return Cam;
    } else {
      throw new Error('Datos de Cam insuficientes');
    }
  }

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

  this.onMapLoaded = function(mapa, ionLoader){
    google.maps.event.addListenerOnce(mapa, 'idle', function(){
      ionLoader.hide();
    });
  }
})
// ====================================================================================================================
wcaModule.service('Clima', function($http){

  var createUrlOpenWheatherMap = function (lat, lng) {
    return 'https://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+
      '&appid=b7514b5aaf43d023c350462fd57a1791&lang=es&units=metric'+ '&callback=JSON_CALLBACK';
  }

  this.getData = function(lat, lng){
    return $http.jsonp( createUrlOpenWheatherMap(lat, lng), {cache:true} );
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

  var listAll = [];
  var ITEMS_METEO_TABLE_ID = '1Y_vt2nTVFSYHpMuwe0u60bQzp4FlLtc33A8qd2_x';

  this.loadData = function() {

    var sqlQueryString = 'SELECT * FROM '+ ITEMS_METEO_TABLE_ID +' ORDER BY id ASC';
    var url = STRINGS.FUSION_TABLES_ENDPOINT+ '?sql=' +(sqlQueryString)+ '&key=' + STRINGS.FUSION_TABLES_API_KEY +
      '&callback=JSON_CALLBACK';

    return $http.jsonp( encodeURI(url), {cache: true} )
      .success(function (results) {
        results.rows.map(function(itemData){
          listAll.push( new ItemMeteo(itemData) );
        })
      })
      .error(function (error) {
        console.log(error);
      });
  }

  this.getItemsByCategoriaId = function(idCategoria) {
    return $filter('filter')(listAll, function (item) {
      return (idCategoria.toString() === item.idCategoria);
    }, true);
  }

  this.getItemById = function(idItem) {
    return $filter('filter')(listAll, function (item) {
      return (idItem.toString() === item.id);
    }, true);
  }
})
// ====================================================================================================================
wcaModule.factory('ItemMeteo', function(){

  // Url proxy google de App Script
  var urlProxy = 'https://script.google.com/macros/s/AKfycbyX6ViYZ2IuHEurQXJ--t_UOqRTyQZ9yGeSeLcbiM7ZSVcTujTw/exec?url=';

  // Otro proxy de google por si falla el anterior
  var urlProxy2 = 'https://script.google.com/macros/s/AKfycby_WcmX-_rrdqP8tKPwlz1Gw3amIJ3lZQUVYRaIkAKWQZbauNo/exec?url=';

  // Antiguos proxies como referncia
  //var urlProxy = 'https://cors-anywhere.herokuapp.com/';
  //var urlProxy = 'http://www.whateverorigin.org/get?url='
  //var urlProxy = 'http://anyorigin.com/get?url=';
  //var urlProxy = 'http://dontfilter.us/browse.php?&f=norefer&u=';
  //var urlProxy = 'http://proxy2974.my-addr.org/myaddrproxy.php/';

  function ItemMeteo(arr){
    if(arr.length > 0){
      this.id = arr[0];
      this.info = arr[1];
      this.categoria = arr[2];
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

  // var spinnerIco = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>";
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
  //noinspection UnnecessaryLocalVariableJS
  var catchAndThrowException = function (exception, cause) {
    var Popup = $injector.get('Popup');
    var popupContent = 'Data: '+(exception || exception.data)+ '<br>Status: '+(exception.status)+
      '<br>Text: '+exception.statusText+ '<br>Message: '+(exception.message);
    console.error(exception);
    Popup.show( 'Error', popupContent );
  }
  return catchAndThrowException;
})
// ====================================================================================================================
wcaModule.service('Categorias', function(){

  var urlBaseCategoria = 'http://webcamsdeasturias.com/interior.php?categoria=';

  this.url_a_nombre = function(urlCategoria){
    var nombreCategoria;
    (urlCategoria === urlBaseCategoria+'1') && (nombreCategoria = 'Poblaciones');
    (urlCategoria === urlBaseCategoria+'2') &&  (nombreCategoria = 'Puertos');
    (urlCategoria === urlBaseCategoria+'3') &&  (nombreCategoria = 'Montaña');
    (urlCategoria === urlBaseCategoria+'5') &&  (nombreCategoria = 'Ríos');
    (urlCategoria === urlBaseCategoria+'7') && (nombreCategoria = 'Playas');
    return nombreCategoria;
  };

  this.nombre_a_url = function(nombreCategoria){
    var result;
    (nombreCategoria.toLowerCase() === 'poblaciones') && (result = urlBaseCategoria + '1');
    (nombreCategoria .toLowerCase() === 'puertos') && (result = urlBaseCategoria + '2');
    (nombreCategoria .toLowerCase() === 'montaña') && (result = urlBaseCategoria + '3');
    (nombreCategoria .toLowerCase() === 'ríos') && (result = urlBaseCategoria + '5');
    (nombreCategoria .toLowerCase() === 'playas') && (result = urlBaseCategoria + '7');
    return result;
  }

  // this.idCategoria_a_nombre = function(idCategoria){
  //   return this.url_a_nombre(urlBaseCategoria+idCategoria);
  // }

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

// Http proxies, por si hicieran falta en el futuro
// var urlGoogleAppsScriptHttpProxy = 'https://script.google.com/macros/s/AKfycby_WcmX-_rrdqP8tKPwlz1Gw3amIJ3lZQUVYRaIkAKWQZbauNo/exec?url=';
// var urlGoogleAppsScriptHttpProxy2 = 'https://script.google.com/macros/s/AKfycbyX6ViYZ2IuHEurQXJ--t_UOqRTyQZ9yGeSeLcbiM7ZSVcTujTw/exec?url=';