/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassDashController', CanvassDashController)

  .filter('filterCanvass', ['UTIL', function (UTIL) {
    return function (input, name, op, election) {
      
      if (!op) {
        op = UTIL.OP_OR;
      }
      var out = [];
      if (name || election) {
        // filter by name & election values for
        angular.forEach(input, function (canvass) {
          var nameOk,
            electionOk;

          if (name) {
            nameOk = (canvass.name.toLowerCase().indexOf(name.toLowerCase()) >= 0);
          } else {
            nameOk = false;
          }
          if (election) {
            electionOk = (canvass.election._id === election);
          } else {
            electionOk = false;
          }
          if (((op === UTIL.OP_OR) && (nameOk || electionOk)) ||
              ((op === UTIL.OP_AND) && (nameOk && electionOk))) {
            out.push(canvass);
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

CanvassDashController.$inject = ['$scope', '$rootScope', '$state', 'canvassFactory', 'electionFactory', 'utilFactory', 'NgDialogFactory', 'stateFactory', 'STATES', 'UTIL'];

function CanvassDashController($scope, $rootScope, $state, canvassFactory, electionFactory, utilFactory, NgDialogFactory, stateFactory, STATES, UTIL) {

  $scope.dashState = STATES.CANVASS;
  $scope.newState = STATES.CANVASS_NEW;
  $scope.viewState = STATES.CANVASS_VIEW;
  $scope.editState = STATES.CANVASS_EDIT;

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterOps = UTIL.OP_LIST;
  $scope.initFilter = initFilter;
  $scope.toggleCanvassSel = toggleCanvassSel;
  $scope.viewItem = viewItem;
  $scope.editItem = editItem;
  $scope.deleteItem = deleteItem;
  $scope.dashDelete = dashDelete;
  $scope.confirmDeleteCanvass = confirmDeleteCanvass;
  $scope.gotoDash = gotoDash;
  $scope.stateIs = stateFactory.stateIs;
  $scope.stateIsNot = stateFactory.stateIsNot;
  $scope.stateIncludes = stateFactory.stateIncludes;
  $scope.menuStateIs = stateFactory.menuStateIs;
  $scope.stateIsOneOf = stateFactory.stateIsOneOf;
  $scope.stateIsNotOneOf = stateFactory.stateIsNotOneOf;

  // get list of elections selecting name field, _id field is always provided
  $scope.elections = electionFactory.getElections().query({fields: 'name'})
    .$promise.then(
      // success function
      function (response) {
        // response is actual data
        $scope.elections = response;
      },
      // error function
      function (response) {
        // response is message
        $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
      }
    );
  
  getCanvasses();

  
  
  /* function implementation
  -------------------------- */

  function initFilter() {
    $scope.filterText = undefined;
    $scope.filterElection = undefined;
    $scope.filterOp = undefined;
    $scope.selectedCnt = utilFactory.initSelected($scope.canvasses);
  }
  
  
  function toggleCanvassSel(entry) {
    $scope.selectedCnt = utilFactory.toggleSelection(entry, $scope.selectedCnt);
    switch ($scope.selectedCnt) {
      case 1:
        if (entry.isSelected) {
          $scope.canvass = entry;
          break;
        }
        /* falls through */
      default:
        initCanvass();
        break;
    }
  }

  function getCanvasses() {
    $scope.canvasses = canvassFactory.getCanvasses().query(
      // success function
      function (response) {
        // response is actual data
        $scope.canvasses = response;

        initFilter();
        initCanvass();
      },
      // error function
      function (response) {
        // repose is message
        $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
      }
    );
  }
  

  function setCanvass(canvass) {
    $scope.canvass = canvass;
  }

  function initCanvass() {
    // include only required fields
    setCanvass({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      election: ''
//        _id: ''
    });
  }

  function viewItem () {
    $state.go($scope.viewState, {id: $scope.canvass._id});
  }

  function editItem () {
    $state.go($scope.editState, {id: $scope.canvass._id});
  }

  function deleteItem () {
    confirmDeleteCanvass([$scope.canvass]);
  }
  
  function gotoDash () {
    $state.go($scope.dashState);
  }

  function dashDelete() {
    var selectedList = utilFactory.getSelectedList($scope.canvasses);
    confirmDeleteCanvass(selectedList);
  }


  function confirmDelete (dialogOpts, onClose) {

    var dialog = NgDialogFactory.open(dialogOpts);
    
    dialog.closePromise.then(function (data) {
      if (!NgDialogFactory.isNgDialogCancel(data.value)) {
        // perform delete
        onClose(data);
      }
    });
  }
  
  function confirmDeleteCanvass (deleteList) {

    confirmDelete (
      {template: 'canvasses/confirmdelete_canvass.html', 
        scope: $scope, className: 'ngdialog-theme-default', 
        controller: 'CanvassDashController', data: {list: deleteList}},
      function (data) {
        // perform delete
        var delParams = {};
        angular.forEach(data.value, function (entry) {
          delParams[entry._id] = true;
        });

        canvassFactory.getCanvasses().delete(delParams)
          .$promise.then(
            // success function
            function (response) {
              if ($state.is($scope.dashState)) {
                getCanvasses();
              } else {
                gotoDash();
              }
            },
            // error function
            function (response) {
              NgDialogFactory.error(response, 'Delete Unsuccessful');
            }
          );
      });
  }
  

  
  
  
}

