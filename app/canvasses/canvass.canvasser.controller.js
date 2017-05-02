/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassCanvasserController', CanvassCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassCanvasserController.$inject = ['$scope', '$rootScope', '$state', '$filter', 'canvassFactory', 'electionFactory', 'surveyFactory', 'addressFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'pagerFactory', 'storeFactory', 'RES', 'ADDRSCHEMA', 'roleFactory', 'ROLES', 'userFactory'];

function CanvassCanvasserController($scope, $rootScope, $state, $filter, canvassFactory, electionFactory, surveyFactory, addressFactory, NgDialogFactory, stateFactory, utilFactory, pagerFactory, storeFactory, RES, ADDRSCHEMA, roleFactory, ROLES, userFactory) {

  var MAX_DISP_PAGE = 5;

  $scope.sortOptions = userFactory.getSortOptions();
  
  $scope.perPageOpt = [5, 10, 15, 20];
  $scope.perPage = 10;

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
    $scope[pager] = pagerFactory.newPager(pager, [], 1, $scope.perPage, MAX_DISP_PAGE);

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

