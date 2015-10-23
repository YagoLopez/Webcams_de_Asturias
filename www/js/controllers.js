angular.module('webcams_asturias.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
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

/*
.controller('ListacamsCtrl', function($rootScope, $scope, factoria_datos, $ionicLoading, DATOS_URL) {

  // despues de cargar la pagina con los datos remotos ocultar el loader
  $scope.$on('$ionicView.afterEnter', function (viewInfo, state) {
    $ionicLoading.hide();
    //console.log('$ionicView.afterEnter', viewInfo, state);
  });
}) // fin ListacamsCtrl
*/

.controller('TabsCtrl', function($scope, $stateParams, $ionicLoading, $rootScope){

    // despues de cargar la pagina con los datos remotos ocultar el loader
    $scope.$on('$ionicView.afterEnter', function (viewInfo, state) {
      $ionicLoading.hide();
      //console.log('$ionicView.afterEnter', viewInfo, state);

    });

    //$scope.$on('$ionicView.enter', function() {
    //})

    $rootScope.concejo = $stateParams.concejo;
    /* TODO: hacer una tabla propia para las categorias en fusion tables y hacer join de
    la tabla de webcams y la de categorias */
    $rootScope.categoria = $stateParams.categoria;
    console.log('stateParams en tabs ctrl', $stateParams);

    $scope.fltrConcejo = function(cam) {
      //TODO: quitar acentos para hacer mejor la búsqueda por concejo
      if ( !$stateParams.concejo )
        return cam;
      else
        return cam[1].toLowerCase() == $stateParams.concejo.toLowerCase();
    }

    $scope.fltrCategoria = function(cam) {
      if ( !$stateParams.categoria )
        return cam;
      else {
        //if(cam[3] == 'categoria=' + $stateParams.categoria)
        //console.log('cam[3]', cam[3]);
        return cam[3] == 'categoria=' + $stateParams.categoria;
      }
    }

  })// fin TabsCtrl

.controller('ListadoCtrl', function($scope, $state, $filter){

    //$scope.$on('$ionicView.enter', function() {
    //  console.log('state.params en listado ctrl', $state.params);
    //})


}) // fin ListadoCtrl

.controller('MosaicoCtrl', function($scope, $state, $rootScope){

    //$scope.$on('$ionicView.enter', function() {
    //  console.log('state.params en mosaico ctrl', $state.params);
    //})

    //$rootScope.categoria = $state.params.categoria;
    //$rootScope.concejo = $state.params.concejo;
  //  $scope.$parent.concejo = $state.params.concejo;
  //  $scope.$parent.categoria = $state.params.categoria;
  //console.log('categoria en mosaico ctrl', $scope.categoria);
  //console.log('concejo en mosaico ctrl', $scope.concejo);
  //console.log('state en mosaico ctrl', $state);

    $scope.images = [];
    for (var i = 0; i < 100; i++) {
      $scope.images.push({id: i, src: "http://placehold.it/50x50"});
    }

}) // fin MosaicoCtrl

.controller('PlayasCtrl', function($rootScope, factoria_datos){

  }
) // fin coltroller PlayasCtrl

.controller('PuertosCtrl', function($rootScope, factoria_datos){

  }
) // fin coltroller PuertosCtrl

.controller('RiosCtrl', function($rootScope, factoria_datos){

  }
) // fin coltroller RiosCtrl

.controller('MontanaCtrl', function($rootScope, factoria_datos){

  }
) // fin coltroller MontanaCtrl

;
