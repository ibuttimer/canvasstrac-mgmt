/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .constant('CANVASSASSIGN', (function () {
    return {
      ASSIGNMENTCHOICES: [{text: 'Yes', val: 'y'},
                            {text: 'No', val: 'n'},
                            {text: 'All', val: 'a'}
                         ]
    };
  })())

  .controller('CanvassAssignmentController', CanvassAssignmentController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignmentController.$inject = ['$scope', '$rootScope', '$state', '$filter', 'canvassFactory', 'canvassAssignmentFactory', 'electionFactory', 'surveyFactory', 'addressFactory', 'NgDialogFactory', 'stateFactory', 'pagerFactory', 'storeFactory', 'miscUtilFactory', 'undoFactory', 'RES', 'ADDRSCHEMA', 'roleFactory', 'ROLES', 'userFactory', 'CANVASSASSIGN'];

function CanvassAssignmentController($scope, $rootScope, $state, $filter, canvassFactory, canvassAssignmentFactory, electionFactory, surveyFactory, addressFactory, NgDialogFactory, stateFactory, pagerFactory, storeFactory, miscUtilFactory, undoFactory, RES, ADDRSCHEMA, roleFactory, ROLES, userFactory, CANVASSASSIGN) {

  var factories = {},
    customFilters = {},
    addressAssignmentTests = makeAddressAssignmentTests(),
    canvasserAssignmentTests = makeCanvasserAssignmentTests(),
    undoStack = storeFactory.newObj(RES.ALLOCATION_UNDOS,
                                   undoFactory.newUndoStack, storeFactory.CREATE_INIT);

  pagerFactory.addPerPageOptions($scope, 5, 5, 4, 1); // 4 opts, from 5 inc 5, dflt 10

  setupGroup(RES.ALLOCATED_ADDR, addressFactory, 'Addresses',
             CANVASSASSIGN.ASSIGNMENTCHOICES, 'Assigned', false, addrFilterFunction);
  setupGroup(RES.ALLOCATED_CANVASSER, userFactory, 'Canvassers',
             CANVASSASSIGN.ASSIGNMENTCHOICES, 'Has Allocation', true, cnvsrFilterFunction);

  $scope.undoStack = undoStack;

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterList = filterList;
  $scope.updateList = updateList;
  $scope.sortList = sortList;
  $scope.undo = undo;

  // get canvasser role id
  $scope.requestCanvasserRole();

  
  /* function implementation
  -------------------------- */

  function setupGroup(id, factory, label, assignmentChoices, assignmentLabel, nameFields, customFilter) {

    factories[id] = factory;
    customFilters[factory.NAME] = customFilter;
    
    $scope[id] = factory.getList(id, storeFactory.CREATE_INIT);
    $scope[id].title = label;
    $scope[id].assignmentChoices = assignmentChoices;
    $scope[id].assignmentLabel = assignmentLabel;
    $scope[id].nameFields = nameFields;

    var filter = RES.getFilterName(id);
    $scope[filter] = storeFactory.newObj(filter, function () {
        return newFilter(factory);
      }, storeFactory.CREATE_INIT);

    var pager = RES.getPagerName(id);
    $scope[pager] = pagerFactory.newPager(pager, [], 1, $scope.perPage, 5);

    setFilter(id, $scope[filter]);
    factory.setPager(id, $scope[pager]);
  }

  function filterFunction (list, tests, filter) {
    var incTest,
      dfltFilter = angular.copy(filter);  // filter for use by default filter function
    if (filter && filter.assignment) {
      // remove assignment from default filter otherwise there'll be no moatches
      delete dfltFilter.assignment;

      incTest = tests[filter.assignment];
    }

    // list specific filter function
    var filterList = list.factory.getFilteredList(list, dfltFilter, incTest);
    list.filterList = filterList;
  }

  function addrHasAssignmentTest (addr) {
    // if canvasser set then has assignment
    return (addr.canvasser);
  }

  function addrHasNoAssignmentTest (addr) {
    return !addrHasAssignmentTest(addr);
  }

  function makeAddressAssignmentTests () {
    var choiceObj = {};
    CANVASSASSIGN.ASSIGNMENTCHOICES.forEach(function (choice) {
      switch (choice.val) {
        case 'y': // yes test
          choiceObj[choice.val] = addrHasAssignmentTest;
          break;
        case 'n': // no test
          choiceObj[choice.val] = addrHasNoAssignmentTest;
          break;
      }
    });
    return choiceObj;
  }

  function addrFilterFunction (list, filter) {
    // address specific filter function
    filterFunction(list, addressAssignmentTests, filter);
  }

  function canvasserHasAssignmentTest (canvasser) {
    // if addresses set then has assignment
    return (canvasser.addresses && canvasser.addresses.length);
  }

  function canvasserHasNoAssignmentTest (canvasser) {
    return !canvasserHasAssignmentTest(canvasser);
  }

  function makeCanvasserAssignmentTests () {
    var choiceObj = {};
    CANVASSASSIGN.ASSIGNMENTCHOICES.forEach(function (choice) {
      switch (choice.val) {
        case 'y': // yes test
          choiceObj[choice.val] = canvasserHasAssignmentTest;
          break;
        case 'n': // no test
          choiceObj[choice.val] = canvasserHasNoAssignmentTest;
          break;
      }
    });
    return choiceObj;
  }

  function cnvsrFilterFunction (list, filter) {
    // canvasser specific filter function
    filterFunction(list, canvasserAssignmentTests, filter);
  }

  /**
   * Create a new filter
   * @param   {object} factory Factory to create filter
   * @param   {object} data    Base object to create filter from
   * @returns {object} Filter
   */
  function newFilter (factory, data) {
    // new filter with custom function & no blanks
    var filter = factory.newFilter(data, customFilters[factory.NAME], { allowBlank: false });
    // add assignment specific fields
    if (data && data.assignment) {
      filter.addFilterValue('assignment', data.assignment);
    }
    return filter;
  }

            
  
  
  
  function setFilter (id , filter) {
    var factory = factories[id],
      // allocatedAddrFilterStr or allocatedCanvasserFilterStr
      filterStr = RES.getFilterStrName(id),
      filterStrPrefix,
      assignment;
    if (!filter) {
      filter = newFilter(factory);
    }
    assignment = filter.getFilterValue('assignment');
    if (assignment) {
      // set filter string prefix to assignment text
      var list = factory.getList(id);
      if (list) {
        list.assignmentChoices.forEach(function (choice) {
          if (choice.val === assignment) {
            filterStrPrefix = list.assignmentLabel + ': '+ choice.text;
          }
        });
      }
    }
    
    $scope[filterStr] = filter.toString(filterStrPrefix);

    // add canvasser restriction to filter
    if ((id === RES.ALLOCATED_CANVASSER) && $scope.canvasser) {
      filter.role = $scope.canvasser._id;
    }

    return factory.setFilter(id, filter);
  }

  function sortList (resList) {
    return resList.sort();
  }

  function filterList (resList, btn) {

    var action = btn.cmd;
    
    if (action === 'c') {       // clear filter
      setFilter(resList.id);
      resList.applyFilter();
    } else if (action === 'a') {  // no filter, get all
      var list = setFilter(resList.id);
      if (list) {
        resList.factory.getFilteredResource(resList.resource, resList, list.filter);
      }
    } else {  // set filter
      var filter = angular.copy(resList.filter.getFilterValue());

      var dialog = NgDialogFactory.open({ template: 'canvasses/assignmentfilter.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'AssignmentFilterController', 
                    data: {action: resList.id, 
                           ctrl: { title: resList.title,
                                  assignmentChoices: resList.assignmentChoices,
                                  assignmentLabel: resList.assignmentLabel,
                                  nameFields: resList.nameFields},
                           filter: filter}});

      dialog.closePromise.then(function (data) {
        if (!NgDialogFactory.isNgDialogCancel(data.value)) {

          var factory = factories[data.value.action],
            filter = newFilter(factory, data.value.filter);

          var resList = setFilter(data.value.action, filter);
          if (resList) {
            resList.applyFilter();
          }
        }
      });
    }
  }


  function updateList (action) {
    var addrList = miscUtilFactory.getSelectedList($scope.allocatedAddr),
      cnvsList = miscUtilFactory.getSelectedList($scope.allocatedCanvasser),
      aidx, cidx,
      canvasser, addr,
      clrSel;

    if (action.indexOf('alloc') >= 0) {
      clrSel = true;
      undoStack.startMultiStep();

      if (action === 'alloc') {
        for (aidx = 0; aidx < addrList.length; ++aidx) {
          addr = addrList[aidx];

          for (cidx = 0; cidx < cnvsList.length; ++cidx) {
            canvasser = cnvsList[cidx];

            if (canvasser._id !== addr.canvasser) {
              undoStack.addStep(
                unlinkAddress(addr)  // unlink addr from previous
              );

              undoStack.addStep(
                canvassAssignmentFactory.linkCanvasserToAddr(canvasser, addr, true)
              );
            }
          }
        }
      } else if (action === 'unalloc') {
        // unallocate all addresses allocated to selected canvassers
        cnvsList.forEach(function (unallocCnvsr) {
          undoStack.addStep(
            canvassAssignmentFactory.unlinkAddrListFromCanvasser(unallocCnvsr, $scope.allocatedAddr.slice(), true)
          );
        });
        // unallocate all selected addresses
        addrList.forEach(function (unallocAddr) {
          undoStack.addStep(
            unlinkAddress(unallocAddr)  // unlink addr from previous
          );
        });
      }

      undoStack.endMultiStep();
    } else if (action === 'show') {
      // TODO show allocations
    }


    if (clrSel) {
      $scope.setItemSel($scope.allocatedAddr, miscUtilFactory.CLR_SEL);
      $scope.setItemSel($scope.allocatedCanvasser, miscUtilFactory.CLR_SEL);
    }
  }

  function unlinkAddress (addr) {
    var undo;
    if (addr.canvasser) {
      var canvasser = $scope.allocatedCanvasser.findInList(function (element) {
          return (element._id === addr.canvasser);
        });
      if (canvasser) {
        undo = canvassAssignmentFactory.unlinkAddrFromCanvasser(canvasser, addr, true);
      }
    }
    return undo;
  }


  function undo () {
    undoStack.undo(1);
  }
}

