/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('ResultDetailController', ResultDetailController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

ResultDetailController.$inject = ['$scope', 'CHARTS'];

function ResultDetailController ($scope, CHARTS) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.showPieChart = showPieChart;
  $scope.showBarChart = showBarChart;
  $scope.showPolarAreaChart = showPolarAreaChart;
  $scope.indexToStyle = indexToStyle;

  $scope.question = $scope.ngDialogData.question;
  $scope.chart = $scope.ngDialogData.chart;
  $scope.details = $scope.ngDialogData.details;
  $scope.respCnt = $scope.ngDialogData.respCnt;

  /* function implementation
  -------------------------- */

  function showPieChart (chart) {
    return (chart === CHARTS.PIE);
  }

  function showBarChart (chart) {
    return (chart === CHARTS.BAR);
  }

  function showPolarAreaChart (chart) {
    return (chart === CHARTS.POLAR);
  }

  function indexToStyle (index) {
    // different colours for alternate entries
    return (((indexToStyle % 2) === 0) ? 'bg-info' : 'bg-primary');
  }

}

