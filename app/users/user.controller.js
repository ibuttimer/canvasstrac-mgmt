/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('UserController', UserController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

UserController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'roleFactory', 'userFactory', 'userService', 'NgDialogFactory', 'stateFactory', 'miscUtilFactory', 'consoleService', 'controllerUtilFactory', 'ADDRSCHEMA', 'PEOPLESCHEMA', 'DEBUG'];

function UserController($scope, $rootScope, $state, $stateParams, roleFactory, userFactory, userService, NgDialogFactory, stateFactory, miscUtilFactory, consoleService, controllerUtilFactory, ADDRSCHEMA, PEOPLESCHEMA, DEBUG) {

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
  $scope.roles = roleFactory.getRoles().query({fields: 'name'})
    .$promise.then(
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

  /* function implementation
  -------------------------- */

  function getTitle() {
    $scope.editDisabled = true;

    var title;
    if ($state.is($scope.newState)) {
      title = 'Create User';
      $scope.editDisabled = false;
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
      $scope.user = userFactory.getUsers().get({id: id})
        .$promise.then(
          // success function
          function (response) {
            
            con.log('response', response);
            
            var user = {
              // from user model
              username: response.username,
              role: response.role._id,
              _id: response._id
            };

            copyProperties(response.person, user, PEOPLESCHEMA.SCHEMA, [
                PEOPLESCHEMA.IDs.FNAME,
                PEOPLESCHEMA.IDs.LNAME,
                PEOPLESCHEMA.IDs.NOTE
              ]);
            copyProperties(response.person.address, user, ADDRSCHEMA.SCHEMA, [
                ADDRSCHEMA.IDs.ADDR1,
                ADDRSCHEMA.IDs.ADDR2,
                ADDRSCHEMA.IDs.ADDR3,
                ADDRSCHEMA.IDs.TOWN,
                ADDRSCHEMA.IDs.CITY,
                ADDRSCHEMA.IDs.COUNTY,
                ADDRSCHEMA.IDs.COUNTRY,
                ADDRSCHEMA.IDs.PCODE,
                ADDRSCHEMA.IDs.GPS
              ]);
            // TODO contactDetails schema & factory
//            copyProperties(response.person.contactDetails, user, schema, ids);

            if (response.person.contactDetails) {
              miscUtilFactory.copyProperties(response.person.contactDetails, user, [
                // from contactDetails model
                'phone', 'mobile', 'email', 'website', 'facebook', 'twitter'
                ]);
            }

            if (DEBUG.devmode) {
              user.person_id = miscUtilFactory.readSafe(response, ['person','_id']);
              user.address_id = miscUtilFactory.readSafe(response, ['person','address','_id']);
              user.contact_id = miscUtilFactory.readSafe(response, ['person','contactDetails','_id']);
            }

            $scope.user = user;
          },
          // error function
          function (response) {
            // response is message
            NgDialogFactory.error(response, 'Unable to retrieve User');
          }
        );
    }
  }


  function copyProperties (from, to, schema, ids) {
    if (from) {
      var fields = [];
      ids.forEach(function (id) {
        fields.push(schema.getModelName(id));
      });
      miscUtilFactory.copyProperties(from, to, fields);
    }
  }


  function createUser() {

    con.log('createUser', $scope.user);

    userFactory.getUsers().save($scope.user)
      .$promise.then(
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

    userFactory.getUsers().update({id: $scope.user._id}, $scope.user)
      .$promise.then(
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

