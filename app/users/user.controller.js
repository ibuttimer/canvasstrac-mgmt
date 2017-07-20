/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('UserController', UserController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

UserController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'roleFactory', 'userFactory', 'userService', 'NgDialogFactory', 'stateFactory', 'consoleService', 'controllerUtilFactory', 'DEBUG', 'MISC'];

function UserController($scope, $rootScope, $state, $stateParams, roleFactory, userFactory, userService, NgDialogFactory, stateFactory, consoleService, controllerUtilFactory, DEBUG, MISC) {

  var con = consoleService.getLogger('UserController');

  con.log('UserController id', $stateParams.id);

  controllerUtilFactory.setScopeVars('USERS', $scope);

  if (DEBUG.devmode) {
    $scope.debug = DEBUG;
  }

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.getTitle = getTitle;
  $scope.processForm = processForm;

  $scope.changeStateParam = changeStateParam;
  $scope.singleDelete = singleDelete;
  $scope.getStateButton = getStateButton;

  $scope.gotoDash = gotoDash;

  stateFactory.addInterface($scope);  // add stateFactory menthods to scope

  initUser($stateParams.id);

  // get list of roles selecting name field, _id field is always provided
  $scope.roles = roleFactory.query('role', {fields: 'name'},
    // success function
    function (response) {
      // response is actual data
      $scope.roles = response;
    },
    // error function
    function (response) {
      // response is message
      NgDialogFactory.error(response);
    }
  );
  $scope.countries = MISC.COUNTRIES;

  /* function implementation
  -------------------------- */

  function getTitle() {
    $scope.editDisabled = true;
    $scope.passSetable = false;

    var title;
    if ($state.is($scope.newState)) {
      title = 'Create User';
      $scope.editDisabled = false;
      $scope.passSetable = true;
    } else if ($state.is($scope.viewState)) {
      title = 'View User';
    } else if ($state.is($scope.editState)) {
      title = 'Update User';
      $scope.editDisabled = false;
    } else {
      title = '';
    }
    return title;
  }

  function processForm() {
    if ($state.is($scope.newState)) {
      createUser();
    } else if ($state.is($scope.viewState)) {
      gotoDash();
    } else if ($state.is($scope.editState)) {
      updateUser();
    }
  }

  function initUser(id) {
    if (!id) {
      // include only required fields
      $scope.user = {
        firstname: '',
        lastname: '',
        username: '',
        role: '',
        _id: ''
      };
    } else {
      $scope.user = undefined;
      userService.getUserDetails(id, true,
        // success function
        function (response, user) {

          con.log('response', response);

          $scope.user = user;
        }
      );
    }
  }


  function createUser() {

    con.log('createUser', $scope.user);

    userFactory.save('user', $scope.user,
      // success function
      function (/*response*/) {
        initUser();
        gotoDash();
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response, 'Creation Unsuccessful');
      }
    );
  }

  function updateUser() {

    con.log('updateUser', $scope.user);

    userFactory.update('user', {id: $scope.user._id}, $scope.user,
      // success function
      function (/*response*/) {
        initUser();
        gotoDash();
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response, 'Update Unsuccessful');
      }
    );
  }

  function changeStateParam () {
    return {
      id: $scope.user._id
    };
  }

  function singleDelete() {
    userService.confirmDeleteUser($scope, [$scope.user],
      // success function
      function (/*response*/) {
        gotoDash();
      });
  }

  function getStateButton (state) {
    return userService.getStateButton($scope, state);
  }

  function gotoDash() {
    $state.go($scope.dashState);
  }


}

