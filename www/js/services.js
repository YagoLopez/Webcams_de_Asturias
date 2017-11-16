// Url completa para consultar fusion table. Usar como plantilla
// https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps
var wcaModule = angular.module('wca.services',[]);
// ====================================================================================================================
//todo: añadir getCamsById, getCamsByConcejoCategoria
wcaModule.service('Cams', function ($http, $filter, STRINGS){

  this.TABLE_ID = '1gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF';
  this.all = [];

  this.getAll = function () {
    var self = this;
    var sqlQuery = 'SELECT Lugar, Concejo, Imagen ,Categoria, rowid, latitud, longitud FROM '+ this.TABLE_ID;
    var url = STRINGS.FUSION_TABLES_ENDPOINT+ '?sql=' +(sqlQuery)+ '&key=' + STRINGS.FUSION_TABLES_API_KEY +
      '&callback=JSON_CALLBACK';
    return $http.jsonp( encodeURI(url), {cache: true} )
      .success(function (response) {
        self.all = response.rows;
      })
      .error(function (error) {
        throw(error);
      })
  }

  this.getLocalData = function(path_fichero){
    var self = this;
    return $http.get( path_fichero, {cache: true} )
      .success(function (response) {
        self.all = response.rows;
      })
      .error(function (error) {
        throw(error);
      })
  }

  function esSubcadena(idCategoria, urlCategoria) {
    return (urlCategoria.indexOf('categoria=' + idCategoria) > -1);
  }

  this.filtrarPor = function(concejo, idCategoria){
    var self = this;
    var camsFiltradas;
    return $filter('filter')(this.all, function(cam) {
      if (concejo && idCategoria) {
        // cam[1]: concejo, cam[3]: url categoria (no id de categoria, no confundir)
        camsFiltradas = (cam[1].toLowerCase() == concejo.toLowerCase() && esSubcadena(idCategoria, cam[3]));
      } else {
        if (concejo){
          camsFiltradas = cam[1].toLowerCase() == concejo.toLowerCase();
        }
        if (idCategoria){
          camsFiltradas = esSubcadena(idCategoria, cam[3]);
        }
        if (!concejo && !idCategoria){
          camsFiltradas = self.all;
        }
      }
      return camsFiltradas;
    })
  }

  this.getCamByRowid = function (rowid) {
    return $filter('filter')(this.all, function(cam) {
      return cam[4] === rowid;
    })
  }

  this.buscarCams = function (searchString) {
    return $filter('filter')(this.all, function(cam) {
      var matchCondition1 = cam[0].toLowerCase().indexOf(searchString.toLowerCase()) > -1;
      var matchCondition2 = cam[1].toLowerCase().indexOf(searchString.toLowerCase()) > -1;
      if(matchCondition1 || matchCondition2){
        return cam;
      }
    })
  }
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
        // Popup.show('Error', 'No se han podido hallar coordenadas para panorama StreetView');
        // console.error('Mapa.hallaLatLng(): no se han podido hallar coordenadas');
        throw('No se han podido hallar coordenadas para panorama StreetView');
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
    var layer = new google.maps.FusionTablesLayer({
      heatmap: { enabled: false },
      query  : { select: 'col7', from: Cams.TABLE_ID, where: filtroMarkers },
      options: { styleId: 6, templateId: 8 }
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
  };
});
// ====================================================================================================================
wcaModule.service('Wikipedia', function($http){

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
})
// ====================================================================================================================
wcaModule.service('ItemsMeteo', function($http, $filter, STRINGS){

  var meteoData = null;

  this.FUSION_TABLE_ID = '1Y_vt2nTVFSYHpMuwe0u60bQzp4FlLtc33A8qd2_x';

  this.getData = function(){
    return meteoData;
  }

  this.setData = function(data){
    meteoData = data;
  }

  this.getRemoteData = function( sqlQueryString ) {
    var url = STRINGS.FUSION_TABLES_ENDPOINT+ '?sql=' +(sqlQueryString)+ '&key=' + STRINGS.FUSION_TABLES_API_KEY +
      '&callback=JSON_CALLBACK';
    // console.log(sqlQueryString);
    return $http.jsonp( encodeURI(url), {cache: true} );
  }


  this.getItemsByCategoriaId = function(idCategoria) {
    return $filter('filter')(meteoData, function (item) {
      return (item[7] == idCategoria);
    }, true);
  }

  this.getItemById = function(idItem) {
    return $filter('filter')(meteoData, function (item) {
      return (item[0] == idItem);
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
    if(arr){
      this.id = arr[0][0];
      this.info = arr[0][1];
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
wcaModule.service('Loader', function($ionicLoading){

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
    var Popup = $injector.get('Popup');
    console.error(exception);
    Popup.show('Error', 'Data: '+exception.data+'<br>Status: '+exception.status+'<br>Text: '+exception.statusText +
      '<br>Message: '+exception.message);
  };
});
// ====================================================================================================================
wcaModule.factory('Cam', function(Categorias){
  function Cam(arrayDatosCam){
    if(arrayDatosCam) {
      this.lugar = arrayDatosCam[0][0];
      this.concejo = arrayDatosCam[0][1];
      this.imagen = arrayDatosCam[0][2];
      this.categoria = Categorias.url_a_nombre( arrayDatosCam[0][3] );
      this.id = arrayDatosCam[0][4];
      this.lat = arrayDatosCam[0][5];
      this.lng = arrayDatosCam[0][6];
    }
  }
  return Cam;
});
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
  };
});
// ====================================================================================================================
wcaModule.constant('STRINGS', {
  FUSION_TABLES_API_KEY: 'AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps',
  FUSION_TABLES_ENDPOINT: 'https://www.googleapis.com/fusiontables/v2/query',
  ERROR: 'No se han podido obtener datos remotos. Posibles causas: ' +
    '(1) Sin conexión de datos. (2) Fallo de servidor remoto',
  RECARGANDO_IMG: 'Recargando imagen...'
});
