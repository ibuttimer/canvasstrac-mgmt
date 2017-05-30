/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .directive("cnvtrcAddrWidget", function() {
    return {
      restrict: 'E',          // restrict the directive declaration style to element name
      scope: {                // new "isolate" scope
        'addrInfo': '=info',  // bidirectional binding
        'showBadge': '=badge',
        'debug': '='
      },
      templateUrl: 'canvasses/address.element.html'
    };
  })
  .controller('CanvassAddressController', CanvassAddressController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassAddressController.$inject = ['$scope', '$state', '$stateParams', '$filter', 'addressFactory', 'NgDialogFactory', 'utilFactory', 'miscUtilFactory', 'controllerUtilFactory', 'pagerFactory', 'storeFactory', 'consoleService', 'RES'];

function CanvassAddressController($scope, $state, $stateParams, $filter, addressFactory, NgDialogFactory, utilFactory, miscUtilFactory, controllerUtilFactory, pagerFactory, storeFactory, consoleService, RES) {

  var con = consoleService.getLogger('CanvassAddressController');

  con.log('CanvassAddressController id', $stateParams.id);

  pagerFactory.addPerPageOptions($scope, 5, 5, 4, 1); // 4 opts, from 5 inc 5, dflt 10

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
    
    var filter = RES.getFilterName(id);
    $scope[filter] = storeFactory.newObj(filter, newFilter, storeFactory.CREATE_INIT);

    var pager = RES.getPagerName(id);
    $scope[pager] = pagerFactory.newPager(pager, [], 1, $scope.perPage, 5);

    setFilter(id, $scope[filter]);
    addressFactory.setPager(id, $scope[pager]);
  }
  
  function newFilter (base) {
    // new filter no blanks
    return addressFactory.newFilter(base, false);
  }

  function setFilter (id, filter) {
    // unassignedAddrFilterStr or assignedAddrFilterStr
    var filterStr = RES.getFilterStrName(id);
    if (!filter) {
      filter = newFilter();
    }
    $scope[filterStr] = filter.toString();

    return addressFactory.setFilter(id, filter);
  }

  function sortList (resList) {
    return resList.sort();
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
      requestAddresses(resList, resList.filter);  // request all addresses
      
    } else {  // set filter
      var filter = angular.copy(resList.filter.filterBy);

      var dialog = NgDialogFactory.open({ template: 'address/addressfilter.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'AddressFilterController', 
                    data: {action: resList.id, title: resList.title, filter: filter}});

      dialog.closePromise.then(function (data) {
        if (!NgDialogFactory.isNgDialogCancel(data.value)) {

          var filter = newFilter(data.value.filter);
          
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
  }

  function requestAddressCount () {
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

    controllerUtilFactory.moveListSelected(fromList, toList, function (item1, item2) {
      return (item1._id === item2._id);
    });
  }
  
}

