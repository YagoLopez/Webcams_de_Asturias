// url completa para consultar fusion table. Usar como plantilla
// https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps

wcaModule = angular.module('wca.services',[]);
// ====================================================================================================================
/*
wcaModule.service('SFusionTable', function($http){

  var API_ENDPOINT = 'https://www.googleapis.com/fusiontables/v2/query';
  var API_KEY = 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps';

  this.TABLE_ID = '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF';

  this.getRemoteData = function( sqlQueryString ) {
    var url = API_ENDPOINT+ '?sql=' +encodeURI(sqlQueryString)+ '&key=' +API_KEY+ '&callback=JSON_CALLBACK';
    return $http.jsonp( encodeURI(url), {cache: true} );
  };

  this.getLocalData = function(path_fichero){
    return $http.get(path_fichero);
  };
});
*/
// ====================================================================================================================
wcaModule.service('SFusionTable', function($http){

  // Antiguas claves de identificacion
  var API_ENDPOINT = 'https://www.googleapis.com/fusiontables/v2/query';
  var API_KEY = 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps';

  // Nuevas claves de identificacion usando OAuth2
  var ID_CLIENT_OAUTH2 = '657321649789-3oh0002a4bnqiflmkmv0q47slvi21jdi.apps.googleusercontent.com';
  var OAUTH2_SECRET = 'gT0WTpsma4NNqhmsAG7owIqA';
  var auth_token = {
    "web": {
      "client_id": "657321649789-3oh0002a4bnqiflmkmv0q47slvi21jdi.apps.googleusercontent.com",
      "project_id": "webcams-de-asturias",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://accounts.google.com/o/oauth2/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_secret": "gT0WTpsma4NNqhmsAG7owIqA"
    }
  };

  this.TABLE_ID = '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF';

  this.getRemoteData = function( sqlQueryString ) {
    var url = API_ENDPOINT+ '?sql=' +(sqlQueryString)+ '&key=' +API_KEY+ '&callback=JSON_CALLBACK';
    // console.log(sqlQueryString);
    return $http.jsonp( encodeURI(url), {cache: true} );
  };

  this.getRemoteDataOAuth = function( sqlQueryString ) {
    var url = API_ENDPOINT+ '?sql=' +encodeURI(sqlQueryString);
    return $http.get( encodeURI(url), {cache: true, headers: {'Authorization': auth_token}} );
  };

  this.getLocalData = function(path_fichero){
    return $http.get(path_fichero);
  };
});
// ====================================================================================================================
wcaModule.service('SMapa', function(SFusionTable, SPopup){

  var placesService, request, mapa;

  if (typeof google === 'undefined'){
    window.location = 'index.html';
    return;
  }

  this.OVIEDO = {lat: 43.4667, lng: -5.8333}; // centro de mapa vista global
  this.RADIO_BUSQUEDA = 500; // radio de búsqueda de panorama StreetView a partir de coordenadas de cam (metros)

  this.hallaLatLng = function (domElement, lugar, concejo, fn){
    request = {
      query: "'"+lugar+", "+concejo+", Asturias, España'",
      lenguage: 'es'
    };
    placesService = new google.maps.places.PlacesService(domElement);
    placesService.textSearch(request, callback);
    function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        //console.log('Debugging resultados de busqueda street view results[0]', results[0]);
        fn(results[0].geometry.location);
      } else {
        SPopup.show('Error', 'No se han podido hallar coordenadas para panorama StreetView');
        console.error('SMapa.hallaLatLng(): no se han podido hallar coordenadas');
      }
    }
  };

  this.creaStreetView = function(domElement, locationLatLng){
    return new google.maps.StreetViewPanorama( domElement, {
      pov: {heading: 0, pitch: 0},
      position: locationLatLng,
      zoom: 1
    });
  };

  this.creaStreetView2 = function(domElement, locationLatLng, heading){
    return new google.maps.StreetViewPanorama( domElement, {
      pov: {heading: heading || 0, pitch: 0},
      position: locationLatLng,
      zoom: 1
    });
  };

  this.crear = function (domElement){
    mapa = new google.maps.Map(domElement,  {
      mapTypeControl: true,
      mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
      mapTypeId: google.maps.MapTypeId.HYBRID
    });
    return mapa;
  };

  this.creaFusionTableLayer = function(filtroMarkers){
    var query = { select: 'col7', from: SFusionTable.TABLE_ID, where: filtroMarkers };
    var options = { styleId: 6, templateId: 8 };
    var layer = new google.maps.FusionTablesLayer({
      heatmap: { enabled: false },
      query: query,
      options: options
    });
    return layer;
  };

  this.creaMarker = function(posicionLatLng, mapa, titulo){
    var marker = new google.maps.Marker({
      position: posicionLatLng,
      map: mapa,
      title: titulo,
      icon: 'img/red-marker.png'
      //icon: 'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0'
      //animation: google.maps.Animation.DROP
    });
  };

  this.onMapLoaded = function(mapa, loader){
    google.maps.event.addListenerOnce(mapa, 'idle', function(){
      loader.hide();
    });
  };
});
// ====================================================================================================================
wcaModule.service('SClima', function($http){
  this.urlCorsProxy = 'https://cors-anywhere.herokuapp.com/';
  this.getData = function(lat, lng){
    return $http.get( this.urlCorsProxy + 'http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+
      '&appid=b7514b5aaf43d023c350462fd57a1791&lang=es&units=metric', {cache:true} );
  };
});
// ====================================================================================================================
wcaModule.service('SPopup', function($ionicPopup, SLoader){
  this.show = function(titulo, msg) {
    SLoader.hide();
    $ionicPopup.alert({ title: titulo, template: msg });
  };
});
// ====================================================================================================================
wcaModule.service('SWikipedia', function($http){

  this.info = function(termino){
    return $http.jsonp('https://es.wikipedia.org/w/api.php?'+
      'action=query&prop=extracts|info&exintro&titles='+termino+
      '&format=json&explaintext&redirects&inprop=url&indexpageids&callback=JSON_CALLBACK', {cache: true});
  };

  this.infoRelacionada = function(termino){
    return $http.get('https://es.wikipedia.org/w/api.php?'+
      'action=query&list=search&srsearch='+termino+'&utf8=&format=json', {cache: true});
  };

  /** Respuesta en formato xml */
  this.infoLatLngGeonames = function(lat, lng){
    return $http.get('http://api.geonames.org/findNearbyWikipedia?'+
      'lat='+lat+'&lng='+lng+'&username=yagolopez&lang=es', {cache: true});
  };

  this.infoLatLngWikipedia = function(lat, lng, radioBusqueda){
    var url = 'https://es.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius='+radioBusqueda+
      '&gscoord='+lat+'|'+lng+'&format=json&callback=JSON_CALLBACK';
    return $http.jsonp(url, {cache: true});
  };

  this.infoAmpliada = function (termino){
    return $http.get('https://es.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&titles='+termino+
      '&rvprop=content&rvsection=0&rvparse');
  };

  /** Bueno para lugares concretos con descripción breve */
  this.openSearch = function(termino){
    return $http.jsonp('https://es.wikipedia.org/w/api.php?action=opensearch&'+
      'search='+termino+'&callback=JSON_CALLBACK', {cache: true});
  };
});
// ====================================================================================================================
wcaModule.service('ItemsMeteo', function($filter){

  var meteoData = null;

  this.FUSION_TABLE_ID = '1Y_vt2nTVFSYHpMuwe0u60bQzp4FlLtc33A8qd2_x';

  this.getData = function(){
    return meteoData;
  };

  this.setData = function(data){
    meteoData = data;
  };

  this.getItemsByCategoriaId = function(idCategoria) {
    return $filter('filter')(meteoData, function (item) {
      return (item[7] == idCategoria);
    }, true);
  };

  this.getItemById = function(idItem) {
    return $filter('filter')(meteoData, function (item) {
      return (item[0] == idItem);
    }, true);
  };
});
// ====================================================================================================================
wcaModule.factory('ItemMeteo', function(){

  var urlProxy = 'https://script.google.com/macros/s/AKfycbyX6ViYZ2IuHEurQXJ--t_UOqRTyQZ9yGeSeLcbiM7ZSVcTujTw/exec?url=';
  //var urlProxy = 'https://cors-anywhere.herokuapp.com/';
  //var urlProxy = 'http://www.whateverorigin.org/get?url='
  //var urlProxy = 'http://anyorigin.com/get?url=';
  //var urlProxy = 'http://dontfilter.us/browse.php?&f=norefer&u=';
  //var urlProxy = 'http://proxy2974.my-addr.org/myaddrproxy.php/';

  function ItemMeteo(arr){
    if(arr){
      this.id = arr[0][0];
      this.descripcion = arr[0][1];
      this.categoria = arr[0][2];
      this.nombre = arr[0][3];
      this.espectro = arr[0][4];
      this.fuente = arr[0][5];
      this.urlNoProxy = arr[0][6];
      this.url = urlProxy + (arr[0][6])+ '&callback=jsonpCallback';
      this.idCategoria= arr[0][7];
      this.tipoImagen= arr[0][8];
      this.urlFuente = arr[0][9];
    }
  }
  return ItemMeteo;
});
// ====================================================================================================================
wcaModule.service('SLoader', function($ionicLoading){

  var spinnerIco = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>";
  var contenidoLoader = "Cargando datos...";

  this.show = function(texto){
    if(texto){
      contenidoLoader = texto;
    }
    $ionicLoading.show({template: contenidoLoader, noBackdrop: true, hideOnStateChange: true, duration: 60*1000 });
  };

  this.showWithBackdrop = function(texto){
    if(texto){
      contenidoLoader = texto;
    }
    $ionicLoading.show({template: contenidoLoader, noBackdrop: false, hideOnStateChange: true, duration: 60*1000});
  };

  this.hide = function(){
    $ionicLoading.hide();
  };
});
// ====================================================================================================================
wcaModule.factory('$exceptionHandler', function($injector) {
  return function(exception, cause) {
    var SPopup = $injector.get('SPopup');
    console.error(exception);
    SPopup.show('Error', 'Detalles: '+exception.message);
  };
});
// ====================================================================================================================
wcaModule.factory('Cam', function(SCategorias){
  function Cam(arrayDatosCam){
    if(arrayDatosCam) {
      this.lugar = arrayDatosCam[0][0];
      this.concejo = arrayDatosCam[0][1];
      this.imagen = arrayDatosCam[0][2];
      this.categoria = SCategorias.url_a_nombre( arrayDatosCam[0][3] );
      this.id = arrayDatosCam[0][4];
      this.lat = arrayDatosCam[0][5];
      this.lng = arrayDatosCam[0][6];
    }//if
  }
  return Cam;
});
// ====================================================================================================================
wcaModule.service('SCategorias', function(){
  var nombreCategoria;
  var urlBaseCategoria = 'http://webcamsdeasturias.com/interior.php?categoria=';

  // this.url_a_nombre = function(urlCategoria){
  //   if (urlCategoria === urlBaseCategoria+'1'){
  //     nombreCategoria = 'Poblaciones';
  //   }
  //   if (urlCategoria === urlBaseCategoria+'2')
  //     nombreCategoria = 'Puertos';
  //   if (urlCategoria === urlBaseCategoria+'3')
  //     nombreCategoria = 'Montaña';
  //   if (urlCategoria === urlBaseCategoria+'5')
  //     nombreCategoria = 'Ríos';
  //   if (urlCategoria === urlBaseCategoria+'7')
  //     nombreCategoria = 'Playas';
  // return nombreCategoria;
  // };

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
  };
});
// ====================================================================================================================
wcaModule.constant('STRINGS', {
  ERROR: 'Error. No se han podido obtener datos remotos. Posibles causas: ' +
    '(1) Sin conexión de datos. (2) Fallo de servidor remoto',
  RECARGANDO_IMG: 'Recargando imagen...'
});

