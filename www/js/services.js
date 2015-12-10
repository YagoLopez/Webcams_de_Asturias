angular.module('wca.services',[])

// ====================================================================================================================
  .factory('SFusionTable', function($http){

    var API_ENDPOINT = 'https://www.googleapis.com/fusiontables/v2/query';
    var API_KEY = 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps';
    var TABLE_ID = '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF';  //TODO: tabla webcams. Cambiar nombre

    var getRemoteData = function( sql_query_string ) {
      var url = API_ENDPOINT+ '?sql=' +sql_query_string+ '&key=' +API_KEY+'&callback=JSON_CALLBACK';
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
    var RADIO_BUSQUEDA = 500; // radio de búsqueda de panorama StreetView en metros a partir latLng

    var hallaLatLng = function (domElement, lugar, concejo, fn){
      var request = {
        //location: OVIEDO,
        //radius: '1',
        query: "'"+lugar+", "+concejo+", Asturias, España'",
        lenguage: 'es'
      };
      var placesService = new google.maps.places.PlacesService(domElement);

      placesService.textSearch(request, callback);
      function callback(results, status ) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          //console.log('results[0]', results[0]);
          fn(results[0].geometry.location);
        } else {
          SPopup.show('Error', 'No se han podido hallar coordenadas->hallaLatLng(): '+status);
          console.error('SMapa.hallaLatLng(): no se han podido hallar coordenadas');
        }
      }
    };// hallaLatLng

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
        mapTypeId: google.maps.MapTypeId.TERRAIN
      });
      _mapa = mapa;
      return mapa;
    }; // crear()

/*
    var creaMapa = function (domElement, filtro){
      var mapa = new google.maps.Map(domElement,  {
        mapTypeControl: true,
        mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
        mapTypeId: google.maps.MapTypeId.TERRAIN
      });
      layer = new google.maps.FusionTablesLayer({
        map: mapa,
        //heatmap: { enabled: false },
        query: {
          select: 'col7',
          from: SFusionTable.TABLE_ID,
          where: filtro
        },
        options: {
          styleId: 6,
          templateId: 8
        }
      });
      return mapa;
    }; // creaMapa()
*/

    var creaFusionTableLayer = function(filtroMarkers){
      var query = { select: 'col7', from: SFusionTable.TABLE_ID, where: filtroMarkers };
      var options = { styleId: 6, templateId: 8 };
      //noinspection UnnecessaryLocalVariableJS
      var layer = new google.maps.FusionTablesLayer({
        //heatmap: { enabled: false },
        query: query,
        options: options
      });
      return layer;
    }; // creaFusionTableLayer()

    return {
      OVIEDO: OVIEDO,
      RADIO_BUSQUEDA: RADIO_BUSQUEDA,
      //creaMapa: creaMapa,
      hallaLatLng: hallaLatLng,
      creaStreetView: creaStreetView,
      crear: crear,
      creaFusionTableLayer: creaFusionTableLayer
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
  };//getItemsByCategoriaId

  service.getItemById = function(idItem) {
    return $filter('filter')(meteoData, function (item) {
      return (item[0] == idItem);
    }, true);
  };//getItemById

  return service;

})
// ====================================================================================================================
  .factory('ItemMeteo', function(){
    function ItemMeteo(arr){
      if(arr){
        this.id = arr[0][0];
        this.descripcion = arr[0][1];
        this.categoria = arr[0][2];
        this.nombre = arr[0][3];
        this.espectro = arr[0][4];
        this.fuente = arr[0][5];
        this.url = arr[0][6];
        this.idCategoria= arr[0][7];
        this.tipoImagen= arr[0][8];
      }
    }
    return ItemMeteo;
  })
// ====================================================================================================================
  .factory('SLoader', function($ionicLoading){
    var spinnerIco = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>";
    var contenidoLoader = "Cargando datos...";
    var show = function(){
      $ionicLoading.show({template: contenidoLoader, noBackdrop:true});
    };
    var hide = function(){
      $ionicLoading.hide();
    };
    return {
      show: show,
      hide: hide
    }
})
// ====================================================================================================================
  .factory('$exceptionHandler', function($injector) {
  return function(exception, cause) {
    var SPopup = $injector.get('SPopup');
    SPopup.show('Error', 'Detalles: '+exception.message);
    console.error(exception);
  };
})
// ====================================================================================================================


; // FIN
