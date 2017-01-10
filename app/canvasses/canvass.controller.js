/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .constant('LABELS', (function () {
    return ['label-primary',
      'label-success',
      'label-info',
      'label-warning',
      'label-danger'
      ];
  })())
  .value('LABELIDX', 0)
  .controller('CanvassController', CanvassController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'canvassFactory', 'electionFactory', 'surveyFactory', 'addressFactory', 'userFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'miscUtilFactory', 'pagerFactory', 'storeFactory', 'RES', 'roleFactory', 'ROLES', 'STATES', 'LABELS', 'LABELIDX'];

function CanvassController($scope, $rootScope, $state, $stateParams, $filter, canvassFactory, electionFactory, surveyFactory, addressFactory, userFactory, NgDialogFactory, stateFactory, utilFactory, miscUtilFactory, pagerFactory, storeFactory, RES, roleFactory, ROLES, STATES, LABELS, LABELIDX) {

  console.log('CanvassController id', $stateParams.id);

  $scope.dashState = STATES.CANVASS;
  $scope.newState = STATES.CANVASS_NEW;
  $scope.viewState = STATES.CANVASS_VIEW;
  $scope.editState = STATES.CANVASS_EDIT;
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

  canvassFactory.setLabeller(labeller);

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
      var canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS),
        action = ($state.is($scope.newState) ? RES.PROCESS_NEW : RES.PROCESS_UPDATE),
        resList;
      switch ($scope.activeTab) {
        case $scope.tabs.CANVASS_TAB:
          processCanvass(action, nextTab);
          break;
        case $scope.tabs.SURVEY_TAB:
          if (!canvass.survey && (action === RES.PROCESS_UPDATE)) {
            action = RES.PROCESS_UPDATE_NEW; // no previous survey so change to new mode
          }
          processSurvey(action);
          break;
        case $scope.tabs.ADDRESS_TAB:
          // generate addreess list for host
          resList = addressFactory.getList(RES.ASSIGNED_ADDR);
          if (resList) {
            canvass.addresses = extractIds(resList);
          }
          processCanvass(RES.PROCESS_UPDATE, requestAssignmentsNextTab);
          break;
        case $scope.tabs.CANVASSER_TAB:
          // generate canvasser list for host
          resList = userFactory.getList(RES.ASSIGNED_CANVASSER);
          if (resList) {
            canvass.canvassers = extractIds(resList);
          }
          processCanvass(RES.PROCESS_UPDATE, requestAssignmentsNextTab);
          break;
        case $scope.tabs.ASSIGNMENT_TAB:
          processAllocations(RES.PROCESS_UPDATE, gotoDash);
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
    $scope.canvass = canvassFactory.newObj(RES.ACTIVE_CANVASS, storeFactory.CREATE_INIT);
    $scope.backupCanvass = canvassFactory.duplicateObj(RES.BACKUP_CANVASS, RES.ACTIVE_CANVASS, storeFactory.DUPLICATE_OR_EXIST);
  }

  function initSurvey() {
    $scope.survey = surveyFactory.newObj(RES.ACTIVE_SURVEY, storeFactory.CREATE_INIT);
    $scope.backupSurvey = surveyFactory.duplicateObj(RES.BACKUP_SURVEY, RES.ACTIVE_SURVEY, storeFactory.DUPLICATE_OR_EXIST);
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
            processCanvassRsp(response,
                  (storeFactory.CREATE_INIT | storeFactory.APPLY_FILTER),
                  requestAssignments);
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

    $scope.canvass = canvassFactory.readCanvassRsp(response, {
          objId: [RES.ACTIVE_CANVASS,  RES.BACKUP_CANVASS],
          addrId: [RES.ASSIGNED_ADDR, RES.ALLOCATED_ADDR],
          userId: [RES.ASSIGNED_CANVASSER, RES.ALLOCATED_CANVASSER],
          //resultsId: RES.CANVASS_RESULT,
          flags: flags,
          next: next,
          surveyArgs: {
            objId: [RES.ACTIVE_SURVEY, RES.BACKUP_SURVEY],
            flags: flags
          },
          electionArgs: {
            objId: RES.ACTIVE_ELECTION, // id of election object to save response data to
            flags: flags
          }
        });
  }

  function labeller () {
    return LABELS[LABELIDX++ % LABELS.length];
  }
  
  function processCanvassAllocationRsp (response, flags, next) {

    if (typeof flags !== 'number') {
      next = flags;
      flags = storeFactory.NOFLAG;
    }
    if (typeof next !== 'function') {
      next = undefined;
    }
    canvassFactory.readCanvassAllocationRsp(response,{
      addrId: RES.ALLOCATED_ADDR,
      userId: RES.ALLOCATED_CANVASSER,
      labeller: labeller,
      flags: flags,
      next: next
    });
  }
  
  function requestAssignments (next) {
    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS),
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
    if ((action === RES.PROCESS_NEW) || (action === RES.PROCESS_UPDATE_NEW)) {
      errorFxn = creationError;
    } else if (action === RES.PROCESS_UPDATE) {
      errorFxn = updateError;
    }
    return errorFxn;
  }
  
  function processCanvass(action, next) {
    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS),
      backupCanvass = canvassFactory.getObj(RES.BACKUP_CANVASS),
      resource = canvassFactory.getCanvasses(),
      promise;

    console.log('processCanvass', canvass);
    
    if (action === RES.PROCESS_NEW) {
      promise = resource.save(canvass).$promise;
    } else if (action === RES.PROCESS_UPDATE) {
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
          processCanvassRsp(response,
                            (storeFactory.CREATE_INIT | storeFactory.APPLY_FILTER),
                            next);
        },
        // error function
        errorFxn
      );
    }
  }
  
  function processAllocations(action, next) {

    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS),
      canvassers = userFactory.getList(RES.ALLOCATED_CANVASSER),
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
    var canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS),
      survey = surveyFactory.getObj(RES.ACTIVE_SURVEY),
      backupSurvey = surveyFactory.getObj(RES.BACKUP_SURVEY),
      resource = surveyFactory.getSurveys(),
      promise;
    
    console.log('processSurvey', survey);

    if ((action === RES.PROCESS_NEW) || (action === RES.PROCESS_UPDATE_NEW)) {
      promise = resource.save(survey).$promise;
    } else if (action === RES.PROCESS_UPDATE) {
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
          survey = surveyFactory.readSurveyRsp(response, {
              objId: [RES.ACTIVE_SURVEY, RES.BACKUP_SURVEY],
              next: nextTab
            });
          if (!canvass.survey) {
            // link survey to canvass (TODO should really be in the original request)
            canvass.survey = survey._id;
            processCanvass(RES.PROCESS_UPDATE);
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


