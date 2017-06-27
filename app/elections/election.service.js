/*jslint node: true */
/*global angular */
'use strict';

angular.module('ct.clientCommon')

  .service('electionService', electionService);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

electionService.$inject = ['$state', 'electionFactory', 'NgDialogFactory', 'controllerUtilFactory'];

function electionService($state, electionFactory, NgDialogFactory, controllerUtilFactory) {

  /*jshint validthis:true */
  this.confirmDeleteElection = function (scope, deleteList, onSuccess, onFailure) {

    NgDialogFactory.openAndHandle({
        template: 'elections/confirmdelete_election.html',
        scope: scope, className: 'ngdialog-theme-default',
        controller: 'ElectionDeleteController',
        data: { list: deleteList }
      },
      // process function
      function (value) {
        // perform delete
        var delParams = {};
        angular.forEach(value, function (entry) {
          delParams[entry._id] = true;
        });

        electionFactory.delete('election', delParams,
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
        element.tip = 'Create new election';
      } else if (element.state === scope.viewState) {
        if (isDash) {
          element.tip = 'View selected election';
        } else {
          element.tip = 'View this election';
        }
      } else if (element.state === scope.editState) {
        if (isDash) {
          element.tip = 'Edit selected election';
        } else {
          element.tip = 'Edit this election';
        }
      } else if (element.state === scope.delState) {
        if (isDash) {
          element.tip = 'Delete selected election(s)';
        } else {
          element.tip = 'Delete this election';
        }
      }
    });

    return button;
  };

}

