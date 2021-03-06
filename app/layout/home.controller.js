/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .value('HOMESCRN', {
    message: undefined  // message to display on hmoe screen
  })
  .controller('HomeController', HomeController);


HomeController.$inject = ['$scope', '$rootScope', 'menuService', 'noticeFactory', 'NgDialogFactory', 'HOMESCRN', 'CONFIG'];

function HomeController ($scope, $rootScope, menuService, noticeFactory, NgDialogFactory, HOMESCRN, CONFIG) {


  $scope.message = HOMESCRN.message;

  /* need to use the function for the watch as the message is displayed inside an ng-if
   * which means a child scope & as the message is a primitive (e.g., number, string, boolean)
   * the child scope hides/shadows the parent scope value */
  $scope.$watch(function () {
    return HOMESCRN.message;
  }, function(newValue, oldValue, scope) {
    scope.message = newValue;
  }, true /* object equality */);

  setMenus(CONFIG.NOAUTH ? false : true);

  $rootScope.$on('login:Successful', function () {
    setMenus(true);
  });

  $rootScope.$on('registration:Successful', function () {
    setMenus(true);
  });

  $rootScope.$on('logout:', function () {
    setMenus(false);
  });

  $scope.levelToIcon = levelToIcon;
  $scope.levelToStyle = levelToStyle;


  $scope.notices = noticeFactory.query('current',
    // success function
    function (response) {
      // response is actual data
      $scope.notices = response;
    },
    // error function
    function (response) {
      // response is message
      NgDialogFactory.error(response, 'Unable to retrieve Notices');
    }
  );



  function setMenus (loggedIn) {
    var menus = {},
      menuEntries = [];

    menuService.configMenus(menus, loggedIn);
    for (var menu in menus) {
      for (var entry in menus[menu]) {
        if (entry !== 'root') {
          menuEntries.push(menus[menu][entry]);
        }
      }
    }
    $scope.menuEntries = menuEntries;
  }


  function levelToIcon (level) {
    return noticeFactory.getNoticeTypeObj(level, 'icon');
  }

  function levelToStyle (level) {
    return noticeFactory.getNoticeTypeObj(level, 'style');
  }

}


