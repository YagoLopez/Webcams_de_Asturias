//TODO: cambiar servicios a factorias

// url completa para consultar fusion table. Usar como plantilla
//var url_api = "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201gX5maFbqFyRziZiUYlpOBYhcC1v9lGkKqCXvZREF&key=AIzaSyBsdouSTimjrC2xHmbGgOt8VfbLBWc9Gps";

// url de las categorias codificada con urlencode. Usar como plantilla
//http%3A%2F%2Fwebcamsdeasturias.com%2Finterior.php%3Fcategoria%3D1

angular.module('wca',
  ['ionic', 'wca.controllers', 'wca.services', 'jett.ionic.filter.bar', 'ngMaterial',/*'ionicLazyLoad'*/])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider, $ionicFilterBarConfigProvider) {

    // disable debug info
    $compileProvider.debugInfoEnabled(true);
    // remove back button text completely
    $ionicConfigProvider.backButton.previousTitleText(false).text(' ');
    // native scroll by default
    if (!ionic.Platform.isIOS()) {
      $ionicConfigProvider.scrolling.jsScrolling(false);
    }
    $ionicFilterBarConfigProvider.placeholder('Buscar');

    $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  //TODO: utilizar resolve en la definicion de estado para obtener datos remotos en vez de en metodo run(). Probar a ver
  .state('app.tabs', {
    url: '/tabs?idCategoria&concejo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/tabs.html',
        controller: 'TabsCtrl'
      }
    }//,
    //resolve: {
    //  resolvedCams: function ($q, SFusionTable) {
    //    return SFusionTable;
    //  }
    //}
  })

  .state('app.tabs.listado', {
  url: '/listado',
  views: {
    'tab-listado': {
    templateUrl: 'templates/listado.html'
    //controller:'ListadoCtrl'
    }
  }
  })

  .state('app.tabs.mosaico', {
  url: '/mosaico',
  views: {
  'tab-mosaico': {
    templateUrl: 'templates/mosaico.html'
    //controller: 'MosaicoCtrl'
    }
  }
  })

  .state('app.mapa', {
    url: '/mapa?lugar&concejo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/mapa.html',
        controller: 'MapaCtrl'
      }
    }
  })

  .state('app.mapaglobal', {
    url: '/mapaglobal',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/mapa-global.html',
        controller: 'MapaGlobalCtrl'
      }
    }
  })

  .state('app.streetview', {
    url: '/streetview?lugar&concejo',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/streetview.html',
        controller: 'StreetViewCtrl'
      }
    }
  })

  .state('app.panoramio', {
    url: '/panoramio?lugar&concejo',
    views: {
      'menuContent': {
        templateUrl: 'templates/panoramio.html',
        controller: 'PanoramioCtrl'
      }
    }
  })

  .state('app.detalle', {
    url: '/detalle/:rowid',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/detalle.html',
        controller:'DetalleCtrl'
      }
    }
  })

; // fin de estados

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/tabs/listado');
})

