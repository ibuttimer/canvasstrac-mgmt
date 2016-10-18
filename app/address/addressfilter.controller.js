/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .controller('AddressFilterController', AddressFilterController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

AddressFilterController.$inject = ['$scope'];

function AddressFilterController($scope) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.initFilter = initFilter;

  $scope.title = $scope.ngDialogData.title + ' Filter Options';

 
  
  /* function implementation
  -------------------------- */

  function initFilter() {
    $scope.ngDialogData.filter = {};
  }
  

}

