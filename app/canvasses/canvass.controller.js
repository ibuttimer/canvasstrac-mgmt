/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .constant('CANVASS', (function() {
    return {
      DASHSTATE: 'app.campaign.canvass',
      NEWSTATR: 'app.campaign.newcanvass',
      VIEWSTATE: 'app.campaign.viewcanvass',
      EDITSTATE: 'app.campaign.editcanvass',
      
      WORK: 'work',
      BACKUP: 'backup',
      
      ASSIGNED_ADDR: 'assignedAddr',    // addresses assigned to canvass
      UNASSIGNED_ADDR: 'unassignedAddr',// addresses not assigned to canvass
      ASSIGNED_CANVASSER: 'assignedCanvasser',  // canvassers assigned to canvass
      UNASSIGNED_CANVASSER: 'unassignedCanvasser',// canvassers not assigned to canvass
      ALLOCATED_ADDR: 'allocatedAddr',          // addresses allocated to canvass
      ALLOCATED_CANVASSER: 'allocatedCanvasser',// canvassers allocated to canvass
      getPagerName: function (base) {
        // eg assignedAddrPager
        return base + 'Pager';
      },
      getFilterName: function (base) {
        // eg assignedAddrFilter
        return base + 'Filter';
      },
      getFilterStrName: function (base) {
        // eg assignedAddrFilterStr
        return base + 'FilterStr';
      },

      PROCESS_NEW: 0,        // new object mode
      PROCESS_UPDATE: 1,     // update existing object mode
      PROCESS_UPDATE_NEW: 2  // update with new object mode

    };
  })())

  .controller('CanvassController', CanvassController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'canvassFactory', 'electionFactory', 'surveyFactory', 'addressFactory', 'userFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'miscUtilFactory', 'pagerService', 'storeFactory', 'CANVASS', 'roleFactory', 'ROLES'];

function CanvassController($scope, $rootScope, $state, $stateParams, $filter, canvassFactory, electionFactory, surveyFactory, addressFactory, userFactory, NgDialogFactory, stateFactory, utilFactory, miscUtilFactory, pagerService, storeFactory, CANVASS, roleFactory, ROLES) {

  console.log('CanvassController id', $stateParams.id);

  $scope.dashState = CANVASS.DASHSTATE;
  $scope.newState = CANVASS.NEWSTATR;
  $scope.viewState = CANVASS.VIEWSTATE;
  $scope.editState = CANVASS.EDITSTATE;
  $scope.tabs = {
    CANVASS_TAB: 0,
    SURVEY_TAB: 1,
    ADDRESS_TAB: 2,
    CANVASSER_TAB: 3,
    ASSIGNMENT_TAB: 4,
    ALL_TABS: 5
  };
  $scope.firstTab = $scope.tabs.CANVASS_TAB;
  $scope.lastTab = $scope.tabs.ASSIGNMENT_TAB;
  $scope.activeTab = $scope.firstTab;
  
  var TAB_BITS = [
      (1 << $scope.tabs.CANVASS_TAB),
      (1 << $scope.tabs.SURVEY_TAB),
      (1 << $scope.tabs.ADDRESS_TAB),
      (1 << $scope.tabs.CANVASSER_TAB),
      (1 << $scope.tabs.ASSIGNMENT_TAB),
      0x1f
    ];

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.getTitle = getTitle;
  $scope.initTab = initTab;
  $scope.formatDate = utilFactory.formatDate;
  $scope.processForm = processForm;
  $scope.processSurvey = processSurvey;
  $scope.gotoDash = gotoDash;
  $scope.nextTab = nextTab;
  $scope.prevTab = prevTab;
  $scope.stateIs = stateFactory.stateIs;
  $scope.stateIsNot = stateFactory.stateIsNot;
  $scope.stateIncludes = stateFactory.stateIncludes;
  $scope.menuStateIs = stateFactory.menuStateIs;
  $scope.stateIsOneOf = stateFactory.stateIsOneOf;
  $scope.stateIsNotOneOf = stateFactory.stateIsNotOneOf;
  $scope.setPage = setPage;
  $scope.incPage = incPage;
  $scope.decPage = decPage;
  $scope.isFirstPage = isFirstPage;
  $scope.isLastPage = isLastPage;
  $scope.isActivePage = isActivePage;
  $scope.setPerPage = setPerPage;
  $scope.showPager = showPager;
  $scope.toggleItemSel = toggleItemSel;
  $scope.setItemSel = setItemSel;
  $scope.confirmDelete = confirmDelete;
  $scope.buildQuery = buildQuery;
  $scope.requestCanvasserRole = requestCanvasserRole;

  initItem(); // perform basic init of objects
  if ($stateParams.id) {
    initItem($stateParams.id);  // init objects for id
  }

  
  
  /* function implementation
  -------------------------- */

  function initTab (tab) {
    if (tab < TAB_BITS.length) {
      var bit = TAB_BITS[tab];

      if ((bit & TAB_BITS[$scope.tabs.CANVASS_TAB]) !== 0) {
        // cnavass tab specific init
      }
      if ((bit & TAB_BITS[$scope.tabs.SURVEY_TAB]) !== 0) {
        // survey tab specific init
        if ($scope.survey) {
          utilFactory.initSelected($scope.survey.questions);
        }
      }
      if ((bit & TAB_BITS[$scope.tabs.ADDRESS_TAB]) !== 0) {
        // address tab specific init
      }
      if ((bit & TAB_BITS[$scope.tabs.CANVASSER_TAB]) !== 0) {
        // canvasser tab specific init
      }
      if ((bit & TAB_BITS[$scope.tabs.ASSIGNMENT_TAB]) !== 0) {
        // assignment tab specific init
      }
    }
  }
  
  
  
  function getTitle() {
    $scope.editDisabled = true;
    var title;
    if ($state.is($scope.newState)) {
      title = 'Create Canvass';
      $scope.editDisabled = false;
    } else if ($state.is($scope.viewState)) {
      title = 'View Canvass';
    } else if ($state.is($scope.editState)) {
      title = 'Update Canvass';
      $scope.editDisabled = false;
    } else {
      title = '';
    }
    return title;
  }

  
  function processForm() {
    if ($state.is($scope.newState) || $state.is($scope.editState)) {
      // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
      var canvass = canvassFactory.getCanvass(CANVASS.WORK),
        action = ($state.is($scope.newState) ? CANVASS.PROCESS_NEW : CANVASS.PROCESS_UPDATE),
        resList;
      switch ($scope.activeTab) {
        case $scope.tabs.CANVASS_TAB:
          processCanvass(action, nextTab);
          break;
        case $scope.tabs.SURVEY_TAB:
          if (!canvass.survey && (action === CANVASS.PROCESS_UPDATE)) {
            action = CANVASS.PROCESS_UPDATE_NEW; // no previous survey so change to new mode
          }
          processSurvey(action, nextTab);
          break;
        case $scope.tabs.ADDRESS_TAB:
          // generate addreess list for host
          resList = addressFactory.getList(CANVASS.ASSIGNED_ADDR);
          if (resList) {
            canvass.addresses = extractIds(resList);
          }
          processCanvass(CANVASS.PROCESS_UPDATE, requestAssignmentsNextTab);
          break;
        case $scope.tabs.CANVASSER_TAB:
          // generate canvasser list for host
          resList = userFactory.getList(CANVASS.ASSIGNED_CANVASSER);
          if (resList) {
            canvass.canvassers = extractIds(resList);
          }
          processCanvass(CANVASS.PROCESS_UPDATE, requestAssignmentsNextTab);
          break;
        case $scope.tabs.ASSIGNMENT_TAB:
          processAllocations(CANVASS.PROCESS_UPDATE, gotoDash);
          break;
      }
    } else if ($state.is($scope.viewState)) {
      switch ($scope.activeTab) {
        case $scope.tabs.ASSIGNMENT_TAB:
          $state.go($scope.dashState);
          break;
        default:
          nextTab();
          break;
      }
    }
  }

  function initCanvass() {
    $scope.canvass = canvassFactory.newCanvass(CANVASS.WORK, storeFactory.CREATE_INIT);
    $scope.backupCanvass = canvassFactory.duplicateCanvass(CANVASS.BACKUP, CANVASS.WORK, storeFactory.DUPLICATE_OR_EXIST);
  }

  function initSurvey() {
    $scope.survey = surveyFactory.newSurvey(CANVASS.WORK, storeFactory.CREATE_INIT);
    $scope.backupSurvey = surveyFactory.duplicateSurvey(CANVASS.BACKUP, CANVASS.WORK, storeFactory.DUPLICATE_OR_EXIST);
  }


  function initItem(id) {
    if (!id) {
      initCanvass();
      initSurvey();
      initTab($scope.tabs.ALL_TABS);
    } else {
      $scope.canvass = canvassFactory.getCanvasses().get({id: id})
        .$promise.then(
          // success function
          function (response) {
            initTab($scope.tabs.ALL_TABS);
            processCanvassRsp(response, storeFactory.CREATE_INIT,  requestAssignments);
            if (!$scope.canvass.survey) {
              initSurvey();
            }
          },
          // error function
          function (response) {
            // response is message
            NgDialogFactory.error(response, 'Unable to retrieve Canvass');
          }
        );
    }
  }

  function processCanvassRsp (response, flags, next) {
    $scope.canvass = canvassFactory.readCanvassRsp(response, 
                [CANVASS.WORK, CANVASS.BACKUP],
                [CANVASS.ASSIGNED_ADDR, CANVASS.ALLOCATED_ADDR],  // lists to store addr in
                [CANVASS.ASSIGNED_CANVASSER, CANVASS.ALLOCATED_CANVASSER], // list to store canvassers in
                flags, next);
  }
  
  function processCanvassAllocationRsp (response, flags, next) {
    $scope.canvass = canvassFactory.readCanvassAllocationRsp(response,
                CANVASS.ALLOCATED_ADDR,  // lists to store addr in
                CANVASS.ALLOCATED_CANVASSER, // list to store canvassers in
                flags, next);
  }
  
  function requestAssignments (next) {
    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getCanvass(CANVASS.WORK),
      resource = canvassFactory.getCanvassAllocation();

    resource.query({canvass: canvass._id}).$promise.then(
      // success function
      function (response) {
        // response from server contains result
        processCanvassAllocationRsp(response, next);
      },
      // error function
      function (response) {
        NgDialogFactory.error(response, 'Unable to retrieve canvass assignments');
      }
    );
  }

  function requestAssignmentsNextTab () {
    requestAssignments(nextTab);
  }

  
  function creationError(response) {
    NgDialogFactory.error(response, 'Creation Unsuccessful');
  }

  function updateError(response) {
    NgDialogFactory.error(response, 'Update Unsuccessful');
  }
  
  function getErrorFxn(action) {
    var errorFxn;
    if ((action === CANVASS.PROCESS_NEW) || (action === CANVASS.PROCESS_UPDATE_NEW)) {
      errorFxn = creationError;
    } else if (action === CANVASS.PROCESS_UPDATE) {
      errorFxn = updateError;
    }
    return errorFxn;
  }
  
  function processCanvass(action, next) {
    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getCanvass(CANVASS.WORK),
      backupCanvass = canvassFactory.getCanvass(CANVASS.BACKUP),
      resource = canvassFactory.getCanvasses(),
      promise;

    console.log('processCanvass', canvass);
    
    if (action === CANVASS.PROCESS_NEW) {
      promise = resource.save(canvass).$promise;
    } else if (action === CANVASS.PROCESS_UPDATE) {
      var modified = !angular.equals(backupCanvass, canvass);

      console.log('updateCanvass', modified);

      if (modified) {   // object was modified
        promise = resource.update({id: canvass._id}, canvass).$promise;
      } else {  // not modified so proceed to next tab
        nextTab();
      }
    }
    
    if (promise) {
      var errorFxn = getErrorFxn(action);

      promise.then(
        // success function
        function (response) {
          processCanvassRsp(response, next);
        },
        // error function
        errorFxn
      );
    }
  }
  
  function processAllocations(action, next) {

    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getCanvass(CANVASS.WORK),
      canvassers = userFactory.getList(CANVASS.ALLOCATED_CANVASSER),
      resource = canvassFactory.getCanvassAllocation(),
      newAllocs = [],
      promises = [];
    
    canvassers.list.forEach(function (canvasser) {
      
      if (!canvasser.allocId) {
        if (canvasser.addresses && canvasser.addresses.length) {
          newAllocs.push({
            canvass: canvass._id,
            canvasser: canvasser._id,
            addresses: canvasser.addresses
          });
        }
      } else {
        // has existing allocation, so update it
        promises.push(resource.update({id: canvasser.allocId}, {
            addresses: canvasser.addresses
          }).$promise);
      }
    });
    
    if (newAllocs.length) {
      resource.saveMany(newAllocs).$promise.then(
        // success function
        function (response) {
          processCanvassAllocationRsp(response, next);
        },
        // error function
        creationError
      );
    }
    if (promises.length) {
      promises.forEach(function (promise) {
        promise.then(
          // success function
          function (response) {
            processCanvassAllocationRsp(response, next);
          },
          // error function
          updateError
        );
      });
      
    }
  }
  
  function extractIds (resList) {
    var idArray = [];
    resList.list.forEach(function (entry) {
      idArray.push(entry._id);
    });
    return idArray;
  }

  function processSurvey(action) {
    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getCanvass(CANVASS.WORK),
      survey = surveyFactory.getSurvey(CANVASS.WORK),
      backupSurvey = surveyFactory.getSurvey(CANVASS.BACKUP),
      resource = surveyFactory.getSurveys(),
      promise;
    
    console.log('processSurvey', survey);

    if ((action === CANVASS.PROCESS_NEW) || (action === CANVASS.PROCESS_UPDATE_NEW)) {
      promise = resource.save(survey).$promise;
    } else if (action === CANVASS.PROCESS_UPDATE) {
      var modified = !angular.equals(backupSurvey, survey);

      console.log('updateSurvey', modified);

      if (modified) {   // object was modified
        promise = resource.update({id: survey._id}, survey).$promise;
      } else {  // not modified so proceed to next tab
        nextTab();
      }
    }
    
    if (promise) {
      var errorFxn = getErrorFxn(action);

      promise.then(
        // success function
        function (response) {
          survey = surveyFactory.readSurveyRsp(response, [CANVASS.WORK, CANVASS.BACKUP], nextTab);
          if (!canvass.survey) {
            // link survey to canvass (TODO should really be in the original request)
            canvass.survey = survey._id;
            processCanvass(CANVASS.PROCESS_UPDATE);
          }
        },
        // error function
        errorFxn
      );
    }
  }

  function gotoDash () {
    $state.go($scope.dashState);
  }

  function confirmDelete (dialogOpts, onClose) {

    var dialog = NgDialogFactory.open(dialogOpts);
    
    dialog.closePromise.then(function (data) {
      if (!NgDialogFactory.isNgDialogCancel(data.value)) {
        // perform delete
        onClose(data);
      }
    });
  }
  
  
  function nextTab () {
    if ($scope.activeTab < $scope.lastTab) {
      $scope.activeTab += 1;
    }
  }

  function prevTab () {
    if ($scope.activeTab > $scope.firstTab) {
      $scope.activeTab -= 1;
    }
  }

  
  function showPager(pager) {
    var result = false;
    if (pager) {
      result = (pager.pages.length > 0);
    }
    return result;
  }

  function translatePage(pager, page) {
    if (page === 'last') {
      page = pager.totalPages;
    } else if (page === 'first') {
      page = 1;
    }
    return page;
  }

  function setPage(pager, page) {
    if (pager) {
      pager.setPage(translatePage(pager, page));
    }
  }

  function incPage(pager) {
    if (pager) {
      pager.incPage();
    }
  }
  
  function decPage(pager) {
    if (pager) {
      pager.decPage();
    }
  }
  
  function isFirstPage(pager) {
    return isActivePage(pager, 1);
  }
  
  function isLastPage(pager) {
    return isActivePage(pager, pager.totalPages);
  }

  function isActivePage(pager, page) {
    var result = false;
    if (pager) {
      result = (pager.currentPage === translatePage(pager, page));
    }
    return result;
  }

  function setPerPage(pagers, pages) {
    // jic no native implementation is available
    miscUtilFactory.arrayPolyfill();
    
    var list;
    if (Array.isArray(pagers)) {
      list = pagers;
    } else {
      list = [pagers];
    }
    list.forEach(function (pager) {
      pager.setPerPage(pages);
    });
  }
  
  function toggleItemSel (ctrl, entry) {
    if (ctrl && !$scope.editDisabled) {
      ctrl.selCount = utilFactory.toggleSelection(entry, ctrl.selCount);
    }
  }
  
  function setItemSel (ctrl, set) {
    if (ctrl) {
      ctrl.selCount = utilFactory.setSelected(ctrl.list, set);
    }
  }

  
  function buildQuery (forEachSchemaField, filter) {
    var query = {};
    if (filter) {
      // using the dialog fields to build an object based on the model fields
      forEachSchemaField(function (idx, dialog, display, models) {
        var filterVal = filter[dialog];
        if (filterVal) {
          var field = '';
          for (var i = 0; i < models.length; ++i) {
            if (i > 0) {
              field += ' ';
            }
            field += models[i];
          }
          query[field] = filterVal;
        }
      });
    }
    return query;
  }

  function requestCanvasserRole (next) {
    $scope.canvasser = roleFactory.getRoles().query({level: ROLES.ROLE_CANVASSER})
      .$promise.then(
        // success function
        function (response) {
          // response is actual data
          $scope.canvasser = response;
          if (next) {
            next();
          }
        },
        // error function
        function (response) {
          // response is message
          $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
        }
      );
  }

}


