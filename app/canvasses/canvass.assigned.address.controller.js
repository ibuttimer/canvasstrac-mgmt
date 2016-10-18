/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignedAddressController', CanvassAssignedAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignedAddressController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'addressFactory', 'CANVASS', 'UTIL'];

function CanvassAssignedAddressController($scope, $rootScope, $state, $stateParams, addressFactory, CANVASS, UTIL) {

  console.log('CanvassAssignedAddressController id', $stateParams.id);

  $scope.list = addressFactory.getList(CANVASS.ASSIGNED_ADDR);
  $scope.pager = $scope.list.pager;
  $scope.reqAll = false; // disable request all button
  $scope.SET_SEL = UTIL.SET_SEL;
  $scope.CLR_SEL = UTIL.CLR_SEL;
  $scope.TOGGLE_SEL = UTIL.TOGGLE_SEL;
  
  /* function implementation
  -------------------------- */

}





