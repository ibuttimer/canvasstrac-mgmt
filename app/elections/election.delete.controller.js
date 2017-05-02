/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('ElectionDeleteController', ElectionDeleteController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

ElectionDeleteController.$inject = ['$scope', 'utilFactory'];

function ElectionDeleteController($scope, utilFactory) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.formatDate = utilFactory.formatDate;


  /* function implementation
  -------------------------- */

}

