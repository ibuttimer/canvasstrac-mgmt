/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassDeleteController', CanvassDeleteController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassDeleteController.$inject = ['$scope', 'utilFactory'];

function CanvassDeleteController($scope, utilFactory) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.formatDate = utilFactory.formatDate;


  /* function implementation
  -------------------------- */

}

