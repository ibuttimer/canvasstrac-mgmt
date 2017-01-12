/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac', ['ct.config', 'ui.router', 'ngResource', 'ngCordova', 'ui.bootstrap', 'NgDialogUtil', 'ct.clientCommon'])

  .config(function ($stateProvider, $urlRouterProvider, STATES) {

    var appPath = '/',
      otherwisePath = appPath;

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
            templateUrl : 'layout/footer.html'
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

      // route for the new voting systems page
      .state(STATES.CONFIG, {
        url: 'cfg',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

    /* TODO voting systems config
      // route for the voting systems page
      .state(STATES.VOTINGSYS, {
        url: '/votingsystems',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the new voting systems page
      .state(STATES.VOTINGSYS_NEW, {
        url: '/newvotingsystem',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })
    */

    /* TODO roles config
      // route for the roles page
      .state(STATES.ROLES, {
        url: '/roles',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the new role page
      .state(STATES.ROLES_NEW, {
        url: '/newrole',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })
    */

      // route for the users page
      .state(STATES.USERS, {
        url: '/users',
        views: {
          'content@': {
            templateUrl : 'users/userdash.html',
            controller  : 'UserController'
          }
        }
      })

      // route for the view user page
      .state(STATES.USERS_VIEW, {
        url: '/viewuser/:id',
        views: {
          'content@': {
            templateUrl : 'users/newuser.html',
            controller  : 'UserController'
          }
        }
      })

      // route for the edit user page
      .state(STATES.USERS_EDIT, {
        url: '/edituser/:id',
        views: {
          'content@': {
            templateUrl : 'users/newuser.html',
            controller  : 'UserController'
          }
        }
      })

      // route for the new user page
      .state(STATES.USERS_NEW, {
        url: '/newuser',
        views: {
          'content@': {
            templateUrl : 'users/newuser.html',
            controller  : 'UserController'
          }
        }
      })

      // route for the elections page
      .state(STATES.CAMPAIGN, {
        url: 'campaign',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      /* vvvv ELections vvvv */

      // route for the elections page
      .state(STATES.ELECTION, {
        url: '/elections',
        views: {
          'content@': {
            templateUrl : 'elections/electiondash.html',
            controller  : 'ElectionController'
          }
        }
      })

      // route for the view election page
      .state(STATES.ELECTION_VIEW, {
        url: '/viewelection/:id',
        views: {
          'content@': {
            templateUrl : 'elections/newelection.html',
            controller  : 'ElectionController'
          }
        }
      })

      // route for the edit election page
      .state(STATES.ELECTION_EDIT, {
        url: '/editelection/:id',
        views: {
          'content@': {
            templateUrl : 'elections/newelection.html',
            controller  : 'ElectionController'
          }
        }
      })

      // route for the new election page
      .state(STATES.ELECTION_NEW, {
        url: '/newelection',
        views: {
          'content@': {
            templateUrl : 'elections/newelection.html',
            controller  : 'ElectionController'
          }
        }
      })

      /* ^^^^ ELections ^^^^ */
      /* vvvv Candidates vvvv */

      // route for the candidates page
      .state(STATES.CANDIDATE, {
        url: '/candidates',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the new candidate page
      .state(STATES.CANDIDATE_VIEW, {
        url: '/newcandidate',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      /* ^^^^ Candidates ^^^^ */
      /* vvvv Canvasses vvvv */

      // route for the canvass page
      .state(STATES.CANVASS, {
        url: '/canvass',
        views: {
          'content@': {
            templateUrl : 'canvasses/canvassdash.html',
            controller  : 'CanvassDashController'
          }
        }
      })

      // route for the view election page
      .state(STATES.CANVASS_VIEW, {
        url: '/viewcanvass/:id',
        views: {
          'content@': {
            templateUrl : 'canvasses/newcanvass.html',
            controller  : 'CanvassController'
          }
        }
      })

      // route for the edit election page
      .state(STATES.CANVASS_EDIT, {
        url: '/editcanvass/:id',
        views: {
          'content@': {
            templateUrl : 'canvasses/newcanvass.html',
            controller  : 'CanvassController'
          }
        }
      })


      // route for the new canvass page
      .state(STATES.CANVASS_NEW, {
        url: '/newcanvass',
        views: {
          'content@': {
            templateUrl : 'canvasses/newcanvass.html',
            controller  : 'CanvassController'
          }
        }
      })

      /* ^^^^ Canvasses ^^^^ */

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

    $urlRouterProvider.otherwise(otherwisePath);
  });
