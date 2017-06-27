/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignmentAddressController', CanvassAssignmentAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignmentAddressController.$inject = ['$scope', 'addressFactory', 'RES', 'filterSortService'];

function CanvassAssignmentAddressController($scope, addressFactory, RES, filterSortService) {

  $scope.list = addressFactory.getList(RES.ALLOCATED_ADDR);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.showBadge = true; // enable badge display
  $scope.reqButtons = filterSortService.getRequestButtons('addresses', filterSortService.FILTER_CLEAR);
  $scope.selButtons = filterSortService.getSelectButtons();

  /* function implementation
  -------------------------- */

}

