/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('ElectionController', ElectionController)

  .filter('filterDashElection', ['UTIL', function (UTIL) {
    return function (input, name, op, system) {
      
      if (!op) {
        op = UTIL.OP_OR;
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
          if (((op === UTIL.OP_OR) && (nameOk || systemOk)) ||
              ((op === UTIL.OP_AND) && (nameOk && systemOk))) {
            out.push(election);
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

ElectionController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'votingsystemFactory', 'electionFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'STATES', 'UTIL', 'ELECTIONSCHEMA', 'RESOURCE_CONST'];

function ElectionController($scope, $rootScope, $state, $stateParams, votingsystemFactory, electionFactory, NgDialogFactory, stateFactory, utilFactory, STATES, UTIL, ELECTIONSCHEMA, RESOURCE_CONST) {

  console.log('id', $stateParams.id);

  STATES.SET_SCOPE_VARS($scope, 'ELECTION');

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterOps = UTIL.OP_LIST;
  $scope.initFilter = initFilter;
  $scope.toggleSelection = toggleSelection;
  $scope.getTitle = getTitle;
  $scope.formatDate = utilFactory.formatDate;
//  $scope.initItem = initItem;
  $scope.processForm = processForm;
  $scope.viewItem = viewItem;
  $scope.editItem = editItem;
  $scope.deleteItem = deleteItem;
  $scope.dashDelete = dashDelete;
  $scope.confirmDelete = confirmDelete;
  $scope.gotoDash = gotoDash;
  $scope.stateIs = stateFactory.stateIs;
  $scope.stateIsNot = stateFactory.stateIsNot;
  $scope.stateIncludes = stateFactory.stateIncludes;
  $scope.menuStateIs = stateFactory.menuStateIs;
  $scope.stateIsOneOf = stateFactory.stateIsOneOf;
  $scope.stateIsNotOneOf = stateFactory.stateIsNotOneOf;

  
  // get list of systems selecting name field, _id field is always provided
  $scope.votingSystems = votingsystemFactory.getVotingSystems().query({fields: 'name'})
    .$promise.then(
      // success function
      function (response) {
        // response is actual data
        $scope.votingSystems = response;
      },
      // error function
      function (response) {
        // response is message
        $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
      }
    );

  getElections();


  
  
  /* function implementation
  -------------------------- */

  function initFilter() {
    $scope.filterText = undefined;
    $scope.filterSystem = undefined;
    $scope.filterOp = undefined;
    $scope.selectedCnt = utilFactory.initSelected($scope.elections);
  }
  
  function toggleSelection(entry) {
    $scope.selectedCnt = utilFactory.toggleSelection(entry, $scope.selectedCnt);
    switch ($scope.selectedCnt) {
      case 1:
        if (entry.isSelected) {
          $scope.election = entry;
          break;
        }
        /* falls through */
      default:
        initItem();
        break;
    }
  }

  function getTitle() {
    $scope.editDisabled = true;
    var title;
    if ($state.is($scope.newState)) {
      title = 'Create Election';
      $scope.editDisabled = false;
    } else if ($state.is($scope.viewState)) {
      title = 'View Election';
    } else if ($state.is($scope.editState)) {
      title = 'Update Election';
      $scope.editDisabled = false;
    } else {
      title = '';
    }
    return title;
  }

  
  function getElections() {
    $scope.elections = electionFactory.getElections().query(
      // success function
      function (response) {
        // response is actual data
        $scope.elections = response;

        initFilter();
        initItem($stateParams.id);
      },
      // error function
      function (response) {
        // repose is message
        $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
      }
    );
  }
  
  
  function processForm() {
    if ($state.is($scope.newState)) {
      createElection();
    } else if ($state.is($scope.viewState)) {
      $state.go($scope.dashState);
    } else if ($state.is($scope.editState)) {
      updateElection();
    }
  }

  function initItem(id) {
    if (!id) {
      // include only required fields
      $scope.election = ELECTIONSCHEMA.SCHEMA.getObject();
    } else {
      $scope.election = electionFactory.getElections().get({id: id})
        .$promise.then(
          // success function
          function (response) {
            
            console.log('response', response);
            
            $scope.election = electionFactory.readResponse(response, {
                objId: undefined, // no objId means not stored, just returned
                factory: 'electionFactory',
                storage: RESOURCE_CONST.STORE_OBJ,
                subObj: { // storage infor for election
                    objId: undefined, // no objId means not stored, just returned
                    factory: 'votingsystemFactory',
                    schema: ELECTIONSCHEMA.SCHEMA,
                    schemaId: ELECTIONSCHEMA.IDs.SYSTEM,
                    //type: can be retrieved using schema & schemaId
                    //path: can be retrieved using schema & schemaId
                    storage: RESOURCE_CONST.STORE_OBJ,
                  }
              });
          },
          // error function
          function (response) {
            // response is message
            NgDialogFactory.error(response, 'Unable to retrieve Election');
          }
        );
    }
  }


  function createElection() {

    console.log('createElection', $scope.election);

    electionFactory.getElections().save($scope.election)
      .$promise.then(
        // success function
        function (response) {
          initItem();
          $state.go($scope.dashState);
        },
        // error function
        function (response) {
          // response is message
          NgDialogFactory.error(response, 'Creation Unsuccessful');
        }
      );
  }

  function updateElection() {

    console.log('updateElection', $scope.election);

    electionFactory.getElections().update({id: $scope.election._id}, $scope.election)
      .$promise.then(
        // success function
        function (response) {
          initItem();
          $state.go($scope.dashState);
        },
        // error function
        function (response) {
          // response is message
          NgDialogFactory.error(response, 'Update Unsuccessful');
        }
      );
  }

  function viewItem() {
    $state.go($scope.viewState, {id: $scope.election._id});
  }

  function editItem() {
    $state.go($scope.editState, {id: $scope.election._id});
  }

  function deleteItem() {
    confirmDelete([$scope.election]);
  }
  
  function gotoDash() {
    $state.go($scope.dashState);
  }

  function dashDelete() {
    var selectedList = utilFactory.getSelectedList($scope.elections);
    confirmDelete(selectedList);
  }

  function confirmDelete(deleteList) {

    var dialog = NgDialogFactory.open({ template: 'election/confirmdelete.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'ElectionController',
                  data: {list: deleteList}});
    
    dialog.closePromise.then(function (data) {
      if (!NgDialogFactory.isNgDialogCancel(data.value)) {
        // perform delete
        var delParams = {};
        angular.forEach(data.value, function (entry) {
          delParams[entry._id] = true;
        });

        electionFactory.getElections().delete(delParams)
          .$promise.then(
            // success function
            function (response) {
              if ($state.is($scope.dashState)) {
                getElections();
              } else {
                gotoDash();
              }
            },
            // error function
            function (response) {
              // response is message
              NgDialogFactory.error(response, 'Delete Unsuccessful');
            }
          );
      }
    });
  }

}

