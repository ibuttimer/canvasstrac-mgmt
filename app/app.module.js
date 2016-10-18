/*jslint node: true */
'use strict';

angular.module('canvassTrac', ['ct.config', 'ui.router', 'ngResource', 'ui.bootstrap', 'NgDialogUtil', 'ct.clientCommon'])

  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      // route for the home page
      .state('app', {
        url: '/',
        views: {
          'header': {
            templateUrl : 'layout/header.html',
            controller  : 'HeaderController'
          },
          'content': {
            templateUrl : 'views/home.html',
//            controller  : 'IndexController'
          },
          'footer': {
            templateUrl : 'layout/footer.html'
          }
        }
      })

      // route for the aboutus page
      .state('app.aboutus', {
        url: 'aboutus',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the new voting systems page
      .state('app.cfg', {
        url: 'cfg',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the voting systems page
      .state('app.cfg.votingsystems', {
        url: '/votingsystems',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the new voting systems page
      .state('app.cfg.newvotingsystem', {
        url: '/newvotingsystem',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the roles page
      .state('app.cfg.roles', {
        url: '/roles',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the new role page
      .state('app.cfg.newrole', {
        url: '/newrole',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the users page
      .state('app.cfg.users', {
        url: '/users',
        views: {
          'content@': {
            templateUrl : 'users/userdash.html',
            controller  : 'UserController'
          }
        }
      })

      // route for the view user page
      .state('app.cfg.viewuser', {
        url: '/viewuser/:id',
        views: {
          'content@': {
            templateUrl : 'users/newuser.html',
            controller  : 'UserController'
          }
        }
      })

      // route for the edit user page
      .state('app.cfg.edituser', {
        url: '/edituser/:id',
        views: {
          'content@': {
            templateUrl : 'users/newuser.html',
            controller  : 'UserController'
          }
        }
      })

      // route for the new user page
      .state('app.cfg.newuser', {
        url: '/newuser',
        views: {
          'content@': {
            templateUrl : 'users/newuser.html',
            controller  : 'UserController'
          }
        }
      })

      // route for the elections page
      .state('app.campaign', {
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
      .state('app.campaign.elections', {
        url: '/elections',
        views: {
          'content@': {
            templateUrl : 'elections/electiondash.html',
            controller  : 'ElectionController'
          }
        }
      })

      // route for the view election page
      .state('app.campaign.viewelection', {
        url: '/viewelection/:id',
        views: {
          'content@': {
            templateUrl : 'elections/newelection.html',
            controller  : 'ElectionController'
          }
        }
      })

      // route for the edit election page
      .state('app.campaign.editelection', {
        url: '/editelection/:id',
        views: {
          'content@': {
            templateUrl : 'elections/newelection.html',
            controller  : 'ElectionController'
          }
        }
      })

      // route for the new election page
      .state('app.campaign.newelection', {
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
      .state('app.campaign.candidates', {
        url: '/candidates',
        views: {
          'content@': {
            templateUrl : 'views/aboutus.html',
            controller  : 'AboutController'
          }
        }
      })

      // route for the new candidate page
      .state('app.campaign.newcandidate', {
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
      .state('app.campaign.canvass', {
        url: '/canvass',
        views: {
          'content@': {
            templateUrl : 'canvasses/canvassdash.html',
            controller  : 'CanvassDashController'
          }
        }
      })

      // route for the view election page
      .state('app.campaign.viewcanvass', {
        url: '/viewcanvass/:id',
        views: {
          'content@': {
            templateUrl : 'canvasses/newcanvass.html',
            controller  : 'CanvassController'
          }
        }
      })

      // route for the edit election page
      .state('app.campaign.editcanvass', {
        url: '/editcanvass/:id',
        views: {
          'content@': {
            templateUrl : 'canvasses/newcanvass.html',
            controller  : 'CanvassController'
          }
        }
      })


      // route for the new canvass page
      .state('app.campaign.newcanvass', {
        url: '/newcanvass',
        views: {
          'content@': {
            templateUrl : 'canvasses/newcanvass.html',
            controller  : 'CanvassController'
          }
        }
      })

      /* ^^^^ Canvasses ^^^^ */

      .state('app.login', {
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
      .state('app.contactus', {
        url: 'contactus',
        views: {
          'content@': {
            templateUrl : 'views/contactus.html',
            controller  : 'ContactController'
          }
        }
      });

    $urlRouterProvider.otherwise('/');
  });
