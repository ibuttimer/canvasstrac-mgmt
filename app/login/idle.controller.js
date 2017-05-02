/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('IdleController', IdleController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

IdleController.$inject = ['$scope', 'NgDialogFactory', 'CONFIG'];

function IdleController($scope, NgDialogFactory, CONFIG) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.finished = finished;

  if (CONFIG.AUTOLOGOUTCOUNT < 60) {
    $scope.secTimer = true; // seconds timer
  } else if (CONFIG.AUTOLOGOUTCOUNT < 3600) {
    $scope.minTimer = true; // minutes timer
  } else if (CONFIG.AUTOLOGOUTCOUNT < 86400) {
    $scope.hrTimer = true; // hours timer
  } else {
    $scope.dayTimer = true; // days timer
  }
  $scope.timerDuration = CONFIG.AUTOLOGOUTCOUNT; //sec
  $scope.timerInterval = 1000; // interval 1 sec



  /* function implementation
    -------------------------- */

  function finished () {
    NgDialogFactory.close();
  }

}


