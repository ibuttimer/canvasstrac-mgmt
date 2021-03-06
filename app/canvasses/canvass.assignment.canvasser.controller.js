/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAssignmentCanvasserController', CanvassAssignmentCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignmentCanvasserController.$inject = ['$scope', 'userFactory', 'RES', 'filterSortService'];

function CanvassAssignmentCanvasserController($scope, userFactory, RES, filterSortService) {

  $scope.list = userFactory.getList(RES.ALLOCATED_CANVASSER);
  $scope.sortOptions = $scope.list.sortOptions;
  $scope.pager = $scope.list.pager;
  $scope.showBadge = true; // enable badge display
  $scope.reqButtons = filterSortService.getRequestButtons('canvassers', filterSortService.FILTER_CLEAR);
  $scope.selButtons = filterSortService.getSelectButtons();
  $scope.addressCountStr = addressCountStr;

  /* function implementation
  -------------------------- */

  function addressCountStr (count) {
    var str;
    switch (count) {
      case 0:
        str = 'No addresses';
        break;
      case 1:
        str = count + ' address';
        break;
      default:
        str = count + ' addresses';
        break;
    }
    return str;
  }

}





