/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassersTabNavController', CanvassersTabNavController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassersTabNavController.$inject = ['$scope'];

function CanvassersTabNavController($scope) {

  $scope.hasPrev = true;
  $scope.hasReset = false;
  $scope.prevTooltip = 'Address tab';
  $scope.prevEnabled = function () {
    return this.canvasserForm.$invalid;
  };
  $scope.nextText = 'Next';
  $scope.nextTooltip = 'Assignment tab';
  $scope.nextEnabled = function () {
    return this.canvasserForm.$invalid;
  };

  /* function implementation
  -------------------------- */

}





