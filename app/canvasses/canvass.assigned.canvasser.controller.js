/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignedCanvasserController', CanvassAssignedCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignedCanvasserController.$inject = ['$scope', 'userFactory', 'RES', 'filterSortService'];

function CanvassAssignedCanvasserController($scope, userFactory, RES, filterSortService) {

  $scope.list = userFactory.getList(RES.ASSIGNED_CANVASSER);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.reqButtons = filterSortService.getRequestButtons('assigned canvassers', filterSortService.FILTER_CLEAR);
  $scope.selButtons = filterSortService.getSelectButtons();
  
  /* function implementation
  -------------------------- */

}





