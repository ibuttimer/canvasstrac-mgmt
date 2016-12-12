/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .constant('UTIL', (function() {
    return {
      SET_SEL: 's',
      CLR_SEL: 'c',
      TOGGLE_SEL: 't'

    };
  })())

  .factory('utilFactory', utilFactory);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

utilFactory.$inject = ['$rootScope', 'miscUtilFactory', 'UTIL'];

function utilFactory ($rootScope, miscUtilFactory, UTIL) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  var factory = {
    formatDate: formatDate,
    initSelected: initSelected,
    setSelected: setSelected,
    getSelectedList: getSelectedList,
    toggleSelection: toggleSelection,
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
   * Initialise the 'selected' property of all objects in an array
   * @param {Array}    list     Array of objects to initialise
   * @param {function} callback Optional function to call with each element
   */
  function initSelected(list, callback) {
    return setSelected(list, UTIL.CLR_SEL, callback);
  }
  
  /**
   * Set the 'selected' state of all the entries in the array
   * @param {Array}    list     Array to set
   * @param {boolean}  set      Value to set; one of UTIL.SET_SEL, UTIL.CLR_SEL or UTIL.TOGGLE_SEL
   * @param {function} callback Optional function to call with each element
   */
  function setSelected(list, set, callback) {
    var selCount = 0;
    if (list) {
      var forceSet = (set === UTIL.SET_SEL),
        forceClr = (set === UTIL.CLR_SEL),
        toggle = (set === UTIL.TOGGLE_SEL);
      if (forceSet || forceClr || toggle) {
        angular.forEach(list, function (entry) {
          if (forceSet || (toggle && !entry.isSelected)) {
            entry.isSelected = true;
          } else if (entry.isSelected) {
            delete entry.isSelected;
          }
          if (entry.isSelected) {
            ++selCount;
          }
          if (callback) {
            callback(entry);
          }
        });
      }
    }
    return selCount;
  }
  
  /**
   * Return an array of 'selected' entries 
   * @param   {Array} fullList Array to extract selected items from
   * @returns {Array} Array of selected items
   */
  function getSelectedList (fullList) {
    var selectedList = [];

    angular.forEach(fullList, function (entry) {
      if (entry.isSelected) {
        selectedList.push(entry);
      }
    });
    return selectedList;
  }

  
  /**
   * Toggle an object's 'selected' state
   * @param   {object} entry Object to toggle state of
   * @param   {number} count Current selected count
   * @returns {number} Updated selected count
   */
  function toggleSelection(entry, count) {
    if (count === undefined) {
      count = 0;
    }
    if (!entry.isSelected) {
      entry.isSelected = true;
      count += 1;
    } else {
      entry.isSelected = false;
      count -= 1;
    }
    return count;
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
    // jic no native implementation is available
    miscUtilFactory.arrayPolyfill();
    
    if (typeof test !== 'function') {
      throw new TypeError('test is non-function');
    }
    if (!Array.isArray(array)) {
      throw new TypeError('array is non-array');
    }
  }
  
  
  
}
