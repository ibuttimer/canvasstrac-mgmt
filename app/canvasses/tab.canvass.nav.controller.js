/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassTabNavController', CanvassTabNavController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassTabNavController.$inject = ['$scope'];

function CanvassTabNavController($scope) {

  $scope.hasPrev = false;
  $scope.hasReset = true;
  $scope.prevEnabled = function () {
    return this.canvassForm.$invalid;
  };
  $scope.nextText = 'Next';
  $scope.nextEnabled = function () {
    return this.canvassForm.$invalid;
  };

  /* function implementation
  -------------------------- */

}





