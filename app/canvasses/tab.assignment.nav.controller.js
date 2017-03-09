/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('AssignmentTabNavController', AssignmentTabNavController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

AssignmentTabNavController.$inject = ['$scope'];

function AssignmentTabNavController($scope) {

  $scope.hasPrev = true;
  $scope.hasReset = false;
  $scope.prevEnabled = function () {
    return this.assignmentForm.$invalid;
  };
  if ($scope.lastTab === $scope.tabs.ASSIGNMENT_TAB) {
    $scope.nextText = 'Done';
  } else {
    $scope.nextText = 'Next';
  }
  $scope.nextEnabled = function () {
    return this.assignmentForm.$invalid;
  };

  /* function implementation
  -------------------------- */

}





