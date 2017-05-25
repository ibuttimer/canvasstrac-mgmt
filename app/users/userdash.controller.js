/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('UserDashController', UserDashController)

  .filter('filterDashUser', ['UTIL', function (UTIL) {
    return function (input, name, op, role) {

      if (!op) {
        op = UTIL.OP_OR;
      }
      var out = [];
      if (name || role) {
        // filter by name & role values for
        angular.forEach(input, function (user) {
          var nameOk,
            roleOk,
            username = user.person.firstname + ' ' + user.person.lastname;

          if (name) {
            nameOk = (username.toLowerCase().indexOf(name) >= 0);
          } else {
            nameOk = false;
          }
          if (role) {
            roleOk = (user.role._id === role);
          } else {
            roleOk = false;
          }
          if (((op === UTIL.OP_OR) && (nameOk || roleOk)) ||
              ((op === UTIL.OP_AND) && (nameOk && roleOk))) {
            out.push(user);
          }
        });
      } else {
        out = input;
      }
      return out;
    };
  }]);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

UserDashController.$inject = ['$scope', 'roleFactory', 'userFactory', 'userService', 'NgDialogFactory', 'stateFactory', 'controllerUtilFactory', 'miscUtilFactory', 'USERSCHEMA', 'STATES', 'UTIL'];

function UserDashController($scope, roleFactory, userFactory, userService, NgDialogFactory, stateFactory, controllerUtilFactory, miscUtilFactory, USERSCHEMA, STATES, UTIL) {

  controllerUtilFactory.setScopeVars('USERS', $scope);

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterOps = UTIL.OP_LIST;
  $scope.initFilter = initFilter;
  $scope.toggleSelection = toggleSelection;

  $scope.changeStateParam = changeStateParam;
  $scope.dashDelete = dashDelete;
  $scope.setSelect = setSelect;
  $scope.getStateButton = getStateButton;

  stateFactory.addInterface($scope);  // add stateFactory menthods to scope

  initFilter();

  // get list of roles selecting name field, _id field is always provided
  $scope.roles = roleFactory.getRoles().query({fields: 'name'})
    .$promise.then(
      // success function
      function (response) {
        // response is actual data
        $scope.roles = response;

        // get list of users
        getUsers();
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response);
      }
    );

  /* function implementation
  -------------------------- */

  function initFilter() {
    $scope.filterText = undefined;
    $scope.filterRole = undefined;
    $scope.filterOp = undefined;
    setSelect(0);
  }

  function toggleSelection (entry) {
    setUser(
      controllerUtilFactory.toggleSelection($scope, entry, $scope.users, initUser)
    );
  }

  function getUsers() {
    // get list of users
    $scope.users = userFactory.getUsers().query(
      // success function
      function (response) {
        // response is actual data
        $scope.users = response;
      },
      // error function
      function (response) {
        // repose is message
        NgDialogFactory.error(response);
      }
    );
  }


  function changeStateParam () {
    return {
      id: $scope.user._id
    };
  }

  function setUser (user) {
    $scope.user = user;
  }

  function initUser () {
    // include only required fields
    setUser(USERSCHEMA.SCHEMA.getObject());
  }

  function dashDelete() {
    var selectedList = miscUtilFactory.getSelectedList($scope.users);
    userService.confirmDeleteUser($scope, selectedList,
      // on success
      function (/*response*/) {
        getUsers();
      });
  }

  function getStateButton (state) {
    return userService.getStateButton($scope, state);
  }


  function setSelect (sel) {
    return controllerUtilFactory.setSelect($scope, $scope.users, sel);
  }

}

