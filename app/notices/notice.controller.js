/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .directive('convertToNumber', function() {
    /* copied from https://code.angularjs.org/1.4.7/docs/api/ng/directive/select */
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(val) {
          return parseInt(val, 10);
        });
        ngModel.$formatters.push(function(val) {
          return '' + val;
        });
      }
    };
  })

  .controller('NoticeController', NoticeController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

NoticeController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'noticeFactory', 'noticeService', 'NgDialogFactory', 'stateFactory', 'controllerUtilFactory', 'consoleService', 'STATES', 'NOTICESCHEMA', 'RESOURCE_CONST', 'DEBUG'];

function NoticeController($scope, $rootScope, $state, $stateParams, noticeFactory, noticeService, NgDialogFactory, stateFactory, controllerUtilFactory, consoleService, STATES, NOTICESCHEMA, RESOURCE_CONST, DEBUG) {

  var con = consoleService.getLogger('NoticeController');

  con.debug('NoticeController id', $stateParams.id);

  controllerUtilFactory.setScopeVars('NOTICE', $scope);

  if (DEBUG.devmode) {
    $scope.debug = DEBUG;
  }

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.getTitle = getTitle;
  $scope.processForm = processForm;

  $scope.changeStateParam = changeStateParam;
  $scope.singleDelete = singleDelete;
  $scope.getStateButton = getStateButton;

  $scope.gotoDash = gotoDash;

  stateFactory.addInterface($scope);  // add stateFactory menthods to scope

  $scope.noticeTypes = NOTICESCHEMA.NOTICETYPEOBJS;

  initItem($stateParams.id);

  /* function implementation
  -------------------------- */

  function getTitle() {
    $scope.editDisabled = true;

    var title;
    if ($state.is($scope.newState)) {
      title = 'Create Notice';
      $scope.editDisabled = false;
    } else if ($state.is($scope.viewState)) {
      title = 'View Notice';
    } else if ($state.is($scope.editState)) {
      title = 'Update Notice';
      $scope.editDisabled = false;
    } else {
      title = '';
    }
    return title;
  }


  function processForm() {
    if ($state.is($scope.newState)) {
      createNotice();
    } else if ($state.is($scope.viewState)) {
      gotoDash();
    } else if ($state.is($scope.editState)) {
      updateNotice();
    }
  }

  function initItem(id) {
    if (!id) {
      $scope.notice = NOTICESCHEMA.SCHEMA.getObject();
    } else {
      $scope.notice = noticeFactory.get('notice', {id: id},
        // success function
        function (response) {

          $scope.notice = noticeFactory.readResponse(response, {
            objId: undefined, // no objId means not stored, just returned
            factory: 'noticeFactory',
            storage: RESOURCE_CONST.STORE_OBJ
          });
        },
        // error function
        function (response) {
          // response is message
          NgDialogFactory.error(response, 'Unable to retrieve Notice');
        }
      );
    }
  }


  function createNotice() {

    con.log('createNotice', $scope.notice);

    noticeFactory.save('notice', $scope.notice,
      // success function
      function (/*response*/) {
        initItem();
        gotoDash();
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response, 'Creation Unsuccessful');
      }
    );
  }

  function updateNotice() {

    con.log('updateNotice', $scope.notice);

    noticeFactory.update('notice', {id: $scope.notice._id}, $scope.notice,
      // success function
      function (/*response*/) {
        initItem();
        gotoDash();
      },
      // error function
      function (response) {
        // response is message
        NgDialogFactory.error(response, 'Update Unsuccessful');
      }
    );
  }

  function changeStateParam () {
    return {
      id: $scope.notice._id
    };
  }

  function singleDelete() {

    var deleteList = [
      JSON.parse(JSON.stringify($scope.notice))
    ];

    noticeService.confirmDeleteNotice($scope, deleteList,
      // success function
      function (/*response*/) {
        gotoDash();
      });
  }

  function getStateButton (state) {
    return noticeService.getStateButton($scope, state);
  }

  function gotoDash() {
    $state.go($scope.dashState);
  }

}

