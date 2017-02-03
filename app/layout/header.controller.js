/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .constant('MENUS', (function () {
    /* can't inject a contant into a constant but can modify (at least in angular 1.x)
       a constant in the config stage, hence this roundabout way of setting up MENUS */
    return {
      HOME: {},
      ABOUT: {},
      CONTACT: {},
      CONFIG: {},
      CAMPAIGN: {},
      CRUMBS: []
    };
  })())
  .config(function (MENUS, STATES) {
    /* Unicode code point   UTF-8 literal   html
      U+00A0	             \xc2\xa0	       &nbsp; */
    var prop,
      tree, toCheck,
      dropdownNew = '\xA0\xA0\xA0New',
      configuration = 'Configuration',
      votingSysDash = 'Voting Systems',
      rolesDash = 'Roles',
      userDash = 'Users',
      campaign = 'Campaign',
      electionDash = 'Elections',
      candidateDash = 'Candidates',
      canvassDash = 'Canvasses',

      addToTree = function (entry) {
        if (!STATES.ISDISABLED(entry.sref)) {
          tree[entry.property] = entry.value;
        }
      };

    for (prop in MENUS) {
      tree = {};
      toCheck = [];

      switch (prop) {
        case 'HOME':
          tree = {
            name: 'Home', sref: STATES.APP
          };
          break;
        case 'ABOUT':
          tree = {
            name: 'About', sref: STATES.ABOUTUS
          };
          break;
        case 'CONTACT':
          tree = {
            name: 'Contact', sref: STATES.CONTACTUS
          };
          break;
        case 'CONFIG':
          toCheck = [
            { sref: STATES.CONFIG,
              property: 'root',
              value: {
                name: configuration,
                sref: STATES.CONFIG,
                substates: []
              }
            },
            { sref: STATES.VOTINGSYS,
              property: 'votingsys',
              value: {
                header: votingSysDash,
                items: [
                  { name: votingSysDash, sref: STATES.VOTINGSYS },
                  { name: dropdownNew, sref: STATES.VOTINGSYS_NEW }
                ]
              }
            },
            { sref: STATES.ROLES,
              property: 'roles',
              value: {
                header: rolesDash,
                items: [
                  { name: rolesDash, sref: STATES.ROLES },
                  { name: dropdownNew, sref: STATES.ROLES_NEW }
                ]
              }
            },
            { sref: STATES.USERS,
              property: 'users',
              value: {
                header: userDash,
                items: [
                  { name: userDash, sref: STATES.USERS },
                  { name: dropdownNew, sref: STATES.USERS_NEW }
                ]
              }
            }
          ];
          break;
        case 'CAMPAIGN':
          toCheck = [
            { sref: STATES.CAMPAIGN,
              property: 'root',
              value: {
                name: campaign,
                sref: STATES.CAMPAIGN,
                substates: []
              }
            },
            { sref: STATES.ELECTION,
              property: 'elections',
              value: {
                header: electionDash,
                items: [
                  { name: electionDash, sref: STATES.ELECTION },
                  { name: dropdownNew, sref: STATES.ELECTION_NEW }
                ]
              }
            },
            { sref: STATES.CANDIDATE,
              property: 'candidates',
              value: {
                header: candidateDash,
                items: [
                  { name: candidateDash, sref: STATES.CANDIDATE },
                  { name: dropdownNew, sref: STATES.CANDIDATE_NEW }
                ]
              }
            },
            { sref: STATES.CANVASS,
              property: 'canvass',
              value: {
                header: canvassDash,
                items: [
                  { name: canvassDash, sref: STATES.CANVASS },
                  { name: dropdownNew, sref: STATES.CANVASS_NEW }
                ]
              }
            }
          ];
          break;
        case 'CRUMBS':
          tree = [];  // filled out once the rest are populated
          break;
        default:
          tree = undefined;
          break;
      }

      toCheck.forEach(addToTree);

      MENUS[prop] = tree;
    }

    // populate the CRUMBS property
    var runnerObj = function (root) {
      var self = this;
      self.root = root;
      self.processEntry = function (entry) {
        if (entry.state) {
          if (entry.state.indexOf(self.root.sref) === 0) {
            self.root.substates.push(entry.state);
          }
        }
      };
    };
    // start with basic entries
    tree = [
      { state: STATES.APP, name: 'Home' },
      { state: STATES.ABOUTUS, name: 'About' }
    ];
    if (!STATES.ISDISABLED(STATES.CAMPAIGN)) {
      tree.push({ state: STATES.CAMPAIGN, name: campaign });
    }
    if (!STATES.ISDISABLED(STATES.CONFIG)) {
      tree.push({ state: STATES.CONFIG, name: configuration });
    }
    // add entries from dropdown menus
    [
      { state: STATES.ELECTION, entries: [
          { state: STATES.ELECTION, name: electionDash },
          { state: STATES.ELECTION_VIEW, name: 'View Election' },
          { state: STATES.ELECTION_EDIT, name: 'Update Election' },
          { state: STATES.ELECTION_NEW, name: 'New Election' }
        ]
      },
      { state: STATES.CANDIDATE, entries: [
          { state: STATES.CANDIDATE, name: candidateDash },
          { state: STATES.CANDIDATE_VIEW, name: 'View Candidate' },
          { state: STATES.CANDIDATE_EDIT, name: 'Update Candidate' },
          { state: STATES.CANDIDATE_NEW, name: 'New Candidate' }
        ]
      },
      { state: STATES.CANVASS, entries: [
          { state: STATES.CANVASS, name: canvassDash },
          { state: STATES.CANVASS_VIEW, name: 'View Canvass' },
          { state: STATES.CANVASS_EDIT, name: 'Update Canvass' },
          { state: STATES.CANVASS_NEW, name: 'New Canvass' }
        ]
      },
      { state: STATES.VOTINGSYS, entries: [
          { state: STATES.VOTINGSYS, name: votingSysDash },
          { state: STATES.VOTINGSYS_VIEW, name: 'View Voting System' },
          { state: STATES.VOTINGSYS_EDIT, name: 'Update Voting System' },
          { state: STATES.VOTINGSYS_NEW, name: 'New Voting System' }
        ]
      },
      { state: STATES.ROLES, entries: [
          { state: STATES.ROLES, name: rolesDash },
          { state: STATES.ROLES_VIEW, name: 'View Role' },
          { state: STATES.ROLES_EDIT, name: 'Update Role' },
          { state: STATES.ROLES_NEW, name: 'New Role' }
        ]
      },
      { state: STATES.USERS, entries: [
          { state: STATES.USERS, name: userDash },
          { state: STATES.USERS_VIEW, name: 'View User' },
          { state: STATES.USERS_EDIT, name: 'Update User' },
          { state: STATES.USERS_NEW, name: 'New User' }
        ]
      }
    ].forEach(function (cfgBlock) {
      if (!STATES.ISDISABLED(cfgBlock.state)) {
        Array.prototype.push.apply(tree, cfgBlock.entries);

        for (prop in MENUS) {
          if (MENUS[prop].root) {
            let runner = new runnerObj(MENUS[prop].root);

            cfgBlock.entries.forEach(runner.processEntry);
          }
        }
      }
    });
    MENUS.CRUMBS = tree;
  })
  .controller('HeaderController', HeaderController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

HeaderController.$inject = ['$scope', '$state', '$rootScope', 'authFactory', 'stateFactory', 'NgDialogFactory', 'STATES', 'MENUS'];

function HeaderController ($scope, $state, $rootScope, authFactory, stateFactory, NgDialogFactory, STATES, MENUS) {

  $scope.status = {
    cfgIsOpen: false,
    cmpgnIsOpen: false
  };
  
  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.setLoggedIn = setLoggedIn;
  $scope.openLogin = openLogin;
  $scope.logOut = logOut;

  stateFactory.addInterface($scope);  // add stateFactory menthod to scope

  $scope.homeMenu = MENUS.HOME;
  $scope.aboutMenu = MENUS.ABOUT;
  $scope.contactMenu = MENUS.CONTACT;
  $scope.campaignMenu = MENUS.CAMPAIGN;
  $scope.configMenu = MENUS.CONFIG;


  makeBreadcrumb();
  $scope.setLoggedIn(false);

  $rootScope.$on('login:Successful', function () {
    $scope.setLoggedIn(true);
  });

  $rootScope.$on('registration:Successful', function () {
    $scope.setLoggedIn(true);
  });

  $rootScope.$on('$stateChangeSuccess',
    function (/* arguments not required so ignore
                event, toState, toParams, fromState, fromParams */){
      makeBreadcrumb();
  });


  /* function implementation
    -------------------------- */

  /**
   * Set logged in state
   * @param {boolean} loggedIn - logged in flag; false: force logged off state, true: state determined by authentication factory
   */
  function setLoggedIn(loggedIn) {
    if (!loggedIn) {
      $scope.loggedIn = false;
      $scope.username = '';
    } else {
      $scope.loggedIn = authFactory.isAuthenticated();
      $scope.username = authFactory.getUsername();
    }
  }

  function openLogin() {
    NgDialogFactory.open({ template: 'login/login.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'LoginController' });
  }

  function logOut() {
    authFactory.logout(function (response) {
      $state.go('app');
    });
    $scope.setLoggedIn(false);
  }

  function makeBreadcrumb () {
    var breadcrumb = [],
      entry;

    MENUS.CRUMBS.forEach(function (crumb) {
      entry = makeCrumb(crumb.state, crumb.name);
      if (entry) {
        breadcrumb.push(entry);
      }
    });

    $scope.breadcrumb = breadcrumb;
  }

  /**
   * Make a breadcrumb entry
   * @param   {string}           state State entry should represent
   * @param   {string}           name  Display name
   * @returns {object|undefined} Crumb object or undefined if nothing to include
   */
  function makeCrumb (state, name) {
    var crumb = { name: name };

    crumb.active = stateFactory.stateIncludes(state);
    if (crumb.active) {
      if (stateFactory.stateIs(state)) {
        crumb.active = false;   // current state so link not active
      } else {
        crumb.href = stateFactory.stateHref(state);
      }
    } else {
      if (!stateFactory.stateIs(state)) {
        crumb = undefined;  // not paer of current tree so forget
      }
    }
    return crumb;
  }



}
