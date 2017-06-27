/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('StateButtonsController', StateButtonsController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

StateButtonsController.$inject = ['$scope', '$state', 'controllerUtilFactory', 'DECOR'];

function StateButtonsController($scope, $state, controllerUtilFactory, DECOR) {

  var allSelected = false,
    buttons;

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.showButton = showButton;
  $scope.disableButton = disableButton;
  $scope.changeState = changeState;

  if ($state.is($scope.dashState)) {
    $scope.btnvert = true;
  } else {
    $scope.btnhorz = true;
  }
  if ($scope.getStateButton) {
    buttons = $scope.getStateButton('all');
  } else {
    buttons = controllerUtilFactory.getStateButton('all', $scope);
  }
  if ($state.is($scope.dashState)) {
    // add select/unselect all in dash state
    buttons = buttons.concat([
      { txt: 'Unselect', state: 'unsel', icon: DECOR.UNSEL.icon, tip: 'Unselect all',
        class: DECOR.UNSEL.class },
      { txt: 'Select', state: 'sel', icon: DECOR.SEL.icon, tip: 'Select all',
        class: DECOR.SEL.class }
    ]);
  }

  $scope.stateButtons = buttons;

  /* function implementation
  -------------------------- */

  function showButton (forState) {
    var show = false,
      array;
    if (forState) {
      if ($state.is($scope.dashState)) {
        array = [ 'unsel', 'sel' ];
      } else {
        array = [];
      }

      if ($state.is($scope.newState)) {
        // no buttons in newState
      } else if ($state.is($scope.viewState)) {
        array = array.concat([
          $scope.dashState,
          $scope.newState,
          $scope.editState,
          $scope.delState
        ]);
      } else if ($state.is($scope.editState)) {
        array = array.concat([
          $scope.dashState,
          $scope.newState,
          $scope.viewState,
          $scope.delState
        ]);
      } else if ($state.is($scope.dashState)) {
        array = array.concat([
          $scope.newState,
          $scope.viewState,
          $scope.editState,
          $scope.delState
        ]);
      }
      if (array.length) {
        show = array.find(function (state) {
          return (state === forState);
        });
        show = (show ? true : false);
      }
    }
    return show;
  }


function disableButton (forState) {
    var disable = false;
    if (forState) {
      if ($state.is($scope.newState)) {
        disable = true; // no buttons
      } else if ($state.is($scope.viewState) ||
              $state.is($scope.editState)) {
        disable = !showButton(forState);  // if its shown enable it
      } else if ($state.is($scope.dashState)) {
        if ((forState === $scope.viewState) ||
              (forState === $scope.editState)) {
          disable = ($scope.selectedCnt !== 1); // only one selected item allowed
        } else if (forState === $scope.delState) {
          disable = ($scope.selectedCnt < 1); // must be at least one selected
        } else if (forState === 'unsel') {
          disable = ($scope.selectedCnt < 1); // must be at least one selected
        } else if (forState === 'sel') {
          disable = allSelected;
        } // else always enable new
      } else {
        disable = true;
      }
    }
    return disable;
  }


  function changeState (toState) {
    var to = toState,
      params;
    if (to) {
      if (to === $scope.newState) {
        // TODO add save changes check
      } else if (to === $scope.viewState) {
        // TODO add save changes check
        params = $scope.changeStateParam();
      } else if (to === $scope.editState) {
        params = $scope.changeStateParam();
      } else if (to === $scope.delState) {
        if ($state.is($scope.dashState)) {
          $scope.dashDelete();
        } else {
          $scope.singleDelete();
        }
        to = undefined;
      } else if ((to === 'unsel') || (to === 'sel')) {
        allSelected = $scope.setSelect((to === 'unsel') ? 0 : 1);
        to = undefined;
      } else if (to !== $scope.dashState) {
        to = undefined;
      }
      if (to) {
        $state.go(to, params);
      }
    }
  }


}

