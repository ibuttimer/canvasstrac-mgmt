/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('LoginController', LoginController)

  .controller('RegisterController', RegisterController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

LoginController.$inject = ['$scope', '$state', '$rootScope', 'NgDialogFactory', 'Idle', 'authFactory', 'userFactory', 'userService', 'timerFactory', 'CONFIG', 'STATES'];

function LoginController($scope, $state, $rootScope, NgDialogFactory, Idle, authFactory, userFactory, userService, timerFactory, CONFIG, STATES) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.doLogin = doLogin;
  $scope.doFacebookLogin = doFacebookLogin;
  $scope.openRegister = openRegister;

  $scope.loginData = authFactory.getUserinfo();

  $scope.devmode = CONFIG.DEV_MODE;
  if (CONFIG.DEV_MODE) {
    $scope.devCredentials = devCredentials;
    $scope.devUser1 = CONFIG.DEV_USER1;
    $scope.devUser2 = CONFIG.DEV_USER2;
    $scope.devUser3 = CONFIG.DEV_USER3;
  }

  /* function implementation
    -------------------------- */

  function loginSuccess (/*response*/) {
    $rootScope.$broadcast('login:Successful');
    goHome();

    // start idle watching, also starts the Keepalive service by default.
    Idle.watch();
  }

  function loginFailure (response) {
    NgDialogFactory.error(response, 'Login Unsuccessful');
    goHome();
  }

  function goHome() {
    if ($state.is(STATES.APP)) {
      $state.reload();
    } else {
      $state.go(STATES.APP);
    }
  }

  function setSource(data) {
    data.src = authFactory.SRC.WEB;
    return data;
  }

  function doLogin() {
    authFactory.login(setSource($scope.loginData), loginSuccess, loginFailure);
    NgDialogFactory.close();
  }

  function doFacebookLogin() {
    authFactory.loginByFacebook(setSource($scope.loginData), loginSuccess, loginFailure);
    NgDialogFactory.close();
  }

  function openRegister() {
    NgDialogFactory.open({ template: 'login/register.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'RegisterController' });
  }

  // Quick hack for dev mode to enter user credentials
  function devCredentials(user) {
    // HACK username/password for dev
    if (!$scope.loginData) {
      $scope.loginData = {};
    }
    if (user === CONFIG.DEV_USER1) {
      $scope.loginData.username = CONFIG.DEV_USER1;
      $scope.loginData.password = CONFIG.DEV_PASSWORD1;
    } else if (user === CONFIG.DEV_USER2) {
      $scope.loginData.username = CONFIG.DEV_USER2;
      $scope.loginData.password = CONFIG.DEV_PASSWORD2;
    } else if (user === CONFIG.DEV_USER3) {
      $scope.loginData.username = CONFIG.DEV_USER3;
      $scope.loginData.password = CONFIG.DEV_PASSWORD3;
    }
  }



}


RegisterController.$inject = ['$scope', '$rootScope', 'NgDialogFactory', 'authFactory'];

function RegisterController ($scope, $rootScope, NgDialogFactory, authFactory) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.doRegister = doRegister;

  $scope.registration = {};
  $scope.loginData = {};


  /* function implementation
    -------------------------- */

  function doRegister() {
    authFactory.register($scope.registration,
      // success functgion
      function (/*response*/) {
        $rootScope.$broadcast('registration:Successful');
      },
      // failure function
      function (response) {
        NgDialogFactory.error(response, 'Registration Unsuccessful');
      }
    );

    NgDialogFactory.close();
  }
}
