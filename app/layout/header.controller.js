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
  .config(['$provide', 'MENUS', 'STATES', 'ACCESS', 'CONFIG', function ($provide, MENUS, STATES, ACCESS, CONFIG) {
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
      accessAllRead = { group: 'a', privilege: 'r' },
      access1Read = { group: '1', privilege: 'r' },
      access1Update = { group: '1', privilege: 'u' },
      access1Create = { group: '1', privilege: 'c' },

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
              property: ACCESS.VOTINGSYS,  // NOTE: matches access property in login response
              value: {
                header: votingSysDash,
                items: [
                  { name: votingSysDash, sref: STATES.VOTINGSYS },
                  { name: dropdownNew, sref: STATES.VOTINGSYS_NEW }
                ]
              }
            },
            { sref: STATES.ROLES,
              property: ACCESS.ROLES,  // NOTE: matches access property in login response
              value: {
                header: rolesDash,
                items: [
                  { name: rolesDash, sref: STATES.ROLES },
                  { name: dropdownNew, sref: STATES.ROLES_NEW }
                ]
              }
            },
            { sref: STATES.USERS,
              property: ACCESS.USERS,  // NOTE: matches access property in login response
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
              property: ACCESS.ELECTIONS,  // NOTE: matches access property in login response
              value: {
                header: electionDash,
                items: [
                  { name: electionDash, sref: STATES.ELECTION },
                  { name: dropdownNew, sref: STATES.ELECTION_NEW }
                ]
              }
            },
            { sref: STATES.CANDIDATE,
              property: ACCESS.CANDIDATES,  // NOTE: matches access property in login response
              value: {
                header: candidateDash,
                items: [
                  { name: candidateDash, sref: STATES.CANDIDATE },
                  { name: dropdownNew, sref: STATES.CANDIDATE_NEW }
                ]
              }
            },
            { sref: STATES.CANVASS,
              property: ACCESS.CANVASSES,  // NOTE: matches access property in login response
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
            self.root.substates.push({
              state: entry.state,
              access: entry.access
            });
          }
        }
      };
    };
    // start with basic entries
    tree = [
      { state: STATES.APP, name: 'Home' },
      { state: STATES.ABOUTUS, name: 'About' },
      { state: STATES.CONTACTUS, name: 'Contact' }
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
          { state: STATES.ELECTION, name: electionDash, access: accessAllRead },
          { state: STATES.ELECTION_VIEW, name: 'View Election', access: access1Read },
          { state: STATES.ELECTION_EDIT, name: 'Update Election', access: access1Update },
          { state: STATES.ELECTION_NEW, name: 'New Election', access: access1Create }
        ]
      },
      { state: STATES.CANDIDATE, entries: [
          { state: STATES.CANDIDATE, name: candidateDash, access: accessAllRead },
          { state: STATES.CANDIDATE_VIEW, name: 'View Candidate', access: access1Read },
          { state: STATES.CANDIDATE_EDIT, name: 'Update Candidate', access: access1Update},
          { state: STATES.CANDIDATE_NEW, name: 'New Candidate', access: access1Create }
        ]
      },
      { state: STATES.CANVASS, entries: [
          { state: STATES.CANVASS, name: canvassDash, access: accessAllRead },
          { state: STATES.CANVASS_VIEW, name: 'View Canvass', access: access1Read },
          { state: STATES.CANVASS_EDIT, name: 'Update Canvass', access: access1Update },
          { state: STATES.CANVASS_NEW, name: 'New Canvass', access: access1Create }
        ]
      },
      { state: STATES.VOTINGSYS, entries: [
          { state: STATES.VOTINGSYS, name: votingSysDash, access: accessAllRead },
          { state: STATES.VOTINGSYS_VIEW, name: 'View Voting System', access: access1Read },
          { state: STATES.VOTINGSYS_EDIT, name: 'Update Voting System', access: access1Update },
          { state: STATES.VOTINGSYS_NEW, name: 'New Voting System', access: access1Create }
        ]
      },
      { state: STATES.ROLES, entries: [
          { state: STATES.ROLES, name: rolesDash, access: accessAllRead },
          { state: STATES.ROLES_VIEW, name: 'View Role', access: access1Read },
          { state: STATES.ROLES_EDIT, name: 'Update Role', access: access1Update },
          { state: STATES.ROLES_NEW, name: 'New Role', access: access1Create }
        ]
      },
      { state: STATES.USERS, entries: [
          { state: STATES.USERS, name: userDash, access: accessAllRead },
          { state: STATES.USERS_VIEW, name: 'View User', access: access1Read },
          { state: STATES.USERS_EDIT, name: 'Update User', access: access1Update },
          { state: STATES.USERS_NEW, name: 'New User', access: access1Create }
        ]
      }
    ].forEach(function (cfgBlock) {
      if (!STATES.ISDISABLED(cfgBlock.state)) {
        Array.prototype.push.apply(tree, cfgBlock.entries);

        for (prop in MENUS) {
          if (MENUS[prop].root) {
            var runner = new runnerObj(MENUS[prop].root);

            cfgBlock.entries.forEach(runner.processEntry);
          }
        }
      }
    });
    MENUS.CRUMBS = tree;

    // setup show debug flag
    if (CONFIG.DEV_MODE) {
      $provide.value('DEBUG', {
        show: true,   // enabled by default in devmode
        devmode: true // devmode
      });
    } else {
      $provide.constant('DEBUG', {
        show: false,    // disable in production
        devmode: false  // production
      });
    }
  }])
  .controller('HeaderController', HeaderController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

HeaderController.$inject = ['$scope', '$state', '$rootScope', 'Idle', 'authFactory', 'consoleService', 'stateFactory', 'NgDialogFactory', 'STATES', 'MENUS', 'USER', 'HOMESCRN', 'DEBUG', 'CONFIG'];

function HeaderController ($scope, $state, $rootScope, Idle, authFactory, consoleService, stateFactory, NgDialogFactory, STATES, MENUS, USER, HOMESCRN, DEBUG, CONFIG) {

  var con = consoleService.getLogger('HeaderController');

  $scope.status = {
    cfgIsOpen: false,
    cmpgnIsOpen: false
  };
  
  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.setLoggedIn = setLoggedIn;
  $scope.openLogin = openLogin;
  $scope.openSupport = openSupport;
  $scope.logOut = logOut;

  if (CONFIG.DEV_MODE) {
    $scope.debug = DEBUG;
    $scope.toggleDebug = toggleDebug;
    toggleDebug(DEBUG.show);
  }

  stateFactory.addInterface($scope);  // add stateFactory menthods to scope

  $scope.homeMenu = MENUS.HOME;
  $scope.aboutMenu = MENUS.ABOUT;
  $scope.contactMenu = MENUS.CONTACT;

  makeBreadcrumb();
  $scope.setLoggedIn(CONFIG.NOAUTH ? false : true);

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

  $scope.$on('IdleStart', function() {
		// the user appears to have gone idle
    log('IdleStart:');
	});

	$scope.$on('IdleWarn', function(e, countdown) {
		// follows after the IdleStart event, but includes a countdown until the user is considered timed out
		// the countdown arg is the number of seconds remaining until then.
		// you can change the title or display a warning dialog from here.
		// you can let them resume their session by calling Idle.watch()
    log('IdleWarn:', countdown);

    if (countdown === CONFIG.AUTOLOGOUTCOUNT) {
      openIdleTimeout();
    }
	});

	$scope.$on('IdleTimeout', function() {
		// timed out (meaning idleDuration + timeout has passed without any activity)
    log('IdleTimeout:');
	});

	$scope.$on('IdleEnd', function() {
		// the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
    log('IdleEnd:');
	});

	$scope.$on('Keepalive', function() {
		// do something to keep the user's session alive
    log('Keepalive:');

    doRefresh();
	});


  if (USER.authenticated) {
    // page reload, start idle watching, also starts the Keepalive service by default.
    if (!Idle.running()) {
      Idle.watch();

      var time = Math.floor(USER.sessionLength / 1000); // convert to sec
      time -= Idle.getIdle() - CONFIG.RELOADMARGIN;
      if (time < 0) {
        // session will expire before refresh event, so refresh now
        doRefresh();
      }
    }
  }


  /* function implementation
    -------------------------- */

  /**
   * Set logged in state
   * @param {boolean} loggedIn - logged in flag; false: force logged off state, true: state determined by authentication factory
   */
  function setLoggedIn(loggedIn, type) {
    var showMenus,
      override,
      doConfigMenu,
      doCampaignMenu;
    if (!loggedIn) {
      $scope.loggedIn = false;
      $scope.username = '';
      showMenus = CONFIG.NOAUTH;  // show menus if authentication disabled
      override = CONFIG.NOAUTH;   // override access check if authentication disabled
    } else {
      $scope.loggedIn = USER.authenticated;
      $scope.username = USER.username;
      showMenus = USER.authenticated;
    }
    // config menu's if need to show, or menu exists and not showing
    doConfigMenu = doCampaignMenu = showMenus;
    if (!showMenus) {
      doConfigMenu = $scope.configMenu;
      doCampaignMenu = $scope.campaignMenu;
    }
    if (doConfigMenu) {
      $scope.configMenu = configMenuAccess(MENUS.CONFIG, override);
    }
    if (doCampaignMenu) {
      $scope.campaignMenu = configMenuAccess(MENUS.CAMPAIGN, override);
    }

    if ($scope.loggedIn) {
      HOMESCRN.message = undefined;
    } else if (type === 'auto') {
      HOMESCRN.message = 'Your session has expired, please login again to continue.';
    }
  }

  function openLogin () {
    NgDialogFactory.open({ template: 'login/login.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'LoginController' });
  }

  function openSupport () {
    $state.go(STATES.SUPPORT);
  }

  function openIdleTimeout () {

    doRefresh();

    var dialog = NgDialogFactory.open({
      template: 'login/idlemodal.html',
      scope: $scope, className: 'ngdialog-theme-default',
      controller: 'IdleController',
      data: {}
    });

    dialog.closePromise.then(function (data) {
      if (!NgDialogFactory.isNgDialogCancel(data.value)) {
        // stay logged in
        Idle.watch();
      } else {
        // logout
        autoLogOut();
      }
    });
  }


  function autoLogOut() {
    log('autoLogOut:');
    logOut('auto');

    NgDialogFactory.errormessage('Session expired', 'Please login again.');
  }

  function logOut(type) {
    Idle.unwatch();
    authFactory.logout(function (/*response*/) {
      // on success
      loggedOut();
    },
    function (/*response*/) {
      // on error
      loggedOut();
    });
    $scope.setLoggedIn(false, type);
  }

  function loggedOut () {
    // stop idle watching
    if ($state.is(STATES.APP)) {
      $state.reload();
    } else {
      $state.go(STATES.APP);
    }
  }


  function doRefresh() {
    if (!$scope.refreshInProgress) {
      $scope.refreshInProgress = true;
      $scope.lastRefresh = $scope.thisRefresh;
      $scope.thisRefresh = Date.now();
      authFactory.tokenRefresh(function () {
        // on success
        $scope.refreshInProgress = false;
        log('refresh ok:', ($scope.thisRefresh - $scope.lastRefresh));
      },
      function (/*response*/) {
        // on failure
        $scope.refreshInProgress = false;

        NgDialogFactory.errormessage('Session expired', 'Please login again.');
      });
    }
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

  function configMenuAccess (baseMenu, override) {
    var menu = {
      root: baseMenu.root // copy root
    },
    substate,
    count = 0;  // count of menu entries

    Object.getOwnPropertyNames(baseMenu).forEach(function (name) {
      if (name !== 'root') {
        // NOTE: name is the property value from the MENUS config phase & matches the access property in the login response
        menu[name] = {
          header: baseMenu[name].header,
          items: []
        };
        // add items to the menu if user has access
        baseMenu[name].items.forEach(function (item) {
          substate = menu.root.substates.find(function (state) {
            return (state.state === item.sref);
          });
          if (substate) {
            if (override ||
                authFactory.hasAccess(name, substate.access.group, substate.access.privilege)) {
              menu[name].items.push(item);
              ++count;
            }
          }
        });
      }
    });
    if (!count) {
      menu = undefined; // no menu items so no need for menu
    }
    return menu;
  }


  function toggleDebug (set) {
    if (set !== undefined) {
      DEBUG.show = set;
    } else {
      DEBUG.show = !DEBUG.show;
    }
    $scope.dbgText = (DEBUG.show ? 'Hide debug' : 'Show debug');
  }


  function log (title) {
    if (con.isEnabled()) {
      var args = Array.prototype.slice.call(arguments, 1);
      con.debug(title, Date.now(), args.concat(' '));
    }
  }

}
