/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignmentCanvasserController', CanvassAssignmentCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignmentCanvasserController.$inject = ['$scope', 'userFactory', 'RES', 'miscUtilFactory'];

function CanvassAssignmentCanvasserController($scope, userFactory, RES, miscUtilFactory) {

  $scope.list = userFactory.getList(RES.ALLOCATED_CANVASSER);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqAll = true; // emable request all button
  $scope.showBadge = true; // enable badge display
  miscUtilFactory.addSelectionCmds($scope);
  
  /* function implementation
  -------------------------- */

}





