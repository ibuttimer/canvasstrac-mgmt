/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassDashController', CanvassDashController)

  .filter('filterDashCanvass', ['UTIL', function (UTIL) {
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

CanvassDashController.$inject = ['$scope', '$rootScope', '$state', 'canvassFactory', 'canvassService', 'electionFactory', 'NgDialogFactory', 'stateFactory', 'miscUtilFactory', 'controllerUtilFactory', 'CANVASSSCHEMA', 'STATES', 'UTIL'];

function CanvassDashController($scope, $rootScope, $state, canvassFactory, canvassService, electionFactory, NgDialogFactory, stateFactory, miscUtilFactory, controllerUtilFactory, CANVASSSCHEMA, STATES, UTIL) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterOps = UTIL.OP_LIST;
  $scope.initFilter = initFilter;
  $scope.toggleCanvassSel = toggleCanvassSel;

  $scope.changeStateParam = changeStateParam;
  $scope.dashDelete = dashDelete;
  $scope.setSelect = setSelect;
  $scope.getStateButton = getStateButton;

  stateFactory.addInterface($scope);  // add stateFactory menthods to scope

  controllerUtilFactory.setScopeVars('CANVASS', $scope);

  initFilter();

  // get list of elections selecting name field, _id field is always provided
  $scope.elections = electionFactory.getElections().query({fields: 'name'})
    .$promise.then(
      // success function
      function (response) {
        // response is actual data
        $scope.elections = response;

        getCanvasses();
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response, 'Unable to retrieve Elections');
        $state.go(STATES.APP);
      }
    );

  
  
  /* function implementation
  -------------------------- */

  function initFilter() {
    $scope.filterText = undefined;
    $scope.filterElection = undefined;
    $scope.filterOp = undefined;
    setSelect(0);
  }
  
  
  function toggleCanvassSel (entry) {
    setCanvass(
      controllerUtilFactory.toggleSelection($scope, entry, $scope.canvasses, initCanvass)
    );
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
        // response is message
        NgDialogFactory.error(response, 'Unable to retrieve Canvasses');
      }
    );
  }
  

  function setCanvass(canvass) {
    $scope.canvass = canvass;
  }

  function initCanvass() {
    // include only required fields
    setCanvass(CANVASSSCHEMA.SCHEMA.getObject());
  }

  function changeStateParam () {
    return {
      id: $scope.canvass._id
    };
  }
  
  function dashDelete () {
    var selectedList = miscUtilFactory.getSelectedList($scope.canvasses);
    canvassService.confirmDeleteCanvass($scope, selectedList,
      // on success
      function (/*response*/) {
        getCanvasses();
      });
  }

  function setSelect (sel) {
    return controllerUtilFactory.setSelect($scope, $scope.canvasses, sel);
  }

  function getStateButton (state) {
    return canvassService.getStateButton($scope, state);
  }


}

