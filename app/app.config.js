/*jslint node: true */
/*global angular */
'use strict';

 /**************************************************************************
   * Set environment values
   *************************************************************************/

// Default environment variables
var appenv = {};

// Import variables if present
if(window){
  for (var prop in window.__env) {
    appenv[prop] = window.__env[prop];
  }
  if (!appenv.baseURL) {
    throw Error('Missing configuration: baseURL');
  }
}

angular.module('ct.config', [])

  .constant('baseURL', (function () {
    // This is the data base url, app pages are handled by ui-router
    var proto = 'http',
      port = appenv.httpPort,
      url;
    if (appenv.forceHttps) {
      proto = 'https';
      if (port >= 0) {
        port += appenv.httpsPortOffset;
      }
    }
    url = proto + '://' + appenv.baseURL;
    if (port >= 0) {
      url += ':' + port;
    }
    return url + '/db/';
  })())
  .constant('mapsApiKey', appenv.mapsApiKey)
  .constant('STATES', (function () {
    var cfgState = 'app.cfg',
      campaignState = 'app.campaign',
      makeStates = function (path, base, substate) {
        var state = path + '.' + base;
        if (substate) {
          state += '-' + substate;
        }
        return state;
      },
      makeSubStatePropName = function (state, substate) {
        return state + '_' + substate;
      },
      substates = [
        'NEW', 'VIEW', 'EDIT', 'NEW', 'DEL'
      ],
      stateConstant = {
        APP: 'app',
        ABOUTUS: 'app.aboutus',

        CONFIG: cfgState,
        CAMPAIGN: campaignState,

        LOGIN: 'app.login',
        CONTACTUS: 'app.contactus'
      },
      disabledStates = [
        // add entries to disbale a state and any substates
      ];

      /* make state values, e.g. VOTINGSYS, VOTINGSYS_NEW etc.
          add a disabled flag to disable the state and any substates */
      [ { property: 'VOTINGSYS', path: cfgState, base: 'votingsystem', disabled: true },
        { property: 'ROLES', path: cfgState, base: 'role', disabled: true },
        { property: 'USERS', path: cfgState, base: 'user' },
        { property: 'ELECTION', path: campaignState, base: 'election' },
        { property: 'CANDIDATE', path: campaignState, base: 'candidate' },
        { property: 'CANVASS', path: campaignState, base: 'canvass' }
      ].forEach(function (state) {
        stateConstant[state.property] = makeStates(state.path, state.base);
        substates.forEach(function (substate) {
          stateConstant[makeSubStatePropName(state.property, substate)] = makeStates(state.path, state.base, substate.toLowerCase());
        });

        if (state.disabled) {
          // disbale the state and any substates
          disabledStates.push(stateConstant[state.property]);
        }
      });

    // add function to check for disabled states
    stateConstant.ISDISABLED = function (state) {
      var disabled = true,  // everythimg disabled by default
        properties = Object.getOwnPropertyNames(stateConstant),
        i, j;
      for (i = 0; i < properties.length; ++i) {
        if (stateConstant[properties[i]] === state) {
          disabled = false; // valid state, enabled by default
          for (j = 0; j < properties.length; ++j) {
            if (state.indexOf(disabledStates[j]) === 0) {
              return true;  // it or a parent is disabled
            }
          }
        }
      }
      return disabled;
    };

    /* add function to set scope variables giving
      scope.dashState, $scope.newState, $scope.viewState etc. */
    stateConstant.SET_SCOPE_VARS = function (scope, base) {
      scope.dashState = stateConstant[base];
      substates.forEach(function (substate) {
        // make properties like 'newState' etc.
        var name = substate.toLowerCase();
        scope[name + 'State'] = stateConstant[makeSubStatePropName(base, substate)];
      });
    };

    return stateConstant;
  })())
  .constant('CONFIG', (function () {
    return {
      DEV_MODE: appenv.DEV_MODE,  // flag to enable dev mode hack/shortcuts etc.
      DEV_USER: appenv.DEV_USER,
      DEV_PASSWORD: appenv.DEV_PASSWORD
    };
  })())
  .constant('DBG', (function () {
    return {
      // debug enable flags
      storeFactory: appenv.storeFactory,
      localStorage: appenv.localStorage,
      surveyFactory: appenv.surveyFactory,
      canvassFactory: appenv.canvassFactory,
      electionFactory: appenv.electionFactory,
      CanvassController: appenv.CanvassController,
      CanvassActionController: appenv.CanvassActionController,
      SurveyController: appenv.SurveyController,
      navService: appenv.navService,

      isEnabled: function (mod) {
        return this[mod];
      },
      debug: function (mod) {
        if (this[mod]) {
          var args = Array.prototype.slice.call(arguments, 1);
          console.debug.apply(console, args.concat(' '));
        }
      },
      info: function (mod) {
        if (this[mod]) {
          var args = Array.prototype.slice.call(arguments, 1);
          console.info.apply(console, args.concat(' '));
        }
      },
      warn: function (mod) {
        if (this[mod]) {
          var args = Array.prototype.slice.call(arguments, 1);
          console.warn.apply(console, args.concat(' '));
        }
      },
      error: function (mod) {
        if (this[mod]) {
          var args = Array.prototype.slice.call(arguments, 1);
          console.error.apply(console, args.concat(' '));
        }
      }

    };
  })())
  .constant('RES', (function () {
    return {
      ACTIVE_CANVASS: 'activeCanvass',            // canvass object name
      ACTIVE_SURVEY: 'activeSurvey',              // survey object name
      ACTIVE_ELECTION: 'activeElection',          // election object name
      BACKUP_CANVASS: 'backupCanvass',            // backup canvass object name
      BACKUP_SURVEY: 'backupSurvey',              // backup survey object name
      BACKUP_ELECTION: 'backupElection',          // backup election object name
      CANVASS_RESULT: 'canvassResults',           // canvass results object name
      SURVEY_QUESTIONS: 'surveyQuestions',        // survey questions object name

      ASSIGNED_ADDR: 'assignedAddr',              // all addresses assigned to canvass
      UNASSIGNED_ADDR: 'unassignedAddr',          // addresses not assigned to canvass
      ASSIGNED_CANVASSER: 'assignedCanvasser',    // all canvassers assigned to canvass
      UNASSIGNED_CANVASSER: 'unassignedCanvasser',// canvassers not assigned to canvass
      ALLOCATED_ADDR: 'allocatedAddr',            // addresses allocated to canvassers in canvass
      ALLOCATED_CANVASSER: 'allocatedCanvasser',  // canvassers with allocated allocated addresses in canvass
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
;
