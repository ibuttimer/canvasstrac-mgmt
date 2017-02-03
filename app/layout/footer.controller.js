/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('FooterController', FooterController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

FooterController.$inject = ['$scope', 'stateFactory', 'MENUS'];

function FooterController ($scope, stateFactory, MENUS) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  stateFactory.addInterface($scope);  // add stateFactory menthod to scope

  $scope.aboutMenu = MENUS.ABOUT;
  $scope.homeMenu = MENUS.HOME;


  /* function implementation
    -------------------------- */

}
