// url completa para consultar fusion table. Usar como plantilla
//var url_api = "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps";

angular.module('wca.services',[])

// ====================================================================================================================
  .factory('SFusionTable', function($http){

    var API_ENDPOINT = 'https://www.googleapis.com/fusiontables/v2/query';
    var API_KEY = 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps';
    var TABLE_ID = '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF';

    var getRemoteData = function( sqlQueryString ) {
      var url = API_ENDPOINT+ '?sql=' +sqlQueryString+ '&key=' +API_KEY+ '&callback=JSON_CALLBACK';
      //console.log('url', url);
      return $http.jsonp( encodeURI(url), {cache: true} );
    };

    var getLocalData = function(path_fichero){
      return $http.get(path_fichero);
    };

    return {
      API_ENDPOINT: API_ENDPOINT,
      API_KEY: API_KEY,
      TABLE_ID: TABLE_ID,
      getRemoteData: getRemoteData,
      getLocalData: getLocalData
    }
  })
// ====================================================================================================================
  .factory('SMapa', function(SFusionTable, SPopup){

    var OVIEDO = {lat: 43.3667, lng: -5.8333}; // centro de mapa vista global
    var RADIO_BUSQUEDA = 500; // radio de búsqueda en metros de panorama StreetView a partir de coordenadas de cam

    var hallaLatLng = function (domElement, lugar, concejo, fn){
      var request = {
        //location: OVIEDO,
        //radius: '1',
        query: "'"+lugar+", "+concejo+", Asturias, España'",
        lenguage: 'es'
      };
      var placesService = new google.maps.places.PlacesService(domElement);

      placesService.textSearch(request, callback);
      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          //console.log('results[0]', results[0]);
          fn(results[0].geometry.location);
        } else {
          SPopup.show('Error', 'No se han podido hallar coordenadas para panorama StreetView');
          console.error('SMapa.hallaLatLng(): no se han podido hallar coordenadas');
        }
      }
    };

    var creaStreetView = function(domElement, locationLatLng){
      return new google.maps.StreetViewPanorama( domElement, {
        pov: {heading: 0, pitch: 0},
        position: locationLatLng,
        zoom: 1
      });
    };

    var crear = function (domElement){
      var mapa = new google.maps.Map(domElement,  {
        mapTypeControl: true,
        mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
        mapTypeId: google.maps.MapTypeId.HYBRID
      });
      return mapa;
    };

    var creaFusionTableLayer = function(filtroMarkers){
      var query = { select: 'col7', from: SFusionTable.TABLE_ID, where: filtroMarkers };
      var options = { styleId: 6, templateId: 8 };
      var layer = new google.maps.FusionTablesLayer({
        heatmap: { enabled: false },
        query: query,
        options: options
      });
      return layer;
    };

    var creaMarker = function(posicionLatLng, mapa, titulo){
      var marker = new google.maps.Marker({
        position: posicionLatLng,
        map: mapa,
        title: titulo,
        icon: 'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0'
        //animation: google.maps.Animation.DROP
      });
    };

    var onMapLoaded = function(mapa, loader){
      google.maps.event.addListenerOnce(mapa, 'idle', function(){
        loader.hide();
      });
    };

    return {
      OVIEDO: OVIEDO,
      RADIO_BUSQUEDA: RADIO_BUSQUEDA,
      hallaLatLng: hallaLatLng,
      creaStreetView: creaStreetView,
      crear: crear,
      creaFusionTableLayer: creaFusionTableLayer,
      creaMarker: creaMarker,
      onMapLoaded: onMapLoaded
    }
  })
// ====================================================================================================================
  .factory('SClima', function($http){

    var getData = function(lat, lng){
      return $http.get(
        'http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+
        '&appid=b7514b5aaf43d023c350462fd57a1791&lang=es&units=metric', {cache:true});
    };
    return {
      getData: getData
    }

  })
// ====================================================================================================================
  .factory('SPopup', function($ionicPopup){
    var show = function(titulo, msg) {
      $ionicPopup.alert({
        title: titulo,
        template: msg
      });
    };
    return { show: show };
  })
