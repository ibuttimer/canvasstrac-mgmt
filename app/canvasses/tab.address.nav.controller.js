/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('AddressTabNavController', AddressTabNavController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

AddressTabNavController.$inject = ['$scope'];

function AddressTabNavController($scope) {

  $scope.hasPrev = true;
  $scope.hasReset = false;
  $scope.prevEnabled = function () {
    return this.addressForm.$invalid;
  };
  $scope.nextText = 'Next';
  $scope.nextEnabled = function () {
    return this.addressForm.$invalid;
  };

  /* function implementation
  -------------------------- */

}





