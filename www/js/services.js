angular.module('wca.services',[])

  //TODO: borrar, no se usa
  .factory('ParamsUrl', function () {

    var data = { lugar: '', concejo: '', idCategoria: '' };

    var getLugar=  function () {
      return data.lugar;
    };
    var setLugar= function (lugar) {
      data.lugar= lugar;
    };
    var getConcejo=  function () {
      return data.concejo;
    };
    var setConcejo= function (concejo) {
      data.concejo= concejo;
    };
    var getIdCategoria=  function () {
      return data.idCategoria;
    };
    var setIdCategoria= function (idCategoria) {
      data.idCategoria= idCategoria;
    };

    return {
      getLugar: getLugar,
      setLugar: setLugar,
      getConcejo: getConcejo,
      setConcejo: setConcejo,
      getIdCategoria: getIdCategoria,
      setIdCategoria: setIdCategoria
    };
  }) // ParamsUrl

  .factory('Datasource', function($http, DATOS_URL){

    var getRemoteData = function( sql_query_string ) {
      var url = DATOS_URL.API_ENDPOINT+ '?sql=' +sql_query_string+ '&key=' +DATOS_URL.API_KEY;
      console.log("url", encodeURI(url));
      return $http.get( encodeURI(url), {cache: true} );
    };

    var getLocalData = function(path_fichero){
      return $http.get(path_fichero);
    };
    return {
      getRemoteData: getRemoteData,
      getLocalData: getLocalData
    }
  }) // Datasource

  .factory('GMapsService', function(DATOS_URL){

    // punto de referencia para geocoder y centro de mapa por defecto
    var OVIEDO = {lat: 43.3667, lng: -5.8333};
    // radio de búsqueda de imagenes de street view en metros a partir una ubicacion
    var RADIO = 500;

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
          console.log('hallaLatLng(): no se han podido hallar coordenadas');
        }
      }
    }// hallaLatLng

    var creaStreetView = function(domElement, locationLatLng){
      return new google.maps.StreetViewPanorama( domElement, {
        pov: {heading: 0, pitch: 0},
        position: locationLatLng,
        zoom: 1
      });
    }

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
          from: DATOS_URL.FUSION_TABLE_ID,
          where: ''
        },
        options: {
          styleId: 6,
          templateId: 8
        }
      });
      return mapa;
    } // creaMapa()

    return {
      OVIEDO: OVIEDO,
      RADIO: RADIO,
      creaMapa: creaMapa,
      hallaLatLng: hallaLatLng,
      creaStreetView: creaStreetView
    }
  }) // GMapsService

  .constant('DATOS_URL', {
    API_ENDPOINT: 'https://www.googleapis.com/fusiontables/v2/query',
    FUSION_TABLE_ID: '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF',
    API_KEY: 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps'
  })

  /*
   .service('Panoramio', function(){

   var getPanoramio = function(domElement){
   var cadenaBusqueda = {
   'tag': 'Oviedo'
   //,
   //'rect': {'sw': {'lat': -30, 'lng': 10.5}, 'ne': {'lat': 50.5, 'lng': 30}}
   };
   var opciones_panoramio = {'width': 400, 'height': 400};
   //var widget_panoramio = new panoramio.PhotoWidget('divPanoramio', cadenaBusqueda, opciones_panoramio);
   var widget_panoramio = new panoramio.PhotoWidget(domElement, cadenaBusqueda, opciones_panoramio);

   widget_panoramio.setPosition(0);
   console.log('widget_panoramio', widget_panoramio);

   }
   return {
   getPanoramio: getPanoramio
   }

   }) // Panoramio
   */

; // FIN
