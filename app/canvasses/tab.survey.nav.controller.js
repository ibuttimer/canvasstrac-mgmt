/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('SurveyTabNavController', SurveyTabNavController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

SurveyTabNavController.$inject = ['$scope'];

function SurveyTabNavController($scope) {

  $scope.hasPrev = true;
  $scope.hasReset = true;
  $scope.prevTooltip = 'Canvass tab';
  $scope.prevEnabled = function () {
    return this.surveyForm.$invalid;
  };
  $scope.nextText = 'Next';
  $scope.nextTooltip = 'Address tab';
  $scope.nextEnabled = function () {
    return this.surveyForm.$invalid;
  };

  /* function implementation
  -------------------------- */

}





