/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .value('HOMESCRN', {
    message: undefined  // message to display on hmoe screen
  })
  .controller('HomeController', HomeController);


HomeController.$inject = ['$scope', 'HOMESCRN'];

function HomeController ($scope, HOMESCRN) {

  $scope.message = HOMESCRN.message;

  $scope.$watch('message', function(newValue, oldValue, scope) {
    scope.message = newValue;
  }, true);

}


