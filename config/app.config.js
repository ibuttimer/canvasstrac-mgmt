/*jslint node: true */
/*global angular */
'use strict';

angular.module('ct.config', [])

  .constant('baseURL', '@@baseURL:@@basePort/')
  .constant('apiKey', '@@apiKey')
  .constant('STATES', (function () {
    var cfgState = 'app.cfg',
      campaignState = 'app.campaign',
      stateConstant = {
        APP: 'app',
        ABOUTUS: 'app.aboutus',

        CONFIG: cfgState,
        VOTINGSYS: cfgState + '.votingsystems',
        VOTINGSYS_VIEW: cfgState + '.viewvotingsystem',
        VOTINGSYS_EDIT: cfgState + '.editvotingsystem',
        VOTINGSYS_NEW: cfgState + '.newvotingsystem',

        ROLES: cfgState + '.roles',
        ROLES_VIEW: cfgState + '.viewrole',
        ROLES_EDIT: cfgState + '.editrole',
        ROLES_NEW: cfgState + '.newrole',

        USERS: cfgState + '.users',
        USERS_VIEW: cfgState + '.viewuser',
        USERS_EDIT: cfgState + '.edituser',
        USERS_NEW: cfgState + '.newuser',

        CAMPAIGN: campaignState,
        ELECTION: campaignState + '.elections',
        ELECTION_VIEW: campaignState + '.viewelection',
        ELECTION_EDIT: campaignState + '.editelection',
        ELECTION_NEW: campaignState + '.newelection',

        CANDIDATE: campaignState + '.candidates',
        CANDIDATE_VIEW: campaignState + '.viewcandidate',
        CANDIDATE_EDIT: campaignState + '.editcandidate',
        CANDIDATE_NEW: campaignState + '.newcandidate',

        CANVASS: campaignState + '.canvass',
        CANVASS_VIEW: campaignState + '.viewcanvass',
        CANVASS_EDIT: campaignState + '.editcanvass',
        CANVASS_NEW: campaignState + '.newcanvass',

        LOGIN: 'app.login',
        CONTACTUS: 'app.contactus'
      },
      disabledStates = [
        // add entries to disbale a state and any substates
        stateConstant.VOTINGSYS,
        stateConstant.ROLES
      ];

    stateConstant.ISDISABLED = function (state) {
      var disabled = true,  // everythimg disabled by default
        properties = Object.getOwnPropertyNames(stateConstant),
        i, j;
      for (i = 0; i < properties.length; ++i) {
        if (stateConstant[properties[i]] === state) {
          disabled = false; // valid state, enabled by default
          for (j = 0; j < properties.length; ++j) {
            if (state.indexOf(disabledStates[j]) === 0) {
              return true;  // its or a parent is disabled
            }
          }
        }
      }
      return disabled;
    };

    return stateConstant;
  })())
  .constant('CONFIG', (function () {
    return {
      DEV_MODE: @@DEV_MODE,  // flag to enable dev mode hack/shortcuts etc.
      DEV_USER: '@@DEV_USER',
      DEV_PASSWORD: '@@DEV_PASSWORD'
    };
  })())
  .constant('DBG', (function () {
    return {
      // debug enable flags
      storeFactory: false,
      localStorage: false,
      surveyFactory: true,
      canvassFactory: true,
      electionFactory: true,
      CanvassController: true,
      CanvassActionController: true,
      SurveyController: true,
      navService: true,

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
      CANVASS_RESULT:  'canvassResults',          // canvass results object name
      CANVASS_QUESTIONS:  'canvassQuestions',     // canvass questions object name

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
