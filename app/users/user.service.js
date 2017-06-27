/*jslint node: true */
/*global angular */
'use strict';

angular.module('ct.clientCommon')

  .service('userService', userService);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

userService.$inject = ['$state', 'userFactory', 'NgDialogFactory', 'controllerUtilFactory', 'miscUtilFactory', 'SCHEMA_CONST', 'PEOPLESCHEMA', 'ADDRSCHEMA', 'DEBUG'];

function userService($state, userFactory, NgDialogFactory, controllerUtilFactory, miscUtilFactory, SCHEMA_CONST, PEOPLESCHEMA, ADDRSCHEMA, DEBUG) {

  /*jshint validthis:true */
  this.confirmDeleteUSer = function (scope, deleteList, onSuccess, onFailure) {

    NgDialogFactory.openAndHandle({
        template: 'users/confirmdelete_user.html',
        scope: scope, className: 'ngdialog-theme-default',
        controller: 'UserDeleteController',
        data: { list: deleteList }
      },
      // process function
      function (value) {
        // perform delete
        var delParams = {};
        angular.forEach(value, function (entry) {
          delParams[entry._id] = true;
        });

        userFactory.delete('user', delParams,
          // success function
          function (response) {
            if (onSuccess) {
              onSuccess(response);
            }
          },
          // error function
          function (response) {
            if (onFailure) {
              onFailure(response);
            } else {
              NgDialogFactory.error(response, 'Delete Unsuccessful');
            }
          }
        );
      });
  };

  /*jshint validthis:true */
  this.getStateButton = function (scope, state) {
    var button = controllerUtilFactory.getStateButton(state, scope),
      buttons = miscUtilFactory.toArray(button),
      isDash = $state.is(scope.dashState);

    buttons.forEach(function (element) {
      if (element.state === scope.newState) {
        element.tip = 'Create new user';
      } else if (element.state === scope.viewState) {
        if (isDash) {
          element.tip = 'View selected user';
        } else {
          element.tip = 'View this user';
        }
      } else if (element.state === scope.editState) {
        if (isDash) {
          element.tip = 'Edit selected user';
        } else {
          element.tip = 'Edit this user';
        }
      } else if (element.state === scope.delState) {
        if (isDash) {
          element.tip = 'Delete selected user(s)';
        } else {
          element.tip = 'Delete this user';
        }
      }
    });

    // TODO remove hack, user delete not currently supported
    var idx = buttons.findIndex(function (element) {
      return (element.state === scope.delState);
    });
    if (idx >= 0) {
      buttons.splice(idx, 1);
      if (buttons.length === 0) {
        button = undefined;
      }
    }


    if (Array.isArray(button)) {
      return buttons;
    } else {
      return button;
    }
  };

  this.getUserDetails = function (id, flat, onSuccess, onFailure) {
    if (typeof flat === 'function') {
      onFailure = onSuccess;
      onSuccess = flat;
      flat = false;
    }

    userFactory.get('user', {id: id},
      // success function
      function (response) {

        var user = {
          // from user model
          username: response.username,
          role: response.role._id,
          _id: response._id
        };

        if (flat) {
          // flatten object
          PEOPLESCHEMA.SCHEMA.forModelProps([
              PEOPLESCHEMA.IDs.FNAME,
              PEOPLESCHEMA.IDs.LNAME,
              PEOPLESCHEMA.IDs.NOTE
            ], function (field) {
              var model = field[SCHEMA_CONST.MODELNAME_PROP];
              if (model) {
                user[model] = response.person[model];
              }
          });
          ADDRSCHEMA.SCHEMA.forModelProps([
              ADDRSCHEMA.IDs.ADDR1,
              ADDRSCHEMA.IDs.ADDR2,
              ADDRSCHEMA.IDs.ADDR3,
              ADDRSCHEMA.IDs.TOWN,
              ADDRSCHEMA.IDs.CITY,
              ADDRSCHEMA.IDs.COUNTY,
              ADDRSCHEMA.IDs.COUNTRY,
              ADDRSCHEMA.IDs.PCODE,
              ADDRSCHEMA.IDs.GPS
            ], function (field) {
              var model = field[SCHEMA_CONST.MODELNAME_PROP];
              if (model) {
                user[model] = response.person.address[model];
              }
          });

          // TODO contactDetails schema & factory

          if (response.person.contactDetails) {
            miscUtilFactory.copyProperties(response.person.contactDetails, user, [
              // from contactDetails model
              'phone', 'mobile', 'email', 'website', 'facebook', 'twitter'
              ]);
          }
        } else {
          user.person = response.person;
        }

        if (DEBUG.devmode) {
          user.person_id = miscUtilFactory.readSafe(response, ['person','_id']);
          user.address_id = miscUtilFactory.readSafe(response, ['person','address','_id']);
          user.contact_id = miscUtilFactory.readSafe(response, ['person','contactDetails','_id']);
        }

        if (onSuccess) {
          onSuccess(response, user);
        }
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response, 'Unable to retrieve User');

        if (onFailure) {
          onFailure(response);
        }
      }
    );
  };


}

