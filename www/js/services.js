angular.module('wca.services',[])

  .factory('SFusionTable', function($http){

    var API_ENDPOINT = 'https://www.googleapis.com/fusiontables/v2/query';
    var API_KEY = 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps';
    var TABLE_ID = '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF';

    var getRemoteData = function( sql_query_string ) {
      var url = API_ENDPOINT+ '?sql=' +sql_query_string+ '&key=' +API_KEY;
      return $http.get( encodeURI(url), {cache: true} );
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
  }) // SFusionTable

  .factory('SGmap', function(SFusionTable, SPopup){

    var OVIEDO = {lat: 43.3667, lng: -5.8333}; // punto de referencia para geocoder y centro de mapa por defecto
    var RADIO_BUSQUEDA = 500; // radio de búsqueda de imagenes de street view en metros a partir una ubicacion

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
          console.error('SGmap.hallaLatLng(): no se han podido hallar coordenadas');
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

    var creaMapa = function (domElement){
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
          where: ''
        },
        options: {
          styleId: 6,
          templateId: 8
        }
      });
      return mapa;
    }; // creaMapa()

    return {
      OVIEDO: OVIEDO,
      RADIO_BUSQUEDA: RADIO_BUSQUEDA,
      creaMapa: creaMapa,
      hallaLatLng: hallaLatLng,
      creaStreetView: creaStreetView
    }
  }) // SGmap

  .factory('SClima', function($http){

    var getData = function(lat, lng){
      return $http.get(
        'http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+
        '&appid=b7514b5aaf43d023c350462fd57a1791&lang=es&units=metric', {cache:true});
    };
    return {
      getData: getData
    }

  }) // SClima service

  .factory('SPopup', function($ionicPopup){
    var show = function(titulo, msg) {
      $ionicPopup.alert({
        title: titulo,
        template: msg
      });
    };
    return { show: show };
  }) // popup


; // FIN
