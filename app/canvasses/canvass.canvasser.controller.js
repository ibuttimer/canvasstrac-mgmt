/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassCanvasserController', CanvassCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassCanvasserController.$inject = ['$scope', '$state', '$filter', 'NgDialogFactory', 'miscUtilFactory', 'controllerUtilFactory', 'pagerFactory', 'storeFactory', 'RES', 'ADDRSCHEMA', 'userFactory'];

function CanvassCanvasserController($scope, $state, $filter, NgDialogFactory, miscUtilFactory, controllerUtilFactory, pagerFactory, storeFactory, RES, ADDRSCHEMA, userFactory) {

  $scope.sortOptions = userFactory.getSortOptions();
  
  pagerFactory.addPerPageOptions($scope, 5, 5, 4, 1); // 4 opts, from 5 inc 5, dflt 10

  setupGroup(RES.ASSIGNED_CANVASSER, 'Assigned');
  setupGroup(RES.UNASSIGNED_CANVASSER, 'Unassigned');


  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterList = filterList;
  $scope.updateList = updateList;
  $scope.sortList = sortList;

  // get canvasser role id, followed by inassigned canvassers
  $scope.requestCanvasserRole(requestUnassignedCanvassers);

  
  /* function implementation
  -------------------------- */
  
  function setupGroup(id, label) {
    $scope[id] = userFactory.newList(id, {
      title: label,
      flags: storeFactory.CREATE_INIT
    });
    
    var filter = RES.getFilterName(id);
    $scope[filter] = storeFactory.newObj(filter, userFactory.newFilter, storeFactory.CREATE_INIT);

    var pager = RES.getPagerName(id);
    $scope[pager] = pagerFactory.newPager(pager, [], 1, $scope.perPage, 5);

    setFilter(id, $scope[filter]);
    userFactory.setPager(id, $scope[pager]);
  }

  function setFilter (id , filter) {
    // unassignedCanvasserFilterStr or assignedCanvasserFilterStr
    var filterStr = RES.getFilterStrName(id);
    if (!filter) {
      filter = userFactory.newFilter();
    }
    $scope[filterStr] = filter.toString();

    // add canvasser restriction to filter
    if ($scope.canvasser) {
      filter.role = $scope.canvasser._id;
    }
    
    return userFactory.setFilter(id, filter);
  }

  function sortList (resList) {
    return resList.sort();
  }
  
  function filterList (resList, action) {
    
    if (action === 'c') {       // clear filter
      setFilter(resList.id);
      if (resList.id === RES.UNASSIGNED_CANVASSER) {
        resList.setList([]);  // clear list of canvassers
      }
      resList.applyFilter();
    } else if (action === 'a') {  // no filter, get all
      setFilter(resList.id);
      requestCanvassers(resList);  // request all canvassers
      
    } else {  // set filter
      var filter = angular.copy(resList.filter.filterBy);

      NgDialogFactory.openAndHandle({
          template: 'people/personfilter.html', scope: $scope,
          className: 'ngdialog-theme-default', controller: 'PersonFilterController',
          data: {action: resList.id, title: resList.title, filter: filter}
        },
        // process function
        function (value) {

          var filter = userFactory.newFilter(value.filter),
            resList = setFilter(value.action, filter);
          if (resList) {
            if (resList.id === RES.UNASSIGNED_CANVASSER) {
              // request filtered addresses from server
              requestCanvassers(resList, filter);
            } else {
              resList.applyFilter();
            }
          }
        }
        // no cancel function
      );
    }

  }


  function requestUnassignedCanvassers () {
    var resList = userFactory.getList(RES.UNASSIGNED_CANVASSER);
    if (resList) {
      requestCanvassers(resList);
    }
  }

  function requestCanvassers (resList, filter) {
    
    userFactory.getFilteredResource(resList, filter, 
                                    
      // success function
      function (response) {
        if (!response.length) {
          NgDialogFactory.message('No canvassers found', 'No canvassers matched the specified criteria');
        }
      },
      // error function
      function (response) {
        NgDialogFactory.error(response, 'Unable to retrieve canvassers');
      }
    );
  }

  function updateList (fromList, toList) {

    controllerUtilFactory.moveListSelected(fromList, toList, function (item1, item2) {
      return (item1._id === item2._id);
    });
  }
  
}

