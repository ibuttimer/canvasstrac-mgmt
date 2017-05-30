/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .value('LABELS', (function () {
    return {
      index: 0,
      classes: [
        'label-primary',
        'label-success',
        'label-info',
        'label-warning',
        'label-danger'
      ]
    };
  })())
  .controller('CanvassController', CanvassController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassController.$inject = ['$scope', '$state', '$stateParams', '$filter', '$injector', 'canvassFactory', 'canvassService', 'canvassAssignmentFactory', 'canvassResultFactory', 'surveyFactory', 'addressFactory', 'userFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'miscUtilFactory', 'storeFactory', 'resourceFactory', 'consoleService', 'controllerUtilFactory', 'RES', 'roleFactory', 'ROLES', 'STATES', 'LABELS', 'SCHEMA_CONST', 'CANVASSSCHEMA', 'SURVEYSCHEMA', 'CANVASSRES_SCHEMA', 'CANVASSASSIGN_SCHEMA', 'ADDRSCHEMA', 'RESOURCE_CONST', 'QUESTIONSCHEMA', 'CHARTS', 'DEBUG'];

function CanvassController($scope, $state, $stateParams, $filter, $injector, canvassFactory, canvassService, canvassAssignmentFactory, canvassResultFactory, surveyFactory, addressFactory, userFactory, NgDialogFactory, stateFactory, utilFactory, miscUtilFactory, storeFactory, resourceFactory, consoleService, controllerUtilFactory, RES, roleFactory, ROLES, STATES, LABELS, SCHEMA_CONST, CANVASSSCHEMA, SURVEYSCHEMA, CANVASSRES_SCHEMA, CANVASSASSIGN_SCHEMA, ADDRSCHEMA, RESOURCE_CONST, QUESTIONSCHEMA, CHARTS, DEBUG) {

  var con = consoleService.getLogger('CanvassController');

  con.debug('CanvassController id', $stateParams.id);

  controllerUtilFactory.setScopeVars('CANVASS', $scope);

  $scope.tabs = {
    CANVASS_TAB: 0,
    SURVEY_TAB: 1,
    ADDRESS_TAB: 2,
    CANVASSER_TAB: 3,
    ASSIGNMENT_TAB: 4,
    RESULT_TAB: 5,
    ALL_TABS: 6
  };
  $scope.firstTab = $scope.tabs.CANVASS_TAB;
  if (showTab($scope.tabs.RESULT_TAB)) {
    $scope.lastTab = $scope.tabs.RESULT_TAB;
  } else {
    $scope.lastTab = $scope.tabs.ASSIGNMENT_TAB;
  }
  $scope.activeTab = $scope.firstTab;
  
  var TAB_BITS = [0];
  for (var prop in $scope.tabs) {
    var bit = (1 << $scope.tabs[prop]);
    if ($scope.tabs[prop] !== $scope.tabs.ALL_TABS) {
      TAB_BITS.push(bit);
      TAB_BITS[0] += bit;
    }
  }
  TAB_BITS.push(TAB_BITS.shift());  // first shall be last

  if (DEBUG.devmode) {
    $scope.debug = DEBUG;
  }

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.getTitle = getTitle;

  $scope.changeStateParam = changeStateParam;
  $scope.singleDelete = singleDelete;
  $scope.getStateButton = getStateButton;

  $scope.showTab = showTab;
  $scope.initTab = initTab;
  $scope.formatDate = utilFactory.formatDate;
  $scope.processForm = processForm;
  $scope.processSurvey = processSurvey;
  $scope.gotoDash = gotoDash;
  $scope.nextTab = nextTab;
  $scope.prevTab = prevTab;
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
  $scope.requestCanvasserRole = requestCanvasserRole;
  $scope.getSurveyRspOptions = getSurveyRspOptions;

  stateFactory.addInterface($scope);  // add stateFactory menthods to scope

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

      Object.getOwnPropertyNames($scope.tabs).forEach(function (prop) {
        if ($scope.tabs[prop] !== $scope.tabs.ALL_TABS) {  // skip all tabs
          if ((bit & TAB_BITS[$scope.tabs[prop]]) !== 0) {
            switch ($scope.tabs[prop]) {
              case $scope.tabs.CANVASS_TAB:
                // canvass tab specific init
                break;
              case $scope.tabs.SURVEY_TAB:
                // survey tab specific init
                if ($scope.survey) {
                  miscUtilFactory.initSelected($scope.survey.questions);
                }
                break;
              case $scope.tabs.ADDRESS_TAB:
                // address tab specific init
                break;
              case $scope.tabs.CANVASSER_TAB:
                // canvasser tab specific init
                break;
              case $scope.tabs.ASSIGNMENT_TAB:
                // assignment tab specific init
                break;
              case $scope.tabs.RESULT_TAB:
                // result tab specific init
                break;
            }
          }
        }
      });
    }
  }
  
  
  
  function getTitle () {
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

  function changeStateParam () {
    return {
      id: $scope.canvass._id
    };
  }

  function singleDelete() {
    var deleteList = [
      JSON.parse(JSON.stringify($scope.canvass))
    ];
    deleteList[0].election = $scope.election;

    canvassService.confirmDeleteCanvass($scope, deleteList,
      // on success
      function (/*response*/) {
        gotoDash();
      });
  }

  function getStateButton (state) {
    return canvassService.getStateButton($scope, state);
  }

  function showTab (tab) {
    var show = true;
    if ($state.is($scope.newState) || $state.is($scope.editState)) {
      if (tab === $scope.tabs.RESULT_TAB) {
        show = false; // no results in new mode
      }
    }
    return show;
  }

  function processForm () {
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
            // no previous survey so change to new mode
            action = RES.PROCESS_UPDATE_NEW;
          } else if (canvass.survey && (action === RES.PROCESS_NEW)) {
            // previous survey (created after adding question), so change to update mode
            action = RES.PROCESS_UPDATE;
          }
          processSurvey(action, nextTab);
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
      if ($scope.activeTab === $scope.lastTab) {
        $state.go($scope.dashState);
      } else {
        nextTab();
      }
    }
  }

  function init () {

    var resources = resourceFactory.createResources(getCanvassRspOptions());

    $scope.canvass = resources[RES.ACTIVE_CANVASS];
    $scope.backupCanvass = resources[RES.BACKUP_CANVASS];

    $scope.survey = resources[RES.ACTIVE_SURVEY];
    $scope.backupSurvey = resources[RES.BACKUP_SURVEY];

    $scope.election = resources[RES.ACTIVE_ELECTION];
  }

  function initItem(id) {
    if (!id) {
      init();
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
    // process a canvass response linking subdoc elements
    $scope.canvass = canvassFactory.readResponse(response,
                            getCanvassRspOptions(flags, next, {
                                                linkAddressAndResult: true,
                                                linkQuestionAndResult: true
                                              }));
  }

  function getCanvassRspOptions (schema, flags, next, custom) {

    var args = checkArgs('canvassFactory', schema, flags, next, custom),
      addrObjId,
      canvsrObjId;

    if (!miscUtilFactory.isEmpty(args.schema) && args.schema.schema &&
        (args.schema.schema.name === CANVASSASSIGN_SCHEMA.SCHEMA.name)) {
      // for canvass assignment processing so only want allocated addr/canvasser
      addrObjId = RES.ALLOCATED_ADDR;
      canvsrObjId = RES.ALLOCATED_CANVASSER;
    } else {
      // for canvass processing
      addrObjId = [RES.ASSIGNED_ADDR, RES.ALLOCATED_ADDR];
      canvsrObjId = [RES.ASSIGNED_CANVASSER, RES.ALLOCATED_CANVASSER];
    }

    var addrOpts = getRspAddressOptions(addrObjId, {
        schema: CANVASSSCHEMA.SCHEMA,
        schemaId: CANVASSSCHEMA.IDs.ADDRESSES,
      }, (args.flags | storeFactory.COPY_SET)),  // make copy of addresses
      canvsrOpts = getRspCanvasserOptions(canvsrObjId, {
        schema: CANVASSSCHEMA.SCHEMA,
        schemaId: CANVASSSCHEMA.IDs.CANVASSERS,
      }, (args.flags | storeFactory.COPY_SET)),  // make copy of canvassers
      resltsOpts = getRspResultOptions(RES.CANVASS_RESULT, {
        schema: CANVASSSCHEMA.SCHEMA,
        schemaId: CANVASSSCHEMA.IDs.RESULTS,
      }, (args.flags | storeFactory.COPY_SET)),   // make copy of results
    rspOptions = {
      objId: [RES.ACTIVE_CANVASS,  RES.BACKUP_CANVASS],
      factory: args.factory,
      schema: args.schema.schema,
      schemaId: args.schema.schemaId,
      storage: RESOURCE_CONST.STORE_OBJ,
      flags: args.flags,
      next: args.next,
      subObj: [
        // storage arguments for specific sub sections of survey info
        { // storage info for election
          objId: RES.ACTIVE_ELECTION, // id of election object to save response data to
          schema: CANVASSSCHEMA.SCHEMA,
          schemaId: CANVASSSCHEMA.IDs.ELECTION,
          //type/path/storage/factory: can be retrieved using schema & schemaId
          flags: args.flags
        },
        // storage info for survey
        getSurveyRspOptions({
          schema: CANVASSSCHEMA.SCHEMA,
          schemaId: CANVASSSCHEMA.IDs.SURVEY
        }, args.flags),
        // storage info for addresses
        addrOpts,
        // storage info for canvassers
        canvsrOpts,
        // storage info for results
        resltsOpts
      ]
    };

    // mark address & result objects for linking
    addrOpts[canvassFactory.ADDR_RES_LINKADDRESS] = true;
    resltsOpts[canvassFactory.ADDR_RES_LINKRESULT] = true;

    // mark question & result objects for linking
    resltsOpts[canvassFactory.QUES_RES_LINKRES] = true;
    // questions are in survey

    // mark address & canvasser objects for linking
    addrOpts[canvassAssignmentFactory.ADDR_CANVSR_ADDRESSLIST] = true;
    canvsrOpts[canvassAssignmentFactory.ADDR_CANVSR_CANVASSERLIST] = true;

    if (args.custom) {
      // add custom items
      miscUtilFactory.copyProperties(args.custom, rspOptions);
    }

    return rspOptions;
  }

  function getRspAddressOptions (objId, schema, flags, next, custom) {
    // storage info for addresses
    return getRspOptionsObject(objId, 'addressFactory', schema, flags, next, custom);
  }

  function getRspCanvasserOptions (objId, schema, flags, next, custom) {
    // storage info for canvassers
    return getRspOptionsObject(objId, 'userFactory', schema, flags, next, custom);
  }

  function getRspResultOptions (objId, schema, flags, next) {
    // storage info for results, no need to decode embedded address/canvass/voter subdocs as not required
    var modelProps = CANVASSRES_SCHEMA.SCHEMA.getModelPropList({
        type: SCHEMA_CONST.FIELD_TYPES.OBJECTID,  // get list of properties of type OBJECTID
        id: function (id) {
          return (id !== CANVASSRES_SCHEMA.IDs.ID); // but not the canvass result id
        }
      }),
      subObj = [],
      read,
      prune;
    // create subObj array to just read the ids
    modelProps.forEach(function (mdlProp) {
      read = undefined;
      prune = undefined;
      if (mdlProp.factory) {
        var schema = $injector.get(mdlProp.factory).getSchema();
        if (schema) {
          read = [schema.ids.ID]; // only want id
          prune = [];
          for (var id in schema.ids) {
            if (schema.ids[id] !== schema.ids.ID) {
              prune.push(schema.ids[id]); // prune anything other than id
            }
          }
        }
      }
      subObj.push({
        processArg: RESOURCE_CONST.PROCESS_READ,  // argument only for use during read
        schema: CANVASSRES_SCHEMA.SCHEMA,
        schemaId: mdlProp.id,
        schemaReadIds: read,
        schemaPruneIds: prune
      });
    });

    var optObj = getRspOptionsObject(objId, 'canvassResultFactory', subObj, schema, flags, next);
    optObj.customArgs = {
      getChartType: function (type) {
        /* chart.js pie, polarArea & doughnut charts may be displayed using
          single data series (i.e. data = []), whereas chart.js radar, line &
          bar require multiple data series (i.e. data = [[], []]) */
        switch (type) {
          case QUESTIONSCHEMA.TYPEIDs.QUESTION_YES_NO:
          case QUESTIONSCHEMA.TYPEIDs.QUESTION_YES_NO_MAYBE:
          case QUESTIONSCHEMA.TYPEIDs.QUESTION_CHOICE_SINGLESEL:
            return CHARTS.PIE;
          case QUESTIONSCHEMA.TYPEIDs.QUESTION_CHOICE_MULTISEL:
            return CHARTS.BAR;
          case QUESTIONSCHEMA.TYPEIDs.QUESTION_RANKING:
            return CHARTS.POLAR;
          default:
            return undefined;
        }
      }
    };
    return optObj;
  }

  function getRspOptionsObject(objId, factory, subObj, schema, flags, next, custom) {
    var args = checkArgs(factory, subObj, schema, flags, next, custom);
    return { // storage info for results
      objId: objId,
      factory: args.factory,
      schema: args.schema.schema,
      schemaId: args.schema.schemaId,
      //type/path/storage/factory: can be retrieved using schema & schemaId
      subObj: args.subObj,
      flags: args.flags,
      next: args.next,
      custom: args.custom
    };
  }

  function checkArgs (factory, subObj, schema, flags, next, custom) {
    if (!angular.isString(factory)) {
      custom = next;
      next = flags;
      flags = schema;
      schema = subObj;
      subObj = factory;
      factory = undefined;
    }
    if (!angular.isArray(subObj)) {
      custom = next;
      next = flags;
      flags = schema;
      schema = subObj;
      subObj = undefined;
    }
    if (!angular.isObject(schema)) {
      custom = next;
      next = flags;
      flags = schema;
      schema = {};
    }
    if (!angular.isNumber(flags)) {
      custom = next;
      next = flags;
      flags = storeFactory.NOFLAG;
    }
    if (!angular.isFunction(next)) {
      custom = next;
      next = undefined;
    }
    return {
      factory: factory, schema: schema, subObj: subObj,
      flags: flags, next: next, custom: custom
    };
  }

  function getSurveyRspOptions (schema, flags, next) {
    var args = checkArgs('surveyFactory', schema, flags, next),
      subObj = {
        // storage arguments for specific sub sections of survey info
        objId: RES.SURVEY_QUESTIONS,
        schema: SURVEYSCHEMA.SCHEMA,
        schemaId: SURVEYSCHEMA.IDs.QUESTIONS,
        //type/path/storage/factory: can be retrieved using schema & schemaId
        flags: args.flags | storeFactory.COPY_SET  // make copy of questions
      };

    // mark question & result objects for linking
    subObj[canvassFactory.QUES_RES_LINKQUES] = true;

    return {
      // storage info for survey
      objId: [RES.ACTIVE_SURVEY, RES.BACKUP_SURVEY],
      factory: args.factory,
      schema: args.schema.schema,
      schemaId: args.schema.schemaId,
      //type/path/storage: can be retrieved using schema & schemaId
      storage: RESOURCE_CONST.STORE_OBJ,
      flags: args.flags,
      next: args.next,
      subObj: subObj
    };
  }



  function labeller () {
    return LABELS.classes[LABELS.index++ % LABELS.classes.length];
  }

  function processCanvassAllocationRsp (response, flags, next) {

    if (typeof flags !== 'number') {
      next = flags;
      flags = storeFactory.NOFLAG;
    }
    if (typeof next !== 'function') {
      next = undefined;
    }

    // TODO currently only support single assignment
//    var toProcess = response;
//    if (Array.isArray(response)) {
//      toProcess = response[0];
//    }
//    if (toProcess) {
      canvassAssignmentFactory.readResponse(response,
                                            getAssignmentRspOptions(flags, next));
//    }
  }

  function getAssignmentRspOptions (schema, flags, next) {
    var args = checkArgs(schema, flags, next),
      custom = {
        processArg: RESOURCE_CONST.PROCESS_READ,  // argument only for use during read
      },
      addrOpts = getRspAddressOptions(undefined /*RES.ALLOCATED_ADDR*/, {
          schema: CANVASSASSIGN_SCHEMA.SCHEMA,
          schemaId: CANVASSASSIGN_SCHEMA.IDs.ADDRESSES,
        }, (args.flags | storeFactory.COPY_SET),  // make copy of addresses
        custom),
      canvsrOpts = getRspCanvasserOptions(undefined /*RES.ALLOCATED_CANVASSER*/, {
          schema: CANVASSASSIGN_SCHEMA.SCHEMA,
          schemaId: CANVASSASSIGN_SCHEMA.IDs.CANVASSER,
        }, (args.flags | storeFactory.COPY_SET),  // make copy of canvasser
        custom);

    // mark address & canvasser objects for linking
    addrOpts[canvassAssignmentFactory.ADDR_CANVSR_LINKADDRESS] = true;
    canvsrOpts[canvassAssignmentFactory.ADDR_CANVSR_LINKCANVASSER] = true;

    return {
      // no objId as don't need to save the assignments response
      flags: args.flags,
      next: args.next,
      subObj: [
          // storage info for canvasser
          canvsrOpts,
          // storage info for addresses
          addrOpts,
          // storage info for canvass
          getCanvassRspOptions({
            schema: CANVASSASSIGN_SCHEMA.SCHEMA,
            schemaId: CANVASSASSIGN_SCHEMA.IDs.CANVASS
          }, args.flags, custom)
      ],
      linkAddressAndCanvasser: {
        labeller: labeller
      }
    };
  }



  
  function requestAssignments (next) {
    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS),
      resource = canvassAssignmentFactory.getCanvassAssignment();

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
  
  function processCanvass (action, next) {
    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS),
      backupCanvass = canvassFactory.getObj(RES.BACKUP_CANVASS),
      resource = canvassFactory.getCanvasses(),
      promise;

    con.log('processCanvass', canvass);
    
    if (action === RES.PROCESS_NEW) {
      promise = resource.save(canvass).$promise;
    } else if (action === RES.PROCESS_UPDATE) {
      var modified = !angular.equals(backupCanvass, canvass);

      con.log('updateCanvass', modified);

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
  
  function processAllocations (action, next) {

    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS),
      canvassers = userFactory.getList(RES.ALLOCATED_CANVASSER),
      resource = canvassAssignmentFactory.getCanvassAssignment(),
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

  function processSurvey (action, next) {
    // depending on timing of responses from host, $scope.canvass may not be set, so get local copy
    var canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS),
      survey = surveyFactory.getObj(RES.ACTIVE_SURVEY),
      backupSurvey = surveyFactory.getObj(RES.BACKUP_SURVEY),
      resource = surveyFactory.getSurveys(),
      promise;
    
    con.log('processSurvey', survey);

    if ((action === RES.PROCESS_NEW) || (action === RES.PROCESS_UPDATE_NEW)) {
      promise = resource.save(survey).$promise;
    } else if (action === RES.PROCESS_UPDATE) {
      var modified = !angular.equals(backupSurvey, survey);

      con.log('updateSurvey', modified);

      if (modified) {   // object was modified
        promise = resource.update({id: survey._id}, survey).$promise;
      } else {  // not modified so proceed to next
        if (next) {
          next();
        }
      }
    }

    if (promise) {
      var errorFxn = getErrorFxn(action);

      promise.then(
        // success function
        function (response) {
          survey = surveyFactory.readResponse(response, getSurveyRspOptions());
          if (!canvass.survey) {
            // link survey to canvass (TODO should really be in the original request)
            canvass.survey = survey._id;
            processCanvass(RES.PROCESS_UPDATE, next);
          } else {  // have survey already so proceed to next
            if (next) {
              next();
            }
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
      ctrl.selCount = miscUtilFactory.toggleSelection(entry, ctrl.selCount);
    }
  }
  
  function setItemSel (ctrl, set) {
    if (ctrl) {
      ctrl.selCount = miscUtilFactory.setSelected(ctrl, set);
    }
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
          NgDialogFactory.error(response, 'Unable to retrieve Roles');
        }
      );
  }

}


