/*jslint node: true */
/*global angular */
'use strict';

angular.module('ct.clientCommon')

  .service('noticeService', noticeService);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

noticeService.$inject = ['$state', 'noticeFactory', 'NgDialogFactory', 'controllerUtilFactory'];

function noticeService($state, noticeFactory, NgDialogFactory, controllerUtilFactory) {

  /*jshint validthis:true */
  this.confirmDeleteNotice = function (scope, deleteList, onSuccess, onFailure) {

    NgDialogFactory.openAndHandle({
        template: 'notices/confirmdelete_notice.html',
        scope: scope, className: 'ngdialog-theme-default',
        controller: 'NoticeDeleteController',
        data: { list: deleteList }
      },
      // process function
      function (value) {
        // perform delete
        var delParams = {};
        angular.forEach(value, function (entry) {
          delParams[entry._id] = true;
        });

        noticeFactory.delete('notice', delParams,
          // success function
          onSuccess,
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
      isDash = $state.is(scope.dashState);

    button.forEach(function (element) {
      if (element.state === scope.newState) {
        element.tip = 'Create new notice';
      } else if (element.state === scope.viewState) {
        if (isDash) {
          element.tip = 'View selected notice';
        } else {
          element.tip = 'View this notice';
        }
      } else if (element.state === scope.editState) {
        if (isDash) {
          element.tip = 'Edit selected notice';
        } else {
          element.tip = 'Edit this notice';
        }
      } else if (element.state === scope.delState) {
        if (isDash) {
          element.tip = 'Delete selected notice(s)';
        } else {
          element.tip = 'Delete this notice';
        }
      }
    });

    return button;
  };

}

