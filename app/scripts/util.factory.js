/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .constant('UTIL', (function() {
    var and = 'And',
      or = 'Or';
    return {
      OP_AND: and,
      OP_OR: or,
      OP_LIST: [and, or]
    };
  })())

  .factory('utilFactory', utilFactory);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

utilFactory.$inject = ['$rootScope', 'miscUtilFactory'];

function utilFactory ($rootScope, miscUtilFactory) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  var factory = {
    formatDate: formatDate,
    arrayAdd: arrayAdd,
    arrayRemove: arrayRemove
  };
  
  return factory;

  /* function implementation
    -------------------------- */

  function formatDate (date) {
    return new Date(date).toDateString();
  }

  /**
   * Add item(s) to an array based on the result of a test function
   * @throws {TypeError} Thrown when incorrect arguments provided
   * @param   {Array}        array                              Array to add to
   * @param   {Array|object} add                                Object to add, or array of objects to individually add
   * @param   {function}     [test=function (array, element) {}] Test function returning true if object should be added
   * @returns {number}  Number of elements added
   */
  function arrayAdd(array, add, test) {
    return arrayFxn('add', array, add, test) ;
  }
  
  /**
   * Remove item(s) from an array based on the result of a test function
   * @throws {TypeError} Thrown when incorrect arguments provided
   * @param   {Array}        array                              Array to remove from
   * @param   {Array|object} remove                             Object to remove, or array of objects to individually remove
   * @param   {function}     [test=function (array, element) {}] Test function returning true if object should be removed
   * @returns {number}  Number of elements removed
   */
  function arrayRemove(array, remove, test) {
    return arrayFxn('remove', array, remove, test) ;
  }
  
  /**
   * Add/remove item(s) to/from an array based on the result of a test function
   * @throws {TypeError} Thrown when incorrect arguments provided
   * @throws {Error} Thrown when unrecognised action
   * @param   {string}   action                              Action to perform
   * @param   {Array}    array                               Array to work on
   * @param   {Array|object} subject                         Object, or array of objects to individually perform action for
   * @param   {function} [test=function (array, element) {}] Test function returning true if action should be performed
   * @returns {number}  Number of elements added/removed
   */
  function arrayFxn(action, array, subject, test) {
    if (typeof test === 'undefined') {
      test = function () {
        return true;  // do action
      };
    }
    arrayFxnTests(array, test);
    var count = 0,
      actionFxn;

    if (action === 'add') {
      actionFxn = function (element) {
        array.push(element);
      };
    } else if (action === 'remove') {
      actionFxn = function (element) {
        var idx = array.findIndex(function (ele) {
          return (element === ele);
        });
        if (idx >= 0) {
          array.splice(idx, 1);
        }
      };
    } else {
      throw new Error('Unknown action: ' + action);
    }
    
    if (Array.isArray(subject)) {
      subject.forEach(function (element) {
        if (test(array, element)) {
          actionFxn(element);
          ++count;
        }
      });
    } else {
      if (test(array, subject)) {
        actionFxn(subject);
        ++count;
      }
    }
    return count;
  }
  
  function arrayFxnTests(array, test) {
    if (typeof test !== 'function') {
      throw new TypeError('test is non-function');
    }
    if (!Array.isArray(array)) {
      throw new TypeError('array is non-array');
    }
  }
  
  
  
}
