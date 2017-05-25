/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignmentAddressController', CanvassAssignmentAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignmentAddressController.$inject = ['$scope', 'addressFactory', 'RES', 'miscUtilFactory'];

function CanvassAssignmentAddressController($scope, addressFactory, RES, miscUtilFactory) {

  $scope.list = addressFactory.getList(RES.ALLOCATED_ADDR);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqAll = true; // enable request all button
  $scope.showBadge = true; // enable badge display
  miscUtilFactory.addSelectionCmds($scope);
  

  /* function implementation
  -------------------------- */

}

