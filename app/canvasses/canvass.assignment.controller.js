/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .constant('CANVASSASSIGN', (function () {
    return {
      ASSIGNMENTCHOICES: [{text: 'Yes', val: 'y'},
                            {text: 'No', val: 'n'},
                            {text: 'All', val: 'a'}
                         ],
      ASSIGNMENT_YES_IDX: 0,
      ASSIGNMENT_NO_IDX: 1,
      ASSIGNMENT_ALL_IDX: 2
    };
  })())

  .controller('CanvassAssignmentController', CanvassAssignmentController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAssignmentController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'canvassFactory', 'electionFactory', 'surveyFactory', 'addressFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'pagerFactory', 'storeFactory', 'RES', 'ADDRSCHEMA', 'roleFactory', 'ROLES', 'userFactory', 'CANVASSASSIGN', 'UTIL'];

function CanvassAssignmentController($scope, $rootScope, $state, $stateParams, $filter, canvassFactory, electionFactory, surveyFactory, addressFactory, NgDialogFactory, stateFactory, utilFactory, pagerFactory, storeFactory, RES, ADDRSCHEMA, roleFactory, ROLES, userFactory, CANVASSASSIGN, UTIL) {

  console.log('CanvassAssignmentController id', $stateParams.id);

  var MAX_DISP_PAGE = 5;

  $scope.perPageOpt = [5, 10, 15, 20];
  $scope.perPage = 10;

  setupGroup(RES.ALLOCATED_ADDR, 'Addresses', CANVASSASSIGN.ASSIGNMENTCHOICES, 'Assigned', false);
  setupGroup(RES.ALLOCATED_CANVASSER, 'Canvassers', CANVASSASSIGN.ASSIGNMENTCHOICES, 'Has Allocation', true);

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterList = filterList;
  $scope.updateList = updateList;
  $scope.sortList = sortList;

  // get canvasser role id
  $scope.requestCanvasserRole();

  
  /* function implementation
  -------------------------- */
  
  function getFactory(id) {
    var factory;
    if (id === RES.ALLOCATED_ADDR) {
      factory = addressFactory;
    } else {
      factory = userFactory;
    }
    return factory;
  }

  function setupGroup(id, label, assignmentChoices, assignmentLabel,  nameFields) {
    var factory = getFactory(id);
    
    $scope[id] = factory.newList(id, {
      titile: label,
      flags: storeFactory.CREATE_INIT
    });
    $scope[id].sortOptions = factory.getSortOptions();
    $scope[id].sortBy = $scope[id].sortOptions[0];
    $scope[id].assignmentChoices = assignmentChoices;
    $scope[id].assignmentLabel = assignmentLabel;
    $scope[id].factory = factory;
    $scope[id].nameFields = nameFields;

    var filter = RES.getFilterName(id);
    $scope[filter] = storeFactory.newObj(filter, function () {
        return newFilter(factory);
      }, storeFactory.CREATE_INIT);

    var pager = RES.getPagerName(id);
    $scope[pager] = pagerFactory.newPager(pager, [], 1, $scope.perPage, MAX_DISP_PAGE);

    setFilter(id, $scope[filter]);
    factory.setPager(id, $scope[pager]);
  }

  function getAssignmentChoiceIndex (value) {
    var idx = -1;
    for (var i = CANVASSASSIGN.ASSIGNMENT_YES_IDX; i <= CANVASSASSIGN.ASSIGNMENT_ALL_IDX; ++i) {
      if (value === CANVASSASSIGN.ASSIGNMENTCHOICES[i].val) {
        idx = i;
        break;
      }
    }
    return idx;
  }
  
  function filterFunction (list, tests, filter) {
    var incTest,
      dfltFilter = angular.copy(filter);  // filter for use by default filter function
    if (filter && filter.assignment) {
      // remove assignment from default filter otherwise there'll be no moatches
      delete dfltFilter.assignment;
      
      var idx = getAssignmentChoiceIndex(filter.assignment);
      if ((idx >= 0) && (idx < tests.length)) {
        incTest = tests[idx];
      }
    }

    // list specific filter function
    var filterList = list.factory.getFilteredList(list, dfltFilter);

    // apply allocated criteria
    if (incTest) {
      var outList = [];
      filterList.forEach(function (element) {
        if (incTest(element)) {
          outList.push(element);
        }
      });
      filterList = outList;
    }
    list.filterList = filterList;
  }

  function addrFilterFunction (list, filter) {
    // address specific filter function
    filterFunction(list, [
        function (element) {  // yes test
          return (element.canvasser);
        }, 
        function (element) {  // no test
          return (!element.canvasser);
        }
      ], filter);
  }

  function cnvsrFilterFunction (list, filter) {
    // canvasser specific filter function
    filterFunction(list, [
        function (element) {  // yes test
          return (element.addresses && element.addresses.length);
        }, 
        function (element) {  // no test
          return (!element.addresses || !element.addresses.length);
        }
      ], filter);
  }

  function newFilter(factory, data) {
    var filter = factory.newFilter(data);
    // add assignment specific fields
    if (data && data.assignment) {
      filter.filterBy.assignment = data.assignment;
    }
    // override default customFunction with enhanced version
    if (factory.ID_TAG === ADDRSCHEMA.ID_TAG) {
      filter.customFunction = addrFilterFunction;
    } else {
      filter.customFunction = cnvsrFilterFunction;
    }
    return filter;
  }

            
  
  
  
  function setFilter (id , filter) {
    var factory = getFactory(id),
      // allocatedAddrFilterStr or allocatedCanvasserFilterStr
      filterStr = RES.getFilterStrName(id),
      filterStrPrefix;
    if (!filter) {
      filter = newFilter(factory);
    }
    if (filter.filterBy.assignment) {
      // set filter string prefix to assignment text
      var idx = getAssignmentChoiceIndex(filter.filterBy.assignment);
      if ((idx >= 0) && (idx < CANVASSASSIGN.ASSIGNMENTCHOICES.length)) {
        var list = factory.getList(id);
        if (list) {
          filterStrPrefix = list.assignmentLabel + ': '+           CANVASSASSIGN.ASSIGNMENTCHOICES[idx].text;
        }
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
    var sortList;
    if (resList) {
//      if (!which) {
//        which = CONST.ADDRESSES;
//      }
//      switch (which) {
//        case CONST.ADDRESSES:
          sortList = resList.list;
//          break;
//        case CONST.FILTER:
//          sortList = resList.filterList;
//          break;
//        default:
//          return; // return undefined, i.e. error
//      }
      var sortFxn = resList.factory.getSortFunction(resList.sortOptions, resList.sortBy.value);
      if (sortFxn) {
        sortList.sort(sortFxn);
        if (resList.factory.isDescendingSortOrder(resList.sortBy.value)) {
          sortList.reverse();
        }

        if (resList.pager) {
          pagerFactory.updatePager(resList.pager.id, sortList);
        }
      }
    }
    return sortList;
  }
  
  function filterList (resList, action) {
    
    if (action === 'c') {       // clear filter
      setFilter(resList.id);
//      if (resList.id === RES.UNASSIGNED_CANVASSER) {
//        resList.setList([]);  // clear list of addresses
//      }
      resList.applyFilter();
    } else if (action === 'a') {  // no filter, get all
      var list = setFilter(resList.id);
      if (list) {
        resList.factory.getFilteredResource(resList, list.filter, resList.label);
      }
    } else {  // set filter
      var filter = angular.copy(resList.filter.filterBy);

      var dialog = NgDialogFactory.open({ template: 'canvasses/assignmentfilter.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'AssignmentFilterController', 
                    data: {action: resList.id, 
                           ctrl: { title: resList.title,
                                  assignmentChoices: resList.assignmentChoices,
                                  assignmentLabel: resList.assignmentLabel,
                                  nameFields: resList.nameFields},
                           filter: filter}});

      dialog.closePromise.then(function (data) {
        if (!NgDialogFactory.isNgDialogCancel(data.value)) {
          
//          ngDialogData.filter.assignment
          
          var factory = getFactory(data.value.action),
            filter = newFilter(factory, data.value.filter);
          
          var resList = setFilter(data.value.action, filter);
          if (resList) {
            if (resList.id === RES.UNASSIGNED_CANVASSER) {
              // request filtered addresses from server
              $scope.equestCanvassers(resList, filter);
            } else {
              resList.applyFilter();
            }
          }
        }
      });
    }

  }


  function updateList (action) {
    var addrList = utilFactory.getSelectedList($scope.allocatedAddr.list),
      cnvsList = utilFactory.getSelectedList($scope.allocatedCanvasser.list),
      aidx, cidx,
      canvasser, addr,
      clrSel;

    if (action === 'alloc') {
      clrSel = true;
      for (aidx = 0; aidx < addrList.length; ++aidx) {
        addr = addrList[aidx];

        unlinkAddress(addr);  // unlink addr from previous

        for (cidx = 0; cidx < cnvsList.length; ++cidx) {
          canvasser = cnvsList[cidx];
          canvassFactory.linkCanvasserToAddr(canvasser, addr);
        }
      }
    } else if (action === 'unalloc') {
      clrSel = true;

      // unallocate all addresses allocated to selected canvassers
      cnvsList.forEach(function (unallocCnvsr) {
        canvassFactory.unlinkAddrListFromCanvasser(unallocCnvsr, $scope.allocatedAddr.list);
      });
      // unallocate all selected addresses
      addrList.forEach(function (unallocAddr) {
        unlinkAddress(unallocAddr);
      });
    } else if (action === 'show') {
      // TODO show allocations
    }

    if (clrSel) {
      $scope.setItemSel($scope.allocatedAddr, UTIL.CLR_SEL);
      $scope.setItemSel($scope.allocatedCanvasser, UTIL.CLR_SEL);
    }
  }

  function unlinkAddress (addr) {
    if (addr.canvasser) {
      var canvasser = $scope.allocatedCanvasser.findInList(function (element) {
          return (element._id === addr.canvasser);
        });
      if (canvasser) {
        canvassFactory.unlinkAddrFromCanvasser(canvasser, addr);
      }
    }
  }
}

