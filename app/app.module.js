/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac', ['ct.config', 'ui.router', 'ngResource', 'ngCordova', 'ui.bootstrap', 'NgDialogUtil', 'ct.clientCommon', 'chart.js'])

  .config(['$stateProvider', '$urlRouterProvider', 'STATES', 'MENUS', function ($stateProvider, $urlRouterProvider, STATES, MENUS) {

    var getUrl = function (state, param) {
        var splits = state.split('.'),
          url = '';
        if (splits.length > 2) {
          url += '/';
        } // 2nd level doesn't need preceeding '/' as app path is only '/'
        url += splits[splits.length - 1];
        if (param) {
          url += '/' + param;
        }
        return url;
      },
      appPath = '/',
      otherwisePath = appPath,
      routes = [
        { state: STATES.CONFIG,
          config: {
            url: getUrl(STATES.CONFIG),
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
            url: getUrl(STATES.VOTINGSYS),
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
            url: getUrl(STATES.VOTINGSYS_NEW),
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
            url: getUrl(STATES.ROLES),
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
            url: getUrl(STATES.ROLES_NEW),
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
            url: getUrl(STATES.USERS),
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
            url: getUrl(STATES.USERS_VIEW, ':id'),
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
            url: getUrl(STATES.USERS_EDIT, ':id'),
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
            url: getUrl(STATES.USERS_NEW),
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
            url: getUrl(STATES.CAMPAIGN),
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
            url: getUrl(STATES.ELECTION),
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
            url: getUrl(STATES.ELECTION_VIEW, ':id'),
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
            url: getUrl(STATES.ELECTION_EDIT, ':id'),
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
            url: getUrl(STATES.ELECTION_NEW),
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
            url: getUrl(STATES.CANDIDATE),
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
            url: getUrl(STATES.CANDIDATE_NEW),
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
            url: getUrl(STATES.CANVASS),
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
            url: getUrl(STATES.CANVASS_VIEW, ':id'),
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
            url: getUrl(STATES.CANVASS_EDIT, ':id'),
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
            url: getUrl(STATES.CANVASS_NEW),
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
        url: getUrl(STATES.ABOUTUS),
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      .state(STATES.LOGIN, {
        url: getUrl(STATES.LOGIN),
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
        url: getUrl(STATES.CONTACTUS),
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
  }]);
