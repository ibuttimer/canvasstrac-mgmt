/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('NoticeDashController', NoticeDashController)

  .filter('filterDashNotice', ['UTIL', function (UTIL) {
    return function (input, title, op, level) {

      if (!op) {
        op = UTIL.OP_OR;
      }
      var out = [];
      if (title || angular.isNumber(level)) {
        // filter by title & level values
        var titleLwr;
        if (title) {
          titleLwr = title.toLowerCase();
        }
        angular.forEach(input, function (notice) {
          var titleOk,
            levelOk = (notice.level === level);

          if (title) {
            titleOk = (notice.title.toLowerCase().indexOf(titleLwr) >= 0);
          } else {
            titleOk = false;
          }
          if (((op === UTIL.OP_OR) && (titleOk || levelOk)) ||
              ((op === UTIL.OP_AND) && (titleOk && levelOk))) {
            out.push(notice);
          }
        });
      } else {
        out = input;
      }
      return out;
    };
  }]);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

NoticeDashController.$inject = ['$scope', '$rootScope', '$state', 'noticeFactory', 'noticeService', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'controllerUtilFactory', 'miscUtilFactory', 'NOTICESCHEMA', 'STATES', 'UTIL', 'DEBUG'];

function NoticeDashController($scope, $rootScope, $state, noticeFactory, noticeService, NgDialogFactory, stateFactory, utilFactory, controllerUtilFactory, miscUtilFactory, NOTICESCHEMA, STATES, UTIL, DEBUG) {

  controllerUtilFactory.setScopeVars('NOTICE', $scope);

  if (DEBUG.devmode) {
    $scope.debug = DEBUG;
  }

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterOps = UTIL.OP_LIST;
  $scope.initFilter = initFilter;
  $scope.toggleSelection = toggleSelection;
  $scope.formatDate = utilFactory.formatDate;
  $scope.levelToName = levelToName;
  $scope.levelToIcon = levelToIcon;

  $scope.changeStateParam = changeStateParam;
  $scope.dashDelete = dashDelete;
  $scope.setSelect = setSelect;
  $scope.getStateButton = getStateButton;

  stateFactory.addInterface($scope);  // add stateFactory menthods to scope

  $scope.noticeTypes = NOTICESCHEMA.NOTICETYPEOBJS;

  initFilter();
  getNotices();

  /* function implementation
  -------------------------- */

  function initFilter() {
    $scope.filterText = undefined;
    $scope.filterLevel = undefined;
    $scope.filterOp = undefined;
    setSelect(0);
  }

  function toggleSelection (entry) {
    setNotice(
      controllerUtilFactory.toggleSelection($scope, entry, $scope.notices, initNotice)
    );
  }


  function getNotices () {
    $scope.notices = noticeFactory.query('notice',
      // success function
      function (response) {
        // response is actual data
        $scope.notices = response;

        initFilter();
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response, 'Unable to retrieve Notices');
      }
    );
  }

  function changeStateParam () {
    return {
      id: $scope.notice._id
    };
  }

  function setNotice (notice) {
    $scope.notice = notice;
  }

  function levelToName (level, prop) {
    return noticeFactory.getNoticeTypeObj(level, 'name');
  }

  function levelToIcon (level) {
    return noticeFactory.getNoticeTypeObj(level, 'icon');
  }

  function initNotice () {
    // include only required fields
    setNotice(NOTICESCHEMA.SCHEMA.getObject());
  }


  function dashDelete() {
    var selectedList = miscUtilFactory.getSelectedList($scope.notices);
    noticeService.confirmDeleteNotice($scope, selectedList,
      // success function
      function (/*response*/) {
        getNotices();
      });
  }

  function getStateButton (state) {
    return noticeService.getStateButton($scope, state);
  }

  function setSelect(sel) {
    return controllerUtilFactory.setSelect($scope, $scope.notices, sel);
  }


}

