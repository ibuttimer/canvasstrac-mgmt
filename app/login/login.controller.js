/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .controller('LoginController', LoginController)

  .controller('RegisterController', RegisterController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

LoginController.$inject = ['$scope', '$rootScope', 'NgDialogFactory', 'authFactory'];

function LoginController($scope, $rootScope, NgDialogFactory, authFactory) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.doLogin = doLogin;
  $scope.doFacebookLogin = doFacebookLogin;
  $scope.openRegister = openRegister;

  $scope.loginData = authFactory.getUserinfo();

  /* function implementation
    -------------------------- */

  function loginSuccess (response) {
    $rootScope.$broadcast('login:Successful');
  }

  function loginFailure (response) {
    NgDialogFactory.error(response, 'Login Unsuccessful');
  }

  function doLogin() {
    if($scope.rememberMe) {
      authFactory.storeUserinfo($scope.loginData);
    } else {
      authFactory.removeUserinfo();
    }

    authFactory.login($scope.loginData, loginSuccess, loginFailure);

    NgDialogFactory.close();
  }

  function doFacebookLogin() {
    authFactory.loginByFacebook(loginSuccess, loginFailure);
    NgDialogFactory.close();
  }

  function openRegister() {
    NgDialogFactory.open({ template: 'login/register.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'RegisterController' });
  }

}


RegisterController.$inject = ['$scope', '$rootScope', 'NgDialogFactory', 'authFactory'];

function RegisterController ($scope, $rootScope, NgDialogFactory, authFactory) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.doRegister = doRegister;

  $scope.register = {};
  $scope.loginData = {};


  /* function implementation
    -------------------------- */

  function doRegister() {
    console.log('Doing registration', $scope.registration);

    authFactory.register($scope.registration,
      // success functgion
      function (response) {
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
