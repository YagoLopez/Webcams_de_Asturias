app.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      })
    }
  };
  return fallbackSrc;
});
// ====================================================================================================================
app.directive('iframeOnload', [function(){
  return {
    scope: {
      callBack: '&iframeOnload'
    },
    link: function(scope, element, attrs){
      element.on('load', function(){
        return scope.callBack();
      })
    }
  }}]);
// ====================================================================================================================
app.directive('imageonload', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        //call the function that was passed
        scope.$apply(attrs.imageonload);
      })
    }
  };
});
// ====================================================================================================================
