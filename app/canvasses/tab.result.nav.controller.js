/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('ResultTabNavController', ResultTabNavController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

ResultTabNavController.$inject = ['$scope'];

function ResultTabNavController($scope) {

  $scope.hasPrev = true;
  $scope.hasReset = false;
  $scope.prevEnabled = function () {
    return this.resultForm.$invalid;
  };
  $scope.nextText = 'Done';
  $scope.nextEnabled = function () {
    return this.resultForm.$invalid;
  };

  /* function implementation
  -------------------------- */

}





