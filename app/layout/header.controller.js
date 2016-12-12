/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('HeaderController', HeaderController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

HeaderController.$inject = ['$scope', '$state', '$rootScope', 'authFactory', 'stateFactory', 'NgDialogFactory'];

function HeaderController ($scope, $state, $rootScope, authFactory, stateFactory, NgDialogFactory) {

  $scope.status = {
    cfgIsOpen: false,
    cmpgnIsOpen: false
  };
  
  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.setLoggedIn = setLoggedIn;
  $scope.openLogin = openLogin;
  $scope.logOut = logOut;
  $scope.stateIs = stateFactory.stateIs;
  $scope.stateIsNot = stateFactory.stateIsNot;
  $scope.stateIncludes = stateFactory.stateIncludes;
  $scope.menuStateIs = stateFactory.menuStateIs;

  $scope.setLoggedIn(false);

  $rootScope.$on('login:Successful', function () {
    $scope.setLoggedIn(true);
  });

  $rootScope.$on('registration:Successful', function () {
    $scope.setLoggedIn(true);
  });

  /* function implementation
    -------------------------- */

  /**
   * Set logged in state
   * @param {boolean} loggedIn - logged in flag; false: force logged off state, true: state determined by authentication factory
   */
  function setLoggedIn(loggedIn) {
    if (!loggedIn) {
      $scope.loggedIn = false;
      $scope.username = '';
    } else {
      $scope.loggedIn = authFactory.isAuthenticated();
      $scope.username = authFactory.getUsername();
    }
  }

  function openLogin() {
    NgDialogFactory.open({ template: 'login/login.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'LoginController' });
  }

  function logOut() {
    authFactory.logout(function (response) {
      $state.go('app');
    });
    $scope.setLoggedIn(false);
  }

}
