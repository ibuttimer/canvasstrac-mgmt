/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignedCanvasserController', CanvassAssignedCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignedCanvasserController.$inject = ['$scope', 'userFactory', 'RES', 'UTIL'];

function CanvassAssignedCanvasserController($scope, userFactory, RES, UTIL) {

  $scope.list = userFactory.getList(RES.ASSIGNED_CANVASSER);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqAll = false; // disable request all button
  $scope.SET_SEL = UTIL.SET_SEL;
  $scope.CLR_SEL = UTIL.CLR_SEL;
  $scope.TOGGLE_SEL = UTIL.TOGGLE_SEL;
  
  /* function implementation
  -------------------------- */

}





