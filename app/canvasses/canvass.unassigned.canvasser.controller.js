/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassUnassignedCanvasserController', CanvassUnassignedCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassUnassignedCanvasserController.$inject = ['$scope', 'userFactory', 'RES', 'miscUtilFactory'];

function CanvassUnassignedCanvasserController($scope, userFactory, RES, miscUtilFactory) {

  $scope.list = userFactory.getList(RES.UNASSIGNED_CANVASSER);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqAll = true; // emable request all button
  miscUtilFactory.addSelectionCmds($scope);
  
  /* function implementation
  -------------------------- */

}





