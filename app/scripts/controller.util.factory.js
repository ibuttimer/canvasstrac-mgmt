/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .factory('controllerUtilFactory', controllerUtilFactory);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

controllerUtilFactory.$inject = ['authFactory', 'miscUtilFactory', 'utilFactory', 'STATES', 'ACCESS'];

function controllerUtilFactory (authFactory, miscUtilFactory, utilFactory, STATES, ACCESS) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  var factory = {
    setScopeVars: setScopeVars,
    getStateButton: getStateButton,
    setSelect: setSelect,
    toggleSelection: toggleSelection
  },

  dashTxt = 'Dash',
  newTxt = 'New',
  viewTxt = 'View',
  editTxt = 'Edit',
  delTxt = 'Delete',
  buttons = [
    { txt: dashTxt, icon: 'fa-tachometer', tip: 'Go to dashboard', class: 'btn-default' },
    { txt: newTxt, icon: 'fa-plus-square-o', tip: 'Create new', class: 'btn-primary' },
    { txt: viewTxt, icon: 'fa-eye', tip: 'View selected', class: 'btn-info' },
    { txt: editTxt, icon: 'fa-pencil-square-o', tip: 'Edit selected', class: 'btn-warning' },
    { txt: delTxt, icon: 'fa-trash-o', tip: 'Delete selected', class: 'btn-danger' }
  ];

  return factory;

  /* function implementation
    -------------------------- */

  function setScopeVars (menu, scope) {
    var states = STATES.SET_SCOPE_VARS(menu),
      props = Object.getOwnPropertyNames(states),
      access;

    props.forEach(function (prop) {
      switch (prop) {
        case 'dashState':
          access = { group: 'a', privilege: 'r' };
          break;
        case 'newState':
          access = { group: '1', privilege: 'c' };
          break;
        case 'viewState':
          access = { group: '1', privilege: 'r' };
          break;
        case 'editState':
          access = { group: '1', privilege: 'u' };
          break;
        case 'delState':
          access = { group: 'a1', privilege: 'd' };
          break;
        default:
          access = undefined;
          break;
      }
      if (access) {
        if (!authFactory.isAccess(ACCESS.CANVASSES, access.group, access.privilege)) {
          // no access so remove state
          states[prop] = undefined;
        }
      }
    });
    props.forEach(function (prop) {
      scope[prop] = states[prop];
    });
  }

  function getStateButton(state, scope) {
    var button,
      txt;
    if (state === 'all') {
      button = angular.copy(buttons);
    } else {
      if (state === scope.dashState) {
        txt = dashTxt;
      } else if (state === scope.newState) {
        txt = newTxt;
      } else if (state === scope.viewState) {
        txt = viewTxt;
      } else if (state === scope.editState) {
        txt = editTxt;
      } else if (state === scope.newState) {
        txt = delTxt;
      }
      if (txt) {
        button = angular.copy(buttons.find(function (element) {
          return (element.txt === txt);
        }));
      }
    }

    // add state to button(s)
    if (button) {
      miscUtilFactory.toArray(button).forEach(function (element) {
        var btnState;
        switch (element.txt) {
          case dashTxt:
            btnState = scope.dashState;
            break;
          case newTxt:
            btnState = scope.newState;
            break;
          case viewTxt:
            btnState = scope.viewState;
            break;
          case editTxt:
            btnState = scope.editState;
            break;
          case delTxt:
            btnState = scope.delState;
            break;
        }
        element.state = btnState;
      });
    }

    return button;
  }

  /**
   * Select/unselect all items in an array
   * @param   {object}  scope Scope to set selected count in
   * @param   {Array}   list  Array of items
   * @param   {number}  sel   Flag; truthy = set, falsy = unset
   * @returns {boolean} true if all set
   */
  function setSelect (scope, list, sel) {
    var allSel = false;
    if (sel) {
      scope.selectedCnt = utilFactory.selectAll(list);
    } else {
      scope.selectedCnt = utilFactory.initSelected(list);
    }
    if (list) {
      allSel = (scope.selectedCnt === list.length);
    }
    return allSel;
  }


  function toggleSelection (scope, entry, list, dlftFunc) {
    var oldCnt = scope.selectedCnt,
      singleSel;

    scope.selectedCnt = utilFactory.toggleSelection(entry, oldCnt);
    switch (scope.selectedCnt) {
      case 1:
        if (entry.isSelected) {
          singleSel = entry;
          break;
        } else if (oldCnt === 2) {
          // deselected an entry
          var selectedList = utilFactory.getSelectedList(list);
          singleSel = selectedList[selectedList.length - 1];
          break;
        }
        /* falls through */
      default:
        if (dlftFunc) {
          dlftFunc();
        }
        break;
    }

    return singleSel;
  }


}
