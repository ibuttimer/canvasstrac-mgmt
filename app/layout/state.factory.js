/*jslint node: true */
'use strict';

var cfgMenu = ['app.cfg.votingsystems', 'app.cfg.newvotingsystem', 'app.cfg.roles', 'app.cfg.newrole',
              'app.cfg.users', 'app.cfg.newuser'],
    campaignMenu = ['app.campaign.elections', 'app.campaign.newelection', 'app.campaign.candidates', 'app.campaign.newcandidate',
                    'app.campaign.canvass', 'app.campaign.newcanvass'];

angular.module('canvassTrac')

  .factory('stateFactory', stateFactory);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

stateFactory.$inject = ['$state'];

function stateFactory ($state) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  var factory = {
    stateIs: stateIs,
    stateIsNot: stateIsNot,
    stateIncludes: stateIncludes,
    stateIsOneOf: stateIsOneOf,
    stateIsNotOneOf: stateIsNotOneOf,
    menuStateIs: menuStateIs
  };
  
  return factory;

  /* function implementation
    -------------------------- */

  function stateIs(curstate) {
//    console.log('stateIs',curstate,$state.current.name);
    return $state.is(curstate);
  }

  function stateIsNot(curstate) {
//    console.log('stateIsNot',curstate,$state.current.name);
    return !$state.is(curstate);
  }

  function stateIncludes(curstate) {
    return $state.includes(curstate);
  }

  function stateIsOneOf(states) {
    var isoneof = false;
    for (var i = 0; i < states.length; ++i) {
      if ($state.is(states[i])) {
        isoneof = true;
        break;
      }
    }
    return isoneof;
  }

  function stateIsNotOneOf(states) {
    return !stateIsOneOf(states);
  }

  function menuStateIs(curmenu) {
    var result = false,
      menu,
      i;
    switch (curmenu) {
      case 'app.cfg':
        menu = cfgMenu;
        break;
      case 'app.campaign':
        menu = campaignMenu;
        break;
      default:
        menu = [];
        break;
    }
    for (i = menu.length - 1; (i >= 0) && !result; --i) {
      result = $state.is(menu[i]);
    }
    return result;
  }


}
