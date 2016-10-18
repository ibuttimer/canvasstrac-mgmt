/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassUnassignedCanvasserController', CanvassUnassignedCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassUnassignedCanvasserController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'userFactory', 'CANVASS', 'UTIL'];

function CanvassUnassignedCanvasserController($scope, $rootScope, $state, $stateParams, userFactory, CANVASS, UTIL) {

  console.log('CanvassUnassignedCanvasserController id', $stateParams.id);

  $scope.list = userFactory.getList(CANVASS.UNASSIGNED_CANVASSER);
  $scope.pager = $scope.list.pager;
  $scope.reqAll = true; // emable request all button
  $scope.SET_SEL = UTIL.SET_SEL;
  $scope.CLR_SEL = UTIL.CLR_SEL;
  $scope.TOGGLE_SEL = UTIL.TOGGLE_SEL;
  
  /* function implementation
  -------------------------- */

}





