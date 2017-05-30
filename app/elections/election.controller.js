/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('ElectionController', ElectionController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

ElectionController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'votingsystemFactory', 'electionFactory', 'electionService', 'NgDialogFactory', 'stateFactory', 'controllerUtilFactory', 'consoleService', 'STATES', 'ELECTIONSCHEMA', 'RESOURCE_CONST', 'DEBUG'];

function ElectionController($scope, $rootScope, $state, $stateParams, votingsystemFactory, electionFactory, electionService, NgDialogFactory, stateFactory, controllerUtilFactory, consoleService, STATES, ELECTIONSCHEMA, RESOURCE_CONST, DEBUG) {

  var con = consoleService.getLogger('ElectionController');

  con.debug('ElectionController id', $stateParams.id);

  controllerUtilFactory.setScopeVars('ELECTION', $scope);

  if (DEBUG.devmode) {
    $scope.debug = DEBUG;
  }

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.getTitle = getTitle;
  $scope.processForm = processForm;

  $scope.changeStateParam = changeStateParam;
  $scope.singleDelete = singleDelete;
  $scope.getStateButton = getStateButton;

  $scope.gotoDash = gotoDash;

  stateFactory.addInterface($scope);  // add stateFactory menthods to scope

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
        NgDialogFactory.error(response, 'Unable to retrieve Voting Systems');
        $state.go(STATES.APP);
      }
    );

  initItem($stateParams.id);
  
  /* function implementation
  -------------------------- */

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


  function processForm() {
    if ($state.is($scope.newState)) {
      createElection();
    } else if ($state.is($scope.viewState)) {
      gotoDash();
    } else if ($state.is($scope.editState)) {
      updateElection();
    }
  }

  function initItem(id) {
    if (!id) {
      $scope.election = ELECTIONSCHEMA.SCHEMA.getObject();
    } else {
      $scope.election = electionFactory.getElections().get({id: id})
        .$promise.then(
          // success function
          function (response) {

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

    con.log('createElection', $scope.election);

    electionFactory.getElections().save($scope.election)
      .$promise.then(
        // success function
        function (/*response*/) {
          initItem();
          gotoDash();
        },
        // error function
        function (response) {
          // response is message
          NgDialogFactory.error(response, 'Creation Unsuccessful');
        }
      );
  }

  function updateElection() {

    con.log('updateElection', $scope.election);

    electionFactory.getElections().update({id: $scope.election._id}, $scope.election)
      .$promise.then(
        // success function
        function (/*response*/) {
          initItem();
          gotoDash();
        },
        // error function
        function (response) {
          // response is message
          NgDialogFactory.error(response, 'Update Unsuccessful');
        }
      );
  }

  function changeStateParam () {
    return {
      id: $scope.election._id
    };
  }

  function singleDelete() {

    // $scope.election.system is set to doc id, change to object for display purposes
    var deleteList = [
      JSON.parse(JSON.stringify($scope.election))
    ];
    deleteList[0].system = $scope.votingSystems.find(function (system) {
      return (system._id === $scope.election.system);
    });

    electionService.confirmDeleteElection($scope, deleteList,
      // success function
      function (/*response*/) {
        gotoDash();
      });
  }

  function getStateButton (state) {
    return electionService.getStateButton($scope, state);
  }

  function gotoDash() {
    $state.go($scope.dashState);
  }

}

