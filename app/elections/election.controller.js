/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .controller('ElectionController', ElectionController)

  .filter('filterElection', function () {
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

ElectionController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'votingsystemFactory', 'electionFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory'];

function ElectionController($scope, $rootScope, $state, $stateParams, votingsystemFactory, electionFactory, NgDialogFactory, stateFactory, utilFactory) {

  console.log('id', $stateParams.id);
  
  $scope.dashState = 'app.campaign.elections';
  $scope.newState = 'app.campaign.newelection';
  $scope.viewState = 'app.campaign.viewelection';
  $scope.editState = 'app.campaign.editelection';
  $scope.filterOps = ['And', 'Or'];

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
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
    $scope.selectedCnt = 0;
    
    angular.forEach($scope.elections, function (entry) {
      if (entry.isSelected) {
        delete entry.isSelected;
      }
    });
  }
  
  function toggleSelection(entry) {
    if (!entry.isSelected) {
      entry.isSelected = true;
      $scope.selectedCnt += 1;
    } else {
      entry.isSelected = false;
      $scope.selectedCnt -= 1;
    }
    switch ($scope.selectedCnt) {
      case 1:
        if (entry.isSelected) {
          $scope.election = entry;
          break;
        }
        // fall thru to clear
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
      $scope.election = {
        name: '',
        description: '',
        seats: '',
        system: '',
        electionDate: '',
        _id: ''
      };
    } else {
      $scope.election = electionFactory.getElections().get({id: id})
        .$promise.then(
          // success function
          function (response) {
            
            console.log('response', response);
            
            var election = {
              // from election model
              name: response.name,
              description: response.description,
              seats: response.seats,
              system: response.system._id,
              electionDate: new Date(response.electionDate),
              _id: response._id
            };
            $scope.election = election;
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
    var selectedList = [];

    angular.forEach($scope.elections, function (entry) {
      if (entry.isSelected) {
        selectedList.push(entry);
      }
    });
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

