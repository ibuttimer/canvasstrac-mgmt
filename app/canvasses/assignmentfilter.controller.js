/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('AssignmentFilterController', AssignmentFilterController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

AssignmentFilterController.$inject = ['$scope'];

function AssignmentFilterController($scope) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.initFilter = initFilter;

  $scope.title = $scope.ngDialogData.ctrl.title + ' Filter Options';
  $scope.assignmentChoices = $scope.ngDialogData.ctrl.assignmentChoices;
  $scope.assignmentLabel = $scope.ngDialogData.ctrl.assignmentLabel;
  $scope.nameFields = $scope.ngDialogData.ctrl.nameFields;
 
 
  
  /* function implementation
  -------------------------- */

  function initFilter() {
    $scope.ngDialogData.filter = {};
  }
  

}

