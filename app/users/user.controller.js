/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('UserController', UserController)

  .filter('filterUser', ['UTIL', function (UTIL) {
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

UserController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'roleFactory', 'userFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'miscUtilFactory', 'ADDRSCHEMA', 'PEOPLESCHEMA', 'STATES', 'UTIL'];

function UserController($scope, $rootScope, $state, $stateParams, roleFactory, userFactory, NgDialogFactory, stateFactory, utilFactory, miscUtilFactory, ADDRSCHEMA, PEOPLESCHEMA, STATES, UTIL) {

  console.log('UserController id', $stateParams.id);

  $scope.dashState = STATES.USERS;
  $scope.newState = STATES.USERS_NEW;
  $scope.viewState = STATES.USERS_VIEW;
  $scope.editState = STATES.USERS_EDIT;

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.userFilterOps = UTIL.OP_LIST;
  $scope.initUserFilter = initUserFilter;
  $scope.toggleSelection = toggleSelection;
  $scope.getTitle = getTitle;
  $scope.selectedCnt = 0;
  $scope.editDisabled = true;
  $scope.initUser = initUser;
  $scope.processForm = processForm;
  $scope.viewUser = viewUser;
  $scope.editUser = editUser;
  $scope.confirmDelete = confirmDelete;
  $scope.stateIs = stateFactory.stateIs;
  $scope.stateIsNot = stateFactory.stateIsNot;
  $scope.stateIncludes = stateFactory.stateIncludes;
  $scope.menuStateIs = stateFactory.menuStateIs;
  
  initUserFilter();
  initUser($stateParams.id);

  // get list of roles selecting name field, _id field is always provided
  $scope.roles = roleFactory.getRoles().query({fields: 'name'})
    .$promise.then(
      // success function
      function (response) {
        // response is actual data
        
        console.log(response);
        
        $scope.roles = response;
      },
      // error function
      function (response) {
        // response is message
        $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
      }
    );

  $scope.users = userFactory.getUsers().query(
    // success function
    function (response) {
      // response is actual data
      $scope.users = response;
//        $scope.showMenu = true;
    },
    // error function
    function (response) {
      // repose is message
      $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
    }
  );


  
  
  /* function implementation
  -------------------------- */

  function initUserFilter() {
    $scope.userFilterText = undefined;
    $scope.userFilterRole = undefined;
    $scope.userFilterOp = undefined;
    $scope.userSelectList = undefined;
    $scope.selectedCnt = utilFactory.initSelected($scope.users);
  }
  
  function toggleSelection(entry) {
    $scope.selectedCnt = utilFactory.toggleSelection(entry, $scope.selectedCnt);
    switch ($scope.selectedCnt) {
      case 1:
        if (entry.isSelected) {
          $scope.user = entry;
          break;
        }
        /* falls through */
      default:
        initUser();
        break;
    }
  }

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
      $state.go($scope.dashState);
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
            
            console.log('response', response);
            
            var user = {
              // from user model
              username: response.username,
              role: response.role._id,
              id: response._id
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

    console.log('createUser', $scope.user);

    userFactory.getUsers().save($scope.user)
      .$promise.then(
        // success function
        function (response) {
          $scope.initUser();
          $state.go($scope.dashState);
        },
        // error function
        function (response) {
          // response is message
          NgDialogFactory.error(response, 'Creation Unsuccessful');
        }
      );
  }

  function updateUser() {

    console.log('updateUser', $scope.user);

    userFactory.getUsers().update({id: $scope.user.id}, $scope.user)
      .$promise.then(
        // success function
        function (response) {
          $scope.initUser();
          $state.go($scope.dashState);
        },
        // error function
        function (response) {
          // response is message
          NgDialogFactory.error(response, 'Update Unsuccessful');
        }
      );
  }

  function viewUser() {
    $state.go($scope.viewState, {id: $scope.user._id});
  }

  function editUser() {
    $state.go($scope.editState, {id: $scope.user._id});
  }

  function confirmDelete() {
    $scope.userSelectList = [];

    angular.forEach($scope.users, function (user) {
      if (user.isSelected) {
        $scope.userSelectList.push(user);
      }
    });

    NgDialogFactory.open({ template: 'users/confirmdelete.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'UserController' });
  }
  
  
}

