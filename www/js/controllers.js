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
    var sql_query_string = 'SELECT Lugar,Concejo,Imagen,Categoria,rowid FROM '+ DATOS_URL.FUSION_TABLE_ID;
    factoria_datos.getRemoteData(sql_query_string).success(function(data){

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

      // $rootScope.listacams contiene las cams sin filtrar
      // $rootScope.items contiene las cams filtradas por parametros de url
      $rootScope.listacams = data;
      if (camsFiltradasPorUrl.length == 0)
        camsFiltradasPorUrl = data.rows;
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
          //,
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

      $ionicLoading.hide();

    }).error(function(data, status) {
      $ionicLoading.hide();
      console.log('Error obteniendo datos remotos: ', status);
    });

    /* DIALOGO MODAL *************************************************************************************************/
    $ionicModal.fromTemplateUrl('templates/detalle6.html', {
      scope: $scope,
      animation: 'scale-in'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    //TODO: a lo mejor se puede usar solo itemIndex para filtrar la camara y no usar rowid
    $scope.showModal= function (rowid, itemIndex){
      // indice en el array de items filtrados: items[indice]
      $rootScope.itemIndex = itemIndex;
      $scope.rowid = rowid;



      console.log('slidebox delegate', $ionicSlideBoxDelegate._instances[0]);
      //$rootScope.swiper.activeIndex = itemIndex;
      //$ionicSlideBoxDelegate.slide(itemIndex);
      // setTimeout es necesario por un bug en $ionicSlideBoxDelegate.slide()
      //setTimeout(function() {
      //  $ionicSlideBoxDelegate.slide(itemIndex);
      //  $ionicSlideBoxDelegate.update();
      //  $scope.$apply();
      //});
      //$ionicSlideBoxDelegate.slide(itemIndex, 3000);

/*
      var intervalId = $interval( function() {
        if( slideCounter < maxSlides) {

          slideCounter++;
          console.log('Adding a slide');
          $scope.data.slides.push( {
            title : "Slide " + slideCounter,
            data : "Slide " + slideCounter + ' Content'
          });

          $ionicSlideBoxDelegate.update();
        } else {
          console.log('All full!');
          $interval.cancel(intervalId);
        }
      }, 3000);
*/





      //$ionicScrollDelegate.scrollTop(false);
      $scope.modal.show();
      $ionicSlideBoxDelegate.slide(itemIndex);

      $ionicSlideBoxDelegate.update();

    }
    // Triggered in the login modal to close it
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    /* FIN DIALOGO MODAL *********************************************************************************************/

    $scope.nextSlide = function() {
      $ionicSlideBoxDelegate.next();
    }
    //TODO: arreglar que se muestre y se oculte bien el loader
    // despues de cargar la pagina con los datos remotos ocultar el loader
    //$scope.$on('$ionicView.afterEnter', function (viewInfo, state) {
      //$ionicLoading.hide();
      //console.log('$ionicView.afterEnter', viewInfo, state);
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




/*
.controller('SearchCtrl', function($scope){

    //console.log('searchctrl');

    $scope.swiper = {};

    $scope.options = {
      loop: false
    };

    $scope.next = function() {
      $scope.swiper.slideNext();
    };
    $scope.prev = function() {
      $scope.swiper.slidePrev();
    };

    $scope.generateSlides = function(number) {
      return new Array(number);
    };

    $scope.activeThree = [1, 2];

    $scope.updateActiveThree = function(activeSlide) {
      // Simple test. The example in jij project is better. Because it factors in total amount of items and if active item is 0 the previous item is not -1, but lastitem index
      $scope.activeThree = [
        activeSlide - 1,
        activeSlide,
        activeSlide + 1
      ];
    };


    $scope.onReadySwiper = function(swiper) {
      $scope.swiper = swiper;
      $scope.swiper.activeIndex = 1;
      //swiper.slideTo(5);
      //console.log('index despues', swiper.activeIndex);

      swiper.on('onSlideChangeStart', function() {
        $scope.updateActiveThree($scope.swiper.activeIndex);


      });
    };

  }) // fin SearchCtrl controller
*/


  .controller('SearchCtrl', function($rootScope){

    $rootScope.swiper = {};

    $rootScope.options = {
      loop: false
    };

    $rootScope.next = function() {
      $rootScope.swiper.slideNext();
    };
    $rootScope.prev = function() {
      $rootScope.swiper.slidePrev();
    };

    $rootScope.generateSlides = function(number) {
      return new Array(number);
    };

    $rootScope.activeThree = [1, 2];

    $rootScope.updateActiveThree = function(activeSlide) {
      // Simple test. The example in jij project is better. Because it factors in total amount of items and if active item is 0 the previous item is not -1, but lastitem index
      $rootScope.activeThree = [
        activeSlide - 1,
        activeSlide,
        activeSlide + 1
      ];
    };


    $rootScope.onReadySwiper = function(swiper) {
      $rootScope.swiper = swiper;
      $rootScope.swiper.activeIndex = 1;
      //swiper.slideTo(5);
      //console.log('index despues', swiper.activeIndex);

      $rootScope.swiper.on('onSlideChangeStart', function() {
        $rootScope.updateActiveThree($rootScope.swiper.activeIndex);


      });
    };

  }) // fin SearchCtrl controller



/*
.controller('SwiperCtrl3', function($scope) {
  $scope.swiper = {};

  $scope.options = {
    //'loop': 0,
    //'preloadImages':0,
    //'lazyLoading': 0
  };

  $scope.next = function () {
    $scope.swiper.slideNext();
  }
  $scope.prev = function(){
    $scope.swiper.slidePrev();
  }
  $scope.gotoSlide = function (slide_index){
    $scope.swiper.activeIndex = slide_index;
  }
  $scope.onReadySwiper = function (swiper) {
    $scope.swiper = swiper;
    console.log('indice antes', $scope.swiper.activeIndex);
    $scope.gotoSlide(1);;
    console.log('indice despues', $scope.swiper.activeIndex);
    swiper.on('slideChangeStart', function () {
      console.log('indice de slide cambiado', $scope.swiper.activeIndex);
    });
  };






}) // fin swiperctrl3
*/


.controller('SwiperCtrl', function($rootScope) {
/*    $rootScope.swiper = {};

    $rootScope.options = {
      //'loop': 0,
      //'preloadImages':0,
      //'lazyLoading': 0
    };

    $rootScope.next = function () {
      $rootScope.swiper.slideNext();
    }
    $rootScope.prev = function(){
      $rootScope.swiper.slidePrev();
    }
    $rootScope.gotoSlide = function (slide_index){
      $rootScope.swiper.activeIndex = slide_index;
    }
    $rootScope.onReadySwiper = function (swiper) {
      $rootScope.swiper = swiper;
      $rootScope.swiper.params.preloadImages = false;
      $rootScope.swiper.params.lazyLoading = true;
      console.log('swiper', $rootScope.swiper);

      swiper.on('slideChangeStart', function () {
        //console.log('indice de slide cambiado', $rootScope.swiper.activeIndex);
      });
    };*/






  }) // fin swiperctrl3

; // FIN