// ====================================================================================================================
  .factory('SWikipedia', function($http){

    var info = function(termino){
      return $http.jsonp('https://es.wikipedia.org/w/api.php?'+
        'action=query&prop=extracts|info&exintro&titles='+termino+
        '&format=json&explaintext&redirects&inprop=url&indexpageids&callback=JSON_CALLBACK', {cache: true});
    };

    var infoRelacionada = function(termino){
      return $http.get('https://es.wikipedia.org/w/api.php?'+
        'action=query&list=search&srsearch='+termino+'&utf8=&format=json', {cache: true});
    };

    // respuesta formato xml
    var infoLatLngGeonames = function(lat, lng){
      return $http.get('http://api.geonames.org/findNearbyWikipedia?'+
        'lat='+lat+'&lng='+lng+'&username=yagolopez&lang=es', {cache: true});
    };

    var infoLatLngWikipedia = function(lat, lng, radioBusqueda){
      var url = 'https://es.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius='+radioBusqueda+
        '&gscoord='+lat+'|'+lng+'&format=json&callback=JSON_CALLBACK';
      return $http.jsonp(url, {cache: true});
    };

    var infoAmpliada = function (termino){
      return $http.get('https://es.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&titles='+termino+
        '&rvprop=content&rvsection=0&rvparse');
    };

    // bueno para lugares concretos con descripción breve
    var openSearch = function(termino){
      return $http.jsonp('https://es.wikipedia.org/w/api.php?action=opensearch&'+
        'search='+termino+'&callback=JSON_CALLBACK', {cache: true});
    };

    return {
      info: info,
      infoRelacionada: infoRelacionada,
      infoLatLngGeonames: infoLatLngGeonames,
      infoAmpliada: infoAmpliada,
      infoLatLngWikipedia: infoLatLngWikipedia
    };
  })
// ====================================================================================================================
  .factory('TablaMeteo', function($filter){

    var service = {};
    var meteoData = null;

    service.FUSION_TABLE_ID = '1Y_vt2nTVFSYHpMuwe0u60bQzp4FlLtc33A8qd2_x';

    service.getData = function(){
      return meteoData;
    };

    service.setData = function(data){
      meteoData = data;
    };

    service.getItemsByCategoriaId = function(idCategoria) {
      return $filter('filter')(meteoData, function (item) {
        return (item[7] == idCategoria);
      }, true);
    };

    service.getItemById = function(idItem) {
      return $filter('filter')(meteoData, function (item) {
        return (item[0] == idItem);
      }, true);
    };

    return service;
})
// ====================================================================================================================
  .factory('ItemMeteo', function(){

    var urlProxy = 'https://script.google.com/macros/s/AKfycbyX6ViYZ2IuHEurQXJ--t_UOqRTyQZ9yGeSeLcbiM7ZSVcTujTw/exec?url=';
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
  })
// ====================================================================================================================
  .factory('SLoader', function($ionicLoading){
    var spinnerIco = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>";
    var contenidoLoader = "Cargando datos...";

    var show = function(texto){
      if(texto){
        contenidoLoader = texto;
      }
      $ionicLoading.show({template: contenidoLoader, noBackdrop: true, hideOnStateChange: true });
    };

    var showWithBackdrop = function(texto){
      if(texto){
        contenidoLoader = texto;
      }
      $ionicLoading.show({template: contenidoLoader, noBackdrop: false, hideOnStateChange: true });
    };

    var hide = function(){
      $ionicLoading.hide();
    };

    return {
      show: show,
      showWithBackdrop: showWithBackdrop,
      hide: hide
    }
})
// ====================================================================================================================
  .factory('$exceptionHandler', function($injector) {
    return function(exception, cause) {
      var SPopup = $injector.get('SPopup');
      console.error(exception);
      SPopup.show('Error', 'Detalles: '+exception.message);
    };
})
// ====================================================================================================================
  .factory('Cam', function(SCategorias){
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
  })
// ====================================================================================================================
  .factory('SCategorias', function(){
    var nombreCategoria = null;
    var urlBaseCategoria = 'http://webcamsdeasturias.com/interior.php?categoria=';

    var url_a_nombre = function(urlCategoria){
      if (urlCategoria === urlBaseCategoria+'1')
        nombreCategoria = 'Poblaciones';
      if (urlCategoria === urlBaseCategoria+'2')
        nombreCategoria = 'Puertos';
      if (urlCategoria === urlBaseCategoria+'3')
        nombreCategoria = 'Montaña';
      if (urlCategoria === urlBaseCategoria+'5')
        nombreCategoria = 'Ríos';
      if (urlCategoria === urlBaseCategoria+'7')
        nombreCategoria = 'Playas';
    return nombreCategoria;
    };

    var idCategoria_a_nombre = function(idCategoria){
      return url_a_nombre(urlBaseCategoria+idCategoria);
    };

    return {
      url_a_nombre: url_a_nombre,
      idCategoria_a_nombre: idCategoria_a_nombre
    }
  })
// ====================================================================================================================

; // FIN
