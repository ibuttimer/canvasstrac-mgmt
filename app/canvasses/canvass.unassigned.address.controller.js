/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassUnassignedAddressController', CanvassUnassignedAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassUnassignedAddressController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'addressFactory', 'CANVASS', 'UTIL'];

function CanvassUnassignedAddressController($scope, $rootScope, $state, $stateParams, addressFactory, CANVASS, UTIL) {

  console.log('CanvassUnassignedAddressController id', $stateParams.id);

  $scope.list = addressFactory.getList(CANVASS.UNASSIGNED_ADDR);
  $scope.pager = $scope.list.pager;
  $scope.reqAll = true; // emable request all button
  $scope.SET_SEL = UTIL.SET_SEL;
  $scope.CLR_SEL = UTIL.CLR_SEL;
  $scope.TOGGLE_SEL = UTIL.TOGGLE_SEL;
  
  
  /* function implementation
  -------------------------- */

}





