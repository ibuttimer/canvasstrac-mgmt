/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassUnassignedAddressController', CanvassUnassignedAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassUnassignedAddressController.$inject = ['$scope', 'addressFactory', 'RES', 'UTIL'];

function CanvassUnassignedAddressController($scope, addressFactory, RES, UTIL) {

  $scope.list = addressFactory.getList(RES.UNASSIGNED_ADDR);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqAll = true; // emable request all button
  $scope.SET_SEL = UTIL.SET_SEL;
  $scope.CLR_SEL = UTIL.CLR_SEL;
  $scope.TOGGLE_SEL = UTIL.TOGGLE_SEL;
  
  
  /* function implementation
  -------------------------- */

}





