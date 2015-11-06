angular.module('webcams_asturias.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

/*
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/detalle.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

*/

  })

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope) {
  })

//TODO: no se necesita este controlador
.controller('DetallecamCtrl', function($scope, $stateParams, $ionicLoading, DATOS_URL, $filter, $rootScope) {

    //TODO: unficar la plantilla loading en una constante
    // mostrar loader
    $ionicLoading.show({template:'Cargando datos...', noBackdrop:true});

    // guarda en scope rowid que es el id de la camara
    $scope.rowid = $stateParams.rowid;

    // ocultar loader despues de cargar la vista
    $scope.$on('$ionicView.afterEnter', function (viewInfo, state) {
      $ionicLoading.hide();
      //console.log('$ionicView.afterEnter', viewInfo, state);
    });

    //$scope.detallecam = $filter('filter')($rootScope.listacams.rows, $scope.rowid, true);
    //console.log('rowid', $scope.rowid);
    //console.log('detalle cam', $scope.detallecam);

}) //fin DetallecamCtrl

.controller('TabsCtrl', function($scope, $stateParams, $ionicLoading, $rootScope, $ionicFilterBar,
                                 factoria_datos, DATOS_URL, $filter, $ionicScrollDelegate, $ionicModal,
                                 $ionicSlideBoxDelegate){

    // mostrar loader
    var icono_spinner = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>";
    var template_loader = "Cargando datos...";
    $ionicLoading.show({template:template_loader, noBackdrop:true});

    $rootScope.animarListItems = true;
    // elimina search bar si la hubiera al mostrar la vista
    if ($rootScope.filterBarInstance)
      $rootScope.filterBarInstance();


    /*
    TODO: hacer una tabla propia para las categorias en fusion tables y hacer join de
    la tabla de webcams y la de categorias
    TODO: Hacer tabla para concejos
    */

    // obtiene parametros de url
    $rootScope.concejo = $stateParams.concejo;
    $rootScope.categoria = $stateParams.categoria;

    //TODO: cachear las imagenes
    var sql_query = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid FROM '+ DATOS_URL.FUSION_TABLE_ID;
    factoria_datos.getRemoteData(sql_query).success(function(data){

      function estaEnCategoria(categoria, idCategoria) {
        return (categoria.indexOf('categoria='+idCategoria) > -1);
      }

      // FILTRO 1: filtra las cams por los parametros de la url: concejo y categoria ////////////////////////////////
      var camsFiltradasPorUrl = $filter('filter')(data.rows, function(cam){
        var concejoCam = cam[1];
        var categoriaCam = cam[3];
        var idCategoriaCam = $rootScope.categoria;
        //TODO: intentar asignar cadena vacia cuando los parametros son nulos para simplificar el codigo
        if ($rootScope.concejo && $rootScope.categoria)
          return ((concejoCam.toLowerCase()== $rootScope.concejo.toLowerCase()) && (estaEnCategoria(categoriaCam, idCategoriaCam)));
        else {
          if ($rootScope.concejo)
            return (concejoCam.toLowerCase() == $rootScope.concejo.toLowerCase());
          if ($rootScope.categoria)
            return (estaEnCategoria(categoriaCam, idCategoriaCam));
        }
      });

      // listacams contiene las cams sin filtrar
      $rootScope.listacams = data;
      if (camsFiltradasPorUrl.length == 0)
        camsFiltradasPorUrl = data.rows;
      // items contiene las cams inicialmente filtradas por parametros de url
      $scope.items = camsFiltradasPorUrl;

      // FILTRO 2: filtra las cams segun una cadena de texto que haya introducido el usuario ///////////////////////
      // este filtro se aplica sobre los datos previamente filtrados por url
      //TODO: desactivar la animacion del listado al mostrar search bar y volver a activarla al cerrarla
      //TODO: Habría que mejorar la búsqueda para que fuera menos estricta. Por ejemplo, si se introduce "puerto llanes" no se
      //encuentra "Puerto de Llanes"
      $rootScope.showFilterBar = function () {
        $rootScope.animarListItems = false;
        $rootScope.filterBarInstance = $ionicFilterBar.show({
          items: $scope.items,
          update: function (filteredItems, filteredText) {
            $scope.items = filteredItems;
            $ionicScrollDelegate.scrollTop(false);
          },
          cancelText: 'Cancelar',
          cancelOnStateChange: false
        });
      };

      $ionicLoading.hide();


      // DIALOGO MODAL ----------------------------------------------------------------------------------------------
      $ionicModal.fromTemplateUrl('templates/detalle.html', {
        scope: $scope,
        animation: 'scale-in'
      }).then(function(modal) {
        $scope.modal = modal;
      });

      //TODO: a lo mejor se puede usar solo itemIndex para filtrar la camara y no usar rowid
      $scope.showModal= function (itemIndex){
        // indice en el array de items filtrados: itemIndex = items[indice]
        $rootScope.itemIndex = itemIndex;
        $ionicSlideBoxDelegate.slide(itemIndex);
        //$ionicScrollDelegate.scrollTop(false);
        //$ionicSlideBoxDelegate.update();
        $scope.modal.show();
      }

    // FIN DIALOGO MODAL ----------------------------------------------------------------------------------------------

    }).error(function(data, status) {
      $ionicLoading.hide();
      console.log('Error obteniendo datos remotos: ', status);
    });


    // Triggered in the login modal to close it
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    $scope.nextSlide = function() {
      $ionicSlideBoxDelegate.next();
    }
    $scope.prevSlide = function() {
      $ionicSlideBoxDelegate.previous();
    }

    //TODO: arreglar que se muestre y se oculte bien el loader
    // despues de cargar la pagina con los datos remotos ocultar el loader
    //$scope.$on('$ionicView.afterEnter', function (viewInfo, state) {
      //$ionicLoading.hide();
      //console.log('$ionicView.afterEnter', viewInfo, state);
    //});


  })// fin TabsCtrl

.controller('ListadoCtrl', function($scope, $rootScope,
                                    $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate){

  }) // fin ListadoCtrl

.controller('MosaicoCtrl', function($scope, $state, $rootScope){
}) // fin MosaicoCtrl

.controller('MapaGlobalCtrl', function($scope){

}) // fin MapaGlobalCtrl

.controller('MapaLocallCtrl', function($scope){

}) // fin MapaLocalCtrl

.controller('RepeatCtrl', function ($scope){
    $scope.items = 'abcdefghijklmnopqrstuvwxyz'.split("");
  })





.controller('SearchCtrl', function($scope, $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate){
    console.log('search ctrl');
  $scope.miarray=[1,2,3,4,5,6,7,8,9];

 }) // fin SearchCtrl controller


; // FIN
