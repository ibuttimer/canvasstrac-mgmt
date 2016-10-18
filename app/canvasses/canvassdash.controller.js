/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassDashController', CanvassDashController)

  .filter('filterCanvass', function () {
    return function (input, name, op, system) {
      
      if (!op) {
        op = 'Or';
      }
      var out = [];
      if (name || system) {
        // filter by name & system values for 
        angular.forEach(input, function (election) {
          var nameOk,
            systemOk;

          if (name) {
            nameOk = (election.name.toLowerCase().indexOf(name.toLowerCase()) >= 0);
          } else {
            nameOk = false;
          }
          if (system) {
            systemOk = (election.system._id === system);
          } else {
            systemOk = false;
          }
          if (((op === 'Or') && (nameOk || systemOk)) ||
              ((op === 'And') && (nameOk && systemOk))) {
            out.push(election);
          }
        });
      } else {
        out = input;
      }
      return out;
    };
  });

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassDashController.$inject = ['$scope', '$rootScope', '$state', 'canvassFactory', 'electionFactory', 'utilFactory', 'NgDialogFactory', 'stateFactory'];

function CanvassDashController($scope, $rootScope, $state, canvassFactory, electionFactory, utilFactory, NgDialogFactory, stateFactory) {

  $scope.dashState = 'app.campaign.canvass';
  $scope.newState = 'app.campaign.newcanvass';
  $scope.viewState = 'app.campaign.viewcanvass';
  $scope.editState = 'app.campaign.editcanvass';
  $scope.filterOps = ['And', 'Or'];

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.initFilter = initFilter;
  $scope.toggleCanvassSel = toggleCanvassSel;
  $scope.viewItem = viewItem;
  $scope.editItem = editItem;
  $scope.deleteItem = deleteItem;
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
    $scope.selCanvassCnt = 0;
    utilFactory.initSelected($scope.canvasses);
  }
  
  
  function toggleCanvassSel(entry) {
    $scope.selCanvassCnt = utilFactory.toggleSelection(entry, $scope.selCanvassCnt);
    switch ($scope.selCanvassCnt) {
      case 1:
        if (entry.isSelected) {
          $scope.canvass = entry;
          break;
        }
        // fall thru to clear
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

