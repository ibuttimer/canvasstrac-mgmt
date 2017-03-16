/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .factory('stateFactory', stateFactory);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

stateFactory.$inject = ['$state', 'STATES', 'MENUS'];

function stateFactory ($state, STATES, MENUS) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  var factory = {
    addInterface: addInterface,
    stateIs: stateIs,
    stateIsNot: stateIsNot,
    stateIncludes: stateIncludes,
    stateIsOneOf: stateIsOneOf,
    stateIsNotOneOf: stateIsNotOneOf,
    inSubstate: inSubstate,
    stateHref: stateHref
  };
  
  return factory;

  /* function implementation
    -------------------------- */

  function addInterface (scope) {
    for (var prop in factory) {
      if (prop !== 'addInterface') {
        scope[prop] = factory[prop];
      }
    }
  }

  function stateIs(curstate) {
    return $state.is(curstate);
  }

  function stateIsNot(curstate) {
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

  function inSubstate (state) {
    var properties = Object.getOwnPropertyNames(MENUS),
      issub = false;
    for (var i = 0; (i < properties.length) && !issub; ++i) {
      var entry = MENUS[properties[i]].root;
      if (entry) {
        if (entry.sref === state) {
          for (var j = 0; (j < entry.substates.length) && !issub; ++j) {
            issub = $state.is(entry.substates[j]);
          }
        }
      }
    }
    return issub;
  }

  /**
   * A url generation method that returns the compiled url for the given state
   * populated with the given params.
   * @see https://ui-router.github.io/ng1/docs/0.3.1/index.html#/api/ui.router.state.$state
   * @param   {string|object} stateOrName The state name or state object you'd like to generate a url from.
   * @param   {object}        params      An object of parameter values to fill the state's required parameters.
   * @param   {object}        options     Options object.
   * @returns {string}        compiled state url
   */
  function stateHref (stateOrName, params, options) {
    return $state.href(stateOrName, params, options);
  }
}
