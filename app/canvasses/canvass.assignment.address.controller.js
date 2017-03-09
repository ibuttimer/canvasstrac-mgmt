/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignmentAddressController', CanvassAssignmentAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignmentAddressController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'addressFactory', 'RES', 'UTIL'];

function CanvassAssignmentAddressController($scope, $rootScope, $state, $stateParams, addressFactory, RES, UTIL) {

  console.log('CanvassAssignmentAddressController id', $stateParams.id);

  $scope.list = addressFactory.getList(RES.ALLOCATED_ADDR);

  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqAll = true; // enable request all button
  $scope.showBadge = true; // enable badge display
  $scope.SET_SEL = UTIL.SET_SEL;
  $scope.CLR_SEL = UTIL.CLR_SEL;
  $scope.TOGGLE_SEL = UTIL.TOGGLE_SEL;
  

  /* function implementation
  -------------------------- */

}

