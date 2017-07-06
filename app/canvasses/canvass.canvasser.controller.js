/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassCanvasserController', CanvassCanvasserController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassCanvasserController.$inject = ['$scope', '$state', '$filter', 'NgDialogFactory', 'miscUtilFactory', 'controllerUtilFactory', 'pagerFactory', 'storeFactory', 'RES', 'USERSCHEMA', 'SCHEMA_CONST', 'userFactory', 'canvassService'];

function CanvassCanvasserController($scope, $state, $filter, NgDialogFactory, miscUtilFactory, controllerUtilFactory, pagerFactory, storeFactory, RES, USERSCHEMA, SCHEMA_CONST, userFactory, canvassService) {

  $scope.sortOptions = userFactory.getSortOptions();
  
  pagerFactory.addPerPageOptions($scope, 5, 5, 4, 1); // 4 opts, from 5 inc 5, dflt 10

  setupGroup(RES.ASSIGNED_CANVASSER, 'Assigned');
  setupGroup(RES.UNASSIGNED_CANVASSER, 'Unassigned');


  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterList = filterList;
  $scope.updateList = updateList;
  $scope.sortList = sortList;

  // get canvasser role id, followed by unassigned canvassers
  $scope.requestCanvasserRole(requestUnassignedCanvassers);

  /* function implementation
  -------------------------- */
  
  function setupGroup(id, label) {
    $scope[id] = userFactory.newList(id, {
      title: label,
      flags: storeFactory.CREATE_INIT
    });
    
    var filter = RES.getFilterName(id);
    $scope[filter] = storeFactory.newObj(filter, newFilter, storeFactory.CREATE_INIT);

    var pager = RES.getPagerName(id);
    $scope[pager] = pagerFactory.newPager(pager, [], 1, $scope.perPage, 5);

    setFilter(id, $scope[filter]);
    userFactory.setPager(id, $scope[pager]);
  }

  function newFilter (base) {
    return canvassService.newCanvasserFilter(base, $scope.canvasser);

  }

  function setFilter (id , filter) {
    // unassignedCanvasserFilterStr or assignedCanvasserFilterStr
    var filterStr = RES.getFilterStrName(id);
    if (!filter) {
      filter = newFilter();
    }
    $scope[filterStr] = filter.toString();

    return userFactory.setFilter(id, filter);
  }

  function sortList (resList) {
    return resList.sort();
  }
  
  function filterList (resList, btn) {

    var action = btn.cmd;
    
    if (action === 'c') {       // clear filter
      setFilter(resList.id);
      if (resList.id === RES.UNASSIGNED_CANVASSER) {
        resList.setList([]);  // clear list of canvassers
      }
      resList.applyFilter();
    } else if (action === 'a') {  // no filter, get all
      setFilter(resList.id);
      requestCanvassers(resList, resList.filter);  // request all canvassers
      
    } else {  // set filter
      var filter = angular.copy(resList.filter.getFilterValue());

      NgDialogFactory.openAndHandle({
          template: 'people/personfilter.html', scope: $scope,
          className: 'ngdialog-theme-default', controller: 'PersonFilterController',
          data: {action: resList.id, title: resList.title, filter: filter}
        },
        // process function
        function (value) {

          var filter = newFilter(value.filter),
            resList = setFilter(value.action, filter);
          if (resList) {
            if (resList.id === RES.UNASSIGNED_CANVASSER) {
              // request filtered canvassers from server
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
      setFilter(RES.UNASSIGNED_CANVASSER);
      requestCanvassers(resList, resList.filter);
    }
  }

  function requestCanvassers (resList, filter) {
    
    userFactory.getFilteredResource('user', resList, filter,
                                    
      // success function
      function (response) {
        if (!response.length) {
          NgDialogFactory.message('No canvassers found', 'No canvassers matched the specified criteria');
        }
        $scope.setItemSel(resList, miscUtilFactory.CLR_SEL);
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

