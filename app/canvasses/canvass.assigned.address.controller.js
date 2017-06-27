/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignedAddressController', CanvassAssignedAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignedAddressController.$inject = ['$scope', 'addressFactory', 'RES', 'filterSortService'];

function CanvassAssignedAddressController($scope, addressFactory, RES, filterSortService) {

  $scope.list = addressFactory.getList(RES.ASSIGNED_ADDR);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqButtons = filterSortService.getRequestButtons('assigned addresses', filterSortService.FILTER_CLEAR);
  $scope.selButtons = filterSortService.getSelectButtons();
  
  /* function implementation
  -------------------------- */

}





