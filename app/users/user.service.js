/*jslint node: true */
/*global angular */
'use strict';

angular.module('ct.clientCommon')

  .service('userService', userService);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

userService.$inject = ['$state', 'userFactory', 'NgDialogFactory', 'controllerUtilFactory', 'miscUtilFactory'];

function userService($state, userFactory, NgDialogFactory, controllerUtilFactory, miscUtilFactory) {

  /*jshint validthis:true */
  this.confirmDeleteUSer = function (scope, deleteList, onSuccess, onFailure) {

    NgDialogFactory.openAndHandle({
        template: 'users/confirmdelete.html',
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

        userFactory.getUsers().delete(delParams)
          .$promise.then(
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


}

