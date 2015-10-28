angular.module('webcams_asturias.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope) {

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


/*
  $scope.showFilterBar = function () {
    filterBarInstance = $ionicFilterBar.show({
      items: $rootScope.listacams.rows,
      update: function (filteredItems) {
        $scope.items = filteredItems;
        console.log('items', filteredItems);
      }
      //filterProperties: 'description'
    });
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








.controller('TabsCtrl', function($scope, $stateParams, $ionicLoading, $rootScope, $ionicFilterBar, factoria_datos, DATOS_URL, $filter){

    // mostrar loader
    var icono_spinner = "<ion-spinner icon='lines' class='spinner-calm'></ion-spinner><br/>";
    var template_loader = "Cargando datos...";
    $ionicLoading.show({template:template_loader, noBackdrop:true});

    /*
    TODO: hacer una tabla propia para las categorias en fusion tables y hacer join de
    la tabla de webcams y la de categorias
    TODO: Hacer tabla para concejos
    */

    // obtiene parametros de url
    $rootScope.concejo = $stateParams.concejo;
    $rootScope.categoria = $stateParams.categoria;
    console.log('stateParams en tabs ctrl', $stateParams);

    var sql_query_string = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid FROM '+ DATOS_URL.FUSION_TABLE_ID;
    factoria_datos.getRemoteData(sql_query_string).success(function(data){


      function estaEnCategoria(categoria, idCategoria) {
        return (categoria.indexOf('categoria='+idCategoria) > -1);
      }

      // filtra las cams por los parametros de la url: concejo y categoria
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
      //console.log('camsFiltradasPorUrl', camsFiltradasPorUrl);

      // listacams contiene las cams sin filtrar
      // items contiene las cams despues de ser filtradas
      $rootScope.listacams = data;
      if (camsFiltradasPorUrl.length == 0)
        camsFiltradasPorUrl = data.rows;
      $scope.items = camsFiltradasPorUrl;
      //console.log('$rootScope.listacams en tabs ctrl', $rootScope.listacams);
      console.log('$scope.items antes de filtrado', $scope.items);

      // filtra las cams segun una cadena de texto que haya introducido el usuario
      // este filtro se aplica sobre los datos previamente filtrados por url
      $rootScope.showFilterBar = function () {
        console.log('show filter bar');
        filterBarInstance = $ionicFilterBar.show({
          items: camsFiltradasPorUrl,
          update: function (filteredItems, filteredText) {
            //console.log('$ionicfilterbar', $ionicFilterBar);
            //console.log('filterbarinstance', filterBarInstance);
            $scope.items = filteredItems;
            //console.log('filteredItems', filteredItems);
            console.log('$scope.items despues de filtrado', $scope.items);
          }//,
          //expression: function (filterText, cam, index, array) {
          //  //return value.propertyName === filterText || value.anotherPropertyName === filterText;
          //},
          //cancel: function(){
          //},
          //done: function(){
          //}
          ////filterProperties: 'description'
        });
      };


    }).error(function(data, status) {
      console.log('Error obteniendo datos remotos: ', status);
    });


    //TODO: arreglar que se muestre y se oculte bien el loader
    // despues de cargar la pagina con los datos remotos ocultar el loader
    $scope.$on('$ionicView.afterEnter', function (viewInfo, state) {
      $ionicLoading.hide();
      //console.log('$ionicView.afterEnter', viewInfo, state);
    });

    //var sql_query_string = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid FROM '+ DATOS_URL.FUSION_TABLE_ID;
    //$scope.resolvedCams = resolvedCams.getRemoteData(sql_query_string).success(function(data) {
    //  $rootScope.resolvedCams2 = data;
    //  console.log('resolvedCams2', $scope.resolvedCams2);
    //})


    //var sql_query_string = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid FROM '+ DATOS_URL.FUSION_TABLE_ID;
    //factoria_datos.getRemoteData(sql_query_string).then(function(data){
    //  $rootScope.resolvedCams = data.data;
    //  console.log('$rootScope.resolvedCams.data', $rootScope.resolvedCams);
    //});
  })// fin TabsCtrl















.controller('ListadoCtrl', function($scope, $state, factoria_datos, $rootScope, DATOS_URL){
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

.controller('RepeatCtrl', function ($scope){
    $scope.items = 'abcdefghijklmnopqrstuvwxyz'.split("");
  })


.controller('ChatsCtrl', function($scope){
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.items = 'abcdefghijklmnopqrstuvwxyz'.split("");

    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
    }];



    $scope.chats = chats;



  })

; // FIN
