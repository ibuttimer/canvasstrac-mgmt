/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassUnassignedAddressController', CanvassUnassignedAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassUnassignedAddressController.$inject = ['$scope', 'addressFactory', 'RES', 'miscUtilFactory'];

function CanvassUnassignedAddressController($scope, addressFactory, RES, miscUtilFactory) {

  $scope.list = addressFactory.getList(RES.UNASSIGNED_ADDR);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqAll = true; // emable request all button
  miscUtilFactory.addSelectionCmds($scope);
  
  
  /* function implementation
  -------------------------- */

}





