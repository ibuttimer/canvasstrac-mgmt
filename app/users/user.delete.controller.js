/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('UserDeleteController', UserDeleteController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

UserDeleteController.$inject = ['$scope', 'utilFactory'];

function UserDeleteController($scope, utilFactory) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.formatDate = utilFactory.formatDate;


  /* function implementation
  -------------------------- */

}