.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
  }
  return fallbackSrc;
})



  .directive('fabMenu', function($timeout, $ionicGesture) {

    var options = {
        baseAngle: 270,
        rotationAngle: 30,
        distance: 112,
        animateInOut: 'all', // can be slide, rotate, all
      },
      buttons = [],
      buttonContainers = [],
      buttonsContainer = null,
      lastDragTime = 0,
      currentX = 0,
      currentY = 0,
      previousSpeed     = 15,

      init = function() {

        buttons = document.getElementsByClassName('fab-menu-button-item');
        buttonContainers = document.querySelectorAll('.fab-menu-items > li');
        buttonsContainer = document.getElementsByClassName('fab-menu-items');

        for (var i = 0; i < buttonContainers.length; i++) {

          var button = buttonContainers.item(i);
          var angle = (options.baseAngle + (options.rotationAngle * i));
          button.style.transform = "rotate(" + options.baseAngle + "deg) translate(0px) rotate(-" + options.baseAngle + "deg) scale(0)";
          button.style.WebkitTransform = "rotate(" + options.baseAngle + "deg) translate(0px) rotate(-" + options.baseAngle + "deg) scale(0)";
          button.setAttribute('angle', '' + angle);
        }
      },

      animateButtonsIn = function() {
        for (var i = 0; i < buttonContainers.length; i++) {

          var button = buttonContainers.item(i);
          var angle = button.getAttribute('angle');
          button.style.transform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";
          button.style.WebkitTransform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";
        }
      },
      animateButtonsOut = function() {
        for (var i = 0; i < buttonContainers.length; i++) {

          var button = buttonContainers.item(i);
          var angle = (options.baseAngle + (options.rotationAngle * i));
          button.setAttribute('angle', '' + angle);
          button.style.transform = "rotate(" + options.baseAngle + "deg) translate(0px) rotate(-" + options.baseAngle + "deg) scale(0)";
          button.style.WebkitTransform = "rotate(" + options.baseAngle + "deg) translate(0px) rotate(-" + options.baseAngle + "deg) scale(0)";
        }
      },

      rotateButtons = function(direction, speed) {

        // still looking for a better solution to handle the rotation speed
        // the direction will be used to define the angle calculation

        // max speed value is 25 // can change this :)
        // used previousSpeed to reduce the speed diff on each tick
        speed = (speed > 15) ? 15 : speed;
        speed = (speed + previousSpeed) / 2;
        previousSpeed = speed;

        var moveAngle = (direction * speed);

        // if first item is on top right or last item on bottom left, move no more
        if ((parseInt(buttonContainers.item(0).getAttribute('angle')) + moveAngle >= 285 && direction > 0) ||
          (parseInt(buttonContainers.item(buttonContainers.length - 1).getAttribute('angle')) + moveAngle <= 345 && direction < 0)
        ) {
          return;
        }

        for (var i = 0; i < buttonContainers.length; i++) {

          var button = buttonContainers.item(i),
            angle = parseInt(button.getAttribute('angle'));

          angle = angle + moveAngle;

          button.setAttribute('angle', '' + angle);

          button.style.transform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";
          button.style.WebkitTransform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";
        }
      },

      endRotateButtons = function() {

        for (var i = 0; i < buttonContainers.length; i++) {

          var button = buttonContainers.item(i),
            angle = parseInt(button.getAttribute('angle')),
            diff = angle % options.rotationAngle;
          // Round the angle to realign the elements after rotation ends
          angle = diff > options.rotationAngle / 2 ? angle + options.rotationAngle - diff : angle - diff;

          button.setAttribute('angle', '' + angle);

          button.style.transform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";
          button.style.WebkitTransform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";
        }
      };

    return {
      templateUrl: "templates/fab-menu.html",
      link: function(scope) {
        console.info("fab-menu :: link");

        init();

        scope.fabMenu = {
          active: false
        };

        var menuItems = angular.element(buttonsContainer);

        $ionicGesture.on('touch', function(event) {

          console.log('drag starts', event);
          lastDragTime = 0;
          currentX = event.gesture.deltaX;
          currentY = event.gesture.deltaY;
          previousSpeed = 0;

        }, menuItems)

        $ionicGesture.on('release', function(event) {
          console.log('drag ends');
          endRotateButtons();
        }, menuItems);

        $ionicGesture.on('drag', function(event) {

          if (event.gesture.timeStamp - lastDragTime > 100) {

            var direction = 1,
              deltaX = event.gesture.deltaX - currentX,
              deltaY = event.gesture.deltaY - currentY,
              delta = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

            if ((deltaX <= 0 && deltaY <= 0) || (deltaX <= 0 && Math.abs(deltaX) > Math.abs(deltaY))) {
              direction = -1;
            } else if ((deltaX >= 0 && deltaY >= 0) || (deltaY <= 0 && Math.abs(deltaX) < Math.abs(deltaY))) {
              direction = 1;
            }

            rotateButtons(direction, delta);

            lastDragTime = event.gesture.timeStamp;
            currentX = event.gesture.deltaX;
            currentY = event.gesture.deltaY;
          }
        }, menuItems);

        scope.fabMenuToggle = function() {

          if (scope.fabMenu.active) { // Close Menu
            animateButtonsOut();
          } else { // Open Menu
            animateButtonsIn();
          }
          scope.fabMenu.active = !scope.fabMenu.active;
        }

      }
    }
  })





/*
.filter('concejoFltr', function(){

  var filtro = function(datos_cam, concejo){
    console.log('datos_cam.rows desde filter', datos_cam.rows)
  if (!concejo)
    return datos_cam.rows;
  else
    return datos_cam.rows;
  }
return filtro;
    /!*
      $scope.isActive = function(user) {
        return user.User.Stats[0].active === "1";
      };
      and then in your HTML:

        <div ng-repeat="user in _users | filter:isActive">
        {{user.User.userid}}
      </div>
    *!/

    //var myRedObjects = $filter('filter')(myObjects, { color: "red" });


})
*/

// CORS request
//angular.module('wca')
//  .config(function($httpProvider) {
//    $httpProvider.defaults.useXDomain = true;
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//  });

; // FIN
