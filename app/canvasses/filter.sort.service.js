/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .service('filterSortService', filterSortService);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

filterSortService.$inject = ['miscUtilFactory', 'DECOR'];

function filterSortService (miscUtilFactory, DECOR) {

  var all = 0x01,
    filter = 0x02,
    clear = 0x04;

  /*jshint validthis:true */
  this.ALL = all;
  this.FILTER = filter;
  this.CLEAR = clear;
  this.ALL_FILTER_CLEAR = all | filter | clear;
  this.FILTER_CLEAR = filter | clear;
  this.ALL_FILTER = all | filter;
  this.ALL_CLEAR = all | clear;

  this.getRequestButtons = function (name, btns) {
    var buttons = [
      { txt: 'All', cmd: 'a', icon: 'fa fa-list-alt fa-fw', tip: 'Request all ' + name,
        class: 'btn btn-primary' },
      { txt: 'Filter', cmd: 'f', icon: 'fa fa-filter fa-fw', tip: 'Filter ' + name,
        class: 'btn btn-info' },
      { txt: 'Clear', cmd: 'c', icon: 'fa fa-eraser fa-fw', tip: 'Clear '  + name + ' list',
        class: 'btn btn-warning' }
    ],
    reqButtons = [];

    for (var i = 0, mask = all; mask <= clear; mask <<= 1, ++i) {
      if ((btns & mask) !== 0) {
        reqButtons.push(buttons[i]);
      }
    }

    return reqButtons;
  };

  this.getSelectButtons = function () {
    return [
      { txt: 'All', cmd: miscUtilFactory.SET_SEL, icon: DECOR.SEL.icon, tip: 'Select all in list',
        class: DECOR.SEL.class },
      { txt: 'Clear', cmd: miscUtilFactory.CLR_SEL, icon: DECOR.UNSEL.icon, tip: 'Unselect all in list',
        class: DECOR.UNSEL.class },
      { txt: 'Invert', cmd: miscUtilFactory.TOGGLE_SEL, icon: 'fa fa-exchange fa-rotate-90 fa-fw', tip: 'Invert selection',
        class: 'btn btn-default' }
    ];
  };

  /* function implementation
  -------------------------- */

}





