/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassAddressController', CanvassAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAddressController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'canvassFactory', 'electionFactory', 'surveyFactory', 'addressFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'pagerFactory', 'storeFactory', 'resourceFactory', 'RES'];

function CanvassAddressController($scope, $rootScope, $state, $stateParams, $filter, canvassFactory, electionFactory, surveyFactory, addressFactory, NgDialogFactory, stateFactory, utilFactory, pagerFactory, storeFactory, resourceFactory, RES) {

  console.log('CanvassAddressController id', $stateParams.id);

  var MAX_DISP_PAGE = 5;

  $scope.sortOptions = addressFactory.getSortOptions();
  
  $scope.perPageOpt = [5, 10, 15, 20];
  $scope.perPage = 10;
  

  setupGroup(RES.ASSIGNED_ADDR, 'Assigned');
  setupGroup(RES.UNASSIGNED_ADDR, 'Unassigned');


  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterList = filterList;
  $scope.updateList = updateList;
  $scope.sortList = sortList;

  requestAddressCount();  // get database total address count

  
  /* function implementation
  -------------------------- */
  
  function setupGroup(id, label) {

    $scope[id] = addressFactory.newList(id, {
      title: label,
      flags: storeFactory.CREATE_INIT
    });
    $scope[id].sortBy = $scope.sortOptions[0];
    
    var filter = RES.getFilterName(id);
    $scope[filter] = storeFactory.newObj(filter, addressFactory.newFilter, storeFactory.CREATE_INIT);

    var pager = RES.getPagerName(id);
    $scope[pager] = pagerFactory.newPager(pager, [], 1, $scope.perPage, MAX_DISP_PAGE);

    setFilter(id, $scope[filter]);
    addressFactory.setPager(id, $scope[pager]);
  }
  
  function setFilter (id , filter) {
    // unassignedAddrFilterStr or assignedAddrFilterStr
    var filterStr = RES.getFilterStrName(id);
    if (!filter) {
      filter = addressFactory.newFilter();
    }
    $scope[filterStr] = filter.toString();

    return addressFactory.setFilter(id, filter);
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
      var sortFxn = addressFactory.getSortFunction($scope.sortOptions, resList.sortBy.value);
      if (sortFxn) {
        sortList.sort(sortFxn);
        if (addressFactory.isDescendingSortOrder(resList.sortBy.value)) {
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
      if (resList.id === RES.UNASSIGNED_ADDR) {
        resList.setList([]);  // clear list of addresses
      }
      resList.applyFilter();
    } else if (action === 'a') {  // no filter, get all
      setFilter(resList.id);
      requestAddresses(resList);  // request all addresses
      
    } else {  // set filter
      var filter = angular.copy(resList.filter.filterBy);

      var dialog = NgDialogFactory.open({ template: 'address/addressfilter.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'AddressFilterController', 
                    data: {action: resList.id, title: resList.title, filter: filter}});

      dialog.closePromise.then(function (data) {
        if (!NgDialogFactory.isNgDialogCancel(data.value)) {

          var filter = addressFactory.newFilter(data.value.filter);
          
          var resList = setFilter(data.value.action, filter);
          if (resList) {
            if (resList.id === RES.UNASSIGNED_ADDR) {
              // request filtered addresses from server
              requestAddresses(resList, filter);
            } else {
              resList.applyFilter();
            }
          }
        }
      });
    }

  }


  function requestAddresses (resList, filter) {
    
    addressFactory.getFilteredResource(resList, filter, 
      // success function
      function (response) {
        if (!response.length) {
          NgDialogFactory.message('No addresses found', 'No addresses matched the specified criteria');
        }

        requestAddressCount();
      },
      // error function
      function (response) {
        NgDialogFactory.error(response, 'Unable to retrieve addresses');
      }
                                      
                                      
                                      
                                      
                                      ); // get database total address count
    
//    var resource = addressFactory.getAddresses();
//
//    filter = filter || addressFactory.newFilter();
//
//    var query = resourceFactory.buildQuery(addressFactory.forEachSchemaField, filter.filterBy);
//
//    resList.setList([]);
//    resource.query(query).$promise.then(
//      // success function
//      function (response) {
//        // add indices
//        for (var i = 0; i < response.length; ++i) {
//          response[i].index = i + 1;
//        }
//        // response from server contains result of filter request
//        resList.setList(response, storeFactory.APPLY_FILTER);
//
//        requestAddressCount();  // get database total address count
//      },
//      // error function
//      function (response) {
//        NgDialogFactory.error(response, 'Unable to retrieve addresses');
//      }
//    );
  }

  function requestAddressCount (filter) {
    $scope.dbAddrCount = addressFactory.getCount().get()
      .$promise.then(
        // success function
        function (response) {
          $scope.dbAddrCount = response.count;
        },
        // error function
        function (response) {
          NgDialogFactory.error(response, 'Unable to retrieve address count');
        }
      );
  }

  
  function updateList (fromList, toList) {
    var selList,
      moveList = [];  // addr to be moved, i.e. not in target

    selList = utilFactory.getSelectedList(fromList.list);
    
    if (selList.length > 0) {
      selList.forEach(function (element) {
        var i;
        for (i = 0; i < toList.list.length; ++i) {
          if (element._id === toList.list[i]._id) {
            break;
          }
        }
        if (i === toList.list.length) {
          // not in target so needs to be moved
          moveList.push(element);
        }
        
        utilFactory.toggleSelection(element);
      });
      
      // remove all selected from source
      utilFactory.arrayRemove(fromList.list, selList);
      fromList.selCount = 0;
    }
    
    if (moveList.length > 0) {

      utilFactory.arrayAdd(toList.list, moveList, function (array, add) {
        for (var i = 0; i < array.length; ++i) {
          if (add._id === array[i]._id) {
            return false; // already in array
          }
        }
        return true;  // not found, so add
      });
    }
    
    [fromList, toList].forEach(function (resList) {
      sortList(resList);
      resList.count = resList.list.length;
      resList.applyFilter();
    });
  }
  
}

