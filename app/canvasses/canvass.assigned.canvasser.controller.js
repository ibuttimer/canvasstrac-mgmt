/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignedCanvasserController', CanvassAssignedCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignedCanvasserController.$inject = ['$scope', 'userFactory', 'RES', 'miscUtilFactory'];

function CanvassAssignedCanvasserController($scope, userFactory, RES, miscUtilFactory) {

  $scope.list = userFactory.getList(RES.ASSIGNED_CANVASSER);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqAll = false; // disable request all button
  miscUtilFactory.addSelectionCmds($scope);
  
  /* function implementation
  -------------------------- */

}





