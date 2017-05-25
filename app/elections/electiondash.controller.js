/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('ElectionDashController', ElectionDashController)

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

ElectionDashController.$inject = ['$scope', '$rootScope', '$state', 'votingsystemFactory', 'electionFactory', 'electionService', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'controllerUtilFactory', 'miscUtilFactory', 'ELECTIONSCHEMA', 'STATES', 'UTIL'];

function ElectionDashController($scope, $rootScope, $state, votingsystemFactory, electionFactory, electionService, NgDialogFactory, stateFactory, utilFactory, controllerUtilFactory, miscUtilFactory, ELECTIONSCHEMA, STATES, UTIL) {

  controllerUtilFactory.setScopeVars('ELECTION', $scope);

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterOps = UTIL.OP_LIST;
  $scope.initFilter = initFilter;
  $scope.toggleSelection = toggleSelection;
  $scope.formatDate = utilFactory.formatDate;

  $scope.changeStateParam = changeStateParam;
  $scope.dashDelete = dashDelete;
  $scope.setSelect = setSelect;
  $scope.getStateButton = getStateButton;

  stateFactory.addInterface($scope);  // add stateFactory menthods to scope

  initFilter();

  // get list of systems selecting name field, _id field is always provided
  $scope.votingSystems = votingsystemFactory.getVotingSystems().query({fields: 'name'})
    .$promise.then(
      // success function
      function (response) {
        // response is actual data
        $scope.votingSystems = response;

        getElections();
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response, 'Unable to retrieve Voting Systems');
        $state.go(STATES.APP);
      }
    );


  /* function implementation
  -------------------------- */

  function initFilter() {
    $scope.filterText = undefined;
    $scope.filterSystem = undefined;
    $scope.filterOp = undefined;
    setSelect(0);
  }

  function toggleSelection (entry) {
    setElection(
      controllerUtilFactory.toggleSelection($scope, entry, $scope.elections, initElection)
    );
  }


  function getElections () {
    $scope.elections = electionFactory.getElections().query(
      // success function
      function (response) {
        // response is actual data
        $scope.elections = response;

        initFilter();
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response, 'Unable to retrieve Elections');
      }
    );
  }

  function changeStateParam () {
    return {
      id: $scope.election._id
    };
  }

  function setElection (election) {
    $scope.election = election;
  }

  function initElection () {
    // include only required fields
    setElection(ELECTIONSCHEMA.SCHEMA.getObject());
  }


  function dashDelete() {
    var selectedList = miscUtilFactory.getSelectedList($scope.elections);
    electionService.confirmDeleteElection($scope, selectedList,
      // success function
      function (/*response*/) {
        getElections();
      });
  }

  function getStateButton (state) {
    return electionService.getStateButton($scope, state);
  }

  function setSelect(sel) {
    return controllerUtilFactory.setSelect($scope, $scope.elections, sel);
  }


}

