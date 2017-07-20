/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .constant('DECOR', (function () {
    return {
      DASH: { icon: 'fa fa-tachometer fa-fw', class: 'btn btn-default' },
      NEW: { icon: 'fa fa-plus-square-o fa-fw', class: 'btn btn-primary' },
      VIEW: { icon: 'fa fa-eye fa-fw', class: 'btn btn-info' },
      EDIT: { icon: 'fa fa-pencil-square-o fa-fw', class: 'btn btn-warning' },
      DEL: { icon: 'fa fa-trash-o fa-fw', class: 'btn btn-danger' },
      BATCH: { icon: 'fa fa-files-o fa-fw', class: 'btn btn-secondary' },
      SEL: { icon: 'fa fa-check-square-o fa-fw', class: 'btn btn-default' },
      UNSEL: { icon: 'fa fa-square-o fa-fw', class: 'btn btn-default' }
    };
  })())

  .factory('controllerUtilFactory', controllerUtilFactory);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

controllerUtilFactory.$inject = ['authFactory', 'miscUtilFactory', 'utilFactory', 'STATES', 'ACCESS', 'DECOR', 'CONFIG'];

function controllerUtilFactory (authFactory, miscUtilFactory, utilFactory, STATES, ACCESS, DECOR, CONFIG) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  var factory = {
    setScopeVars: setScopeVars,
    getStateButton: getStateButton,
    setSelect: setSelect,
    toggleSelection: toggleSelection,
    moveListSelected: moveListSelected
  },

  dashTxt = 'Dash',
  newTxt = 'New',
  viewTxt = 'View',
  editTxt = 'Edit',
  delTxt = 'Delete',
  buttons = [
    { txt: dashTxt, icon: DECOR.DASH.icon, tip: 'Go to dashboard', class: DECOR.DASH.class },
    { txt: newTxt, icon: DECOR.NEW.icon, tip: 'Create new', class: DECOR.NEW.class },
    { txt: viewTxt, icon: DECOR.VIEW.icon, tip: 'View selected', class: DECOR.VIEW.class },
    { txt: editTxt, icon: DECOR.EDIT.icon, tip: 'Edit selected', class: DECOR.EDIT.class },
    { txt: delTxt, icon: DECOR.DEL.icon, tip: 'Delete selected', class: DECOR.DEL.class }
  ],
  StateAccessMap = {
    // map mwnu names to access names
    VOTINGSYS: ACCESS.VOTINGSYS,
    ROLES: ACCESS.ROLES,
    USERS: ACCESS.USERS,
    ELECTION: ACCESS.ELECTIONS,
    CANDIDATE: ACCESS.CANDIDATES,
    CANVASS: ACCESS.CANVASSES
  };

  return factory;

  /* function implementation
    -------------------------- */

  /**
   * Set standard scope variables
   * @param {string} menu  Name of menu, as per STATES properties e.g. 'CANVASS', 'USERS. etc.
   * @param {object} scope Scope to add variables to
   */
  function setScopeVars (menu, scope) {
    var states = STATES.SET_SCOPE_VARS(menu),
      props = Object.getOwnPropertyNames(states),
      access;

    /* group is combination of 'a' (access to all) & '1' (access to one)
      privilege is combination of 'c' (create), 'r' (read), 'u' (update) & 'd' (delete) */
    props.forEach(function (prop) {
      switch (prop) {
        case 'dashState':
          access = { group: 'a', privilege: 'r' };  // need all read for dash
          break;
        case 'newState':
          access = { group: '1', privilege: 'c' };  // need 1 create for new
          break;
        case 'viewState':
          access = { group: '1', privilege: 'r' };  // need 1 read for view
          break;
        case 'editState':
          access = { group: '1', privilege: 'u' };  // need 1 update for edit
          break;
        case 'delState':
          access = { group: 'a1', privilege: 'd' };  // need all/1 delete for delete
          break;
        default:
          access = undefined;
          break;
      }
      if (access) {
        if (!CONFIG.NOAUTH &&
            !authFactory.isAccess(StateAccessMap[menu], access.group, access.privilege)) {
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
      scope.selectedCnt = miscUtilFactory.selectAll(list);
    } else {
      scope.selectedCnt = miscUtilFactory.initSelected(list);
    }
    if (list) {
      allSel = (scope.selectedCnt === list.length);
    }
    return allSel;
  }


  function toggleSelection (scope, entry, list, dlftFunc) {
    var oldCnt = scope.selectedCnt,
      singleSel;

    scope.selectedCnt = miscUtilFactory.toggleSelection(entry, oldCnt);
    switch (scope.selectedCnt) {
      case 1:
        if (entry.isSelected) {
          singleSel = entry;
          break;
        } else if (oldCnt === 2) {
          // deselected an entry
          singleSel = miscUtilFactory.findSelected(list);
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


  /**
   * Move the selected elements of a ResourceList to another ResourceList
   * @param {ResourceList} fromList Source list
   * @param {ResourceList} toList   Destination list
   * @param {function}     testFunc Function to test if itema are the same
   * @returns {boolean}      [[Description]]
   */
  function moveListSelected (fromList, toList, testFunc) {
    var selList;      // selected items

    selList = miscUtilFactory.getSelectedList(fromList, function (element) {
      miscUtilFactory.toggleSelection(element);
      return element;
    });
    fromList.selCount = 0;

    if (selList.length > 0) {
      fromList.removeFromList(selList, testFunc);
      toList.addToList(selList, true, testFunc);
    }

    [fromList, toList].forEach(function (resList) {
      resList.sort();
      resList.applyFilter();
    });
  }

}
