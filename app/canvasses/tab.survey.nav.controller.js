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
  $scope.prevEnabled = function () {
    return this.surveyForm.$invalid;
  };
  $scope.nextText = 'Next';
  $scope.nextEnabled = function () {
    return this.surveyForm.$invalid;
  };

  /* function implementation
  -------------------------- */

}





