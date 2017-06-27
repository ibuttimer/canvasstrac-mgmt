/*jslint node: true */
/*global angular */
'use strict';

angular.module('ct.clientCommon')

  .service('canvassService', canvassService);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

canvassService.$inject = ['$state', 'canvassFactory', 'NgDialogFactory', 'controllerUtilFactory', 'userFactory', 'miscUtilFactory', 'USERSCHEMA', 'SCHEMA_CONST'];

function canvassService($state, canvassFactory, NgDialogFactory, controllerUtilFactory, userFactory, miscUtilFactory, USERSCHEMA, SCHEMA_CONST) {

  var roleDialog =
      USERSCHEMA.SCHEMA.getField(USERSCHEMA.USER_ROLE_IDX, SCHEMA_CONST.DIALOG_PROP);

  /*jshint validthis:true */
  this.confirmDeleteCanvass = function (scope, deleteList, onSuccess, onFailure) {

    NgDialogFactory.openAndHandle({
        template: 'canvasses/confirmdelete_canvass.html',
        scope: scope, className: 'ngdialog-theme-default',
        controller: 'CanvassDeleteController',
        data: { list: deleteList }
      },
      // process function
      function (value) {
        // perform delete
        var delParams = {};
        angular.forEach(value, function (entry) {
          delParams[entry._id] = true;
        });

        canvassFactory.delete('canvass', delParams,
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
        element.tip = 'Create new canvass';
      } else if (element.state === scope.viewState) {
        if (isDash) {
          element.tip = 'View selected canvass';
        } else {
          element.tip = 'View this canvass';
        }
      } else if (element.state === scope.editState) {
        if (isDash) {
          element.tip = 'Edit selected canvass';
        } else {
          element.tip = 'Edit this canvass';
        }
      } else if (element.state === scope.delState) {
        if (isDash) {
          element.tip = 'Delete selected canvass(es)';
        } else {
          element.tip = 'Delete this canvass';
        }
      }
    });

    return button;
  };


  this.newCanvasserFilter = function (base, canvasser) {
    var opts = {
        hiddenFilters: [roleDialog] // hide role from filter description
      },
      filter;

    // display role name rather than id
//    if (canvasser) {
//      opts = {
//        dispTransform: function (dialog, filterVal) {
//          var str = filterVal;
//          if (dialog === roleDialog) {
//            str = canvasser.name;
//          }
//          return str;
//        }
//      };
//    }

    filter = userFactory.newFilter(base, opts);

    // add canvasser restriction to filter
    if (canvasser) {
      filter.addFilterValue(roleDialog, canvasser._id);
    }

    return filter;
  };



}

