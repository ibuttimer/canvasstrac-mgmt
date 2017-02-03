/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac', ['ct.config', 'ui.router', 'ngResource', 'ngCordova', 'ui.bootstrap', 'NgDialogUtil', 'ct.clientCommon', 'chart.js'])

  .config(function ($stateProvider, $urlRouterProvider, STATES, MENUS) {

    var appPath = '/',
      otherwisePath = appPath,
      routes = [
        { state: STATES.CONFIG,
          config: {
            url: 'cfg',
            views: {
              'content@': {
                templateUrl : 'layout/submenu.page.html',
                controller  : 'SubmenuPageController',
                resolve: {
                  SUBMENU: function (MENUS) {
                    return MENUS.CONFIG;
                  }
                }
              }
            }
          }
        },
        { state: STATES.VOTINGSYS,
          config: {
            url: '/votingsystems',
            views: {
              'content@': {
                templateUrl : 'views/aboutus.html',
                controller  : 'AboutController'
              }
            }
          }
        },
        { state: STATES.VOTINGSYS_NEW,
          config: {
            url: '/newvotingsystem',
            views: {
              'content@': {
                templateUrl : 'views/aboutus.html',
                controller  : 'AboutController'
              }
            }
          }
        },
        { state: STATES.ROLES,
          config: {
            url: '/roles',
            views: {
              'content@': {
                templateUrl : 'views/aboutus.html',
                controller  : 'AboutController'
              }
            }
          }
        },
        { state: STATES.ROLES_NEW,
          config: {
            url: '/newrole',
            views: {
              'content@': {
                templateUrl : 'views/aboutus.html',
                controller  : 'AboutController'
              }
            }
          }
        },
        { state: STATES.USERS,
          config: {
            url: '/users',
            views: {
              'content@': {
                templateUrl : 'users/userdash.html',
                controller  : 'UserController'
              }
            }
          }
        },
        { state: STATES.USERS_VIEW,
          config: {
            url: '/viewuser/:id',
            views: {
              'content@': {
                templateUrl : 'users/newuser.html',
                controller  : 'UserController'
              }
            }
          }
        },
        { state: STATES.USERS_EDIT,
          config: {
            url: '/edituser/:id',
            views: {
              'content@': {
                templateUrl : 'users/newuser.html',
                controller  : 'UserController'
              }
            }
          }
        },
        { state: STATES.USERS_NEW,
          config: {
            url: '/newuser',
            views: {
              'content@': {
                templateUrl : 'users/newuser.html',
                controller  : 'UserController'
              }
            }
          }
        },
        { state: STATES.CAMPAIGN,
          config: {
            url: 'campaign',
            views: {
              'content@': {
                templateUrl : 'layout/submenu.page.html',
                controller  : 'SubmenuPageController',
                resolve: {
                  SUBMENU: function (MENUS) {
                    return MENUS.CAMPAIGN;
                  }
                }
              }
            }
          }
        },
        { state: STATES.ELECTION,
          config: {
            url: '/elections',
            views: {
              'content@': {
                templateUrl : 'elections/electiondash.html',
                controller  : 'ElectionController'
              }
            }
          }
        },
        { state: STATES.ELECTION_VIEW,
          config: {
            url: '/viewelection/:id',
            views: {
              'content@': {
                templateUrl : 'elections/newelection.html',
                controller  : 'ElectionController'
              }
            }
          }
        },
        { state: STATES.ELECTION_EDIT,
          config: {
            url: '/editelection/:id',
            views: {
              'content@': {
                templateUrl : 'elections/newelection.html',
                controller  : 'ElectionController'
              }
            }
          }
        },
        { state: STATES.ELECTION_NEW,
          config: {
            url: '/newelection',
            views: {
              'content@': {
                templateUrl : 'elections/newelection.html',
                controller  : 'ElectionController'
              }
            }
          }
        },
        { state: STATES.CANDIDATE,
          config: {
            url: '/candidates',
            views: {
              'content@': {
                templateUrl : 'views/aboutus.html',
                controller  : 'AboutController'
              }
            }
          }
        },
        { state: STATES.CANDIDATE_NEW,
          config: {
            url: '/newcandidate',
            views: {
              'content@': {
                templateUrl : 'views/aboutus.html',
                controller  : 'AboutController'
              }
            }
          }
        },
        { state: STATES.CANVASS,
          config: {
            url: '/canvass',
            views: {
              'content@': {
                templateUrl : 'canvasses/canvassdash.html',
                controller  : 'CanvassDashController'
              }
            }
          }
        },
        { state: STATES.CANVASS_VIEW,
          config: {
            url: '/viewcanvass/:id',
            views: {
              'content@': {
                templateUrl : 'canvasses/newcanvass.html',
                controller  : 'CanvassController'
              }
            }
          }
        },
        { state: STATES.CANVASS_EDIT,
          config: {
            url: '/editcanvass/:id',
            views: {
              'content@': {
                templateUrl : 'canvasses/newcanvass.html',
                controller  : 'CanvassController'
              }
            }
          }
        },
        { state: STATES.CANVASS_NEW,
          config: {
            url: '/newcanvass',
            views: {
              'content@': {
                templateUrl : 'canvasses/newcanvass.html',
                controller  : 'CanvassController'
              }
            }
          }
        }
      ];

    $stateProvider
      // route for the home page
      .state(STATES.APP, {
        url: appPath,
        views: {
          'header': {
            templateUrl : 'layout/header.html',
            controller  : 'HeaderController'
          },
          'content': {
            templateUrl : 'views/home.html'
          },
          'footer': {
            templateUrl : 'layout/footer.html',
            controller  : 'FooterController'
          }
        }
      })

      // route for the aboutus page
      .state(STATES.ABOUTUS, {
        url: 'aboutus',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      .state(STATES.LOGIN, {
        url: 'login',
        onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
          
          $uibModal.open({
            templateUrl: 'login/login.html',
            controller: 'LoginController'
          }).result.finally(function () {
            $state.go('^');   // go to parent state
          });
        }]
      })
    
      // route for the contactus page
      .state(STATES.CONTACTUS, {
        url: 'contactus',
        views: {
          'content@': {
            templateUrl : 'views/contactus.html',
            controller  : 'ContactController'
          }
        }
      });

    routes.forEach(function (route) {
      if (!STATES.ISDISABLED(route.state)) {
        $stateProvider.state(route.state, route.config);
      }
    });

    $urlRouterProvider.otherwise(otherwisePath);
  });
