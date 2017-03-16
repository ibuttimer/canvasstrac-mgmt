/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('SubmenuPageController', SubmenuPageController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

SubmenuPageController.$inject = ['$scope', 'SUBMENU'];

function SubmenuPageController ($scope, SUBMENU) {

  var menuEntries = [];
  for (var prop in SUBMENU) {
    if (SUBMENU[prop].header) {
      menuEntries.push(SUBMENU[prop]);
    }
  }

  $scope.menuEntries = menuEntries;

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033

  /* function implementation
    -------------------------- */

}
