/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignmentCanvasserController', CanvassAssignmentCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignmentCanvasserController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'userFactory', 'RES', 'UTIL'];

function CanvassAssignmentCanvasserController($scope, $rootScope, $state, $stateParams, userFactory, RES, UTIL) {

  console.log('CanvassAssignmentCanvasserController id', $stateParams.id);

  $scope.list = userFactory.getList(RES.ALLOCATED_CANVASSER);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqAll = true; // emable request all button
  $scope.showBadge = true; // enable badge display
  $scope.SET_SEL = UTIL.SET_SEL;
  $scope.CLR_SEL = UTIL.CLR_SEL;
  $scope.TOGGLE_SEL = UTIL.TOGGLE_SEL;
  
  /* function implementation
  -------------------------- */

}





