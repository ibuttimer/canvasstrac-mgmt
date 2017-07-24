/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('NoticeDeleteController', NoticeDeleteController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

NoticeDeleteController.$inject = ['$scope', 'utilFactory', 'noticeFactory'];

function NoticeDeleteController($scope, utilFactory, noticeFactory) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.formatDate = utilFactory.formatDate;
  $scope.levelToName = levelToName;
  $scope.levelToIcon = levelToIcon;


  /* function implementation
  -------------------------- */

  function levelToName (level, prop) {
    return noticeFactory.getNoticeTypeObj(level, 'name');
  }

  function levelToIcon (level) {
    return noticeFactory.getNoticeTypeObj(level, 'icon');
  }

}

