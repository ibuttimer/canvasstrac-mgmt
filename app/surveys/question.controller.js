/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .constant('QUESACTION', (function () {
    return {
      NEW: 'new',
      VIEW: 'view',
      EDIT: 'edit'
    };
  })())
  .controller('QuestionController', QuestionController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

QuestionController.$inject = ['$scope', 'questionFactory', 'NgDialogFactory', 'questionTypes', 'QUESACTION'];

function QuestionController($scope, questionFactory, NgDialogFactory, questionTypes, QUESACTION) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.getTitle = getTitle;
  $scope.getOkText = getOkText;
  $scope.selectedItemChanged = selectedItemChanged;
	$scope.questionTypes = questionTypes;

  if ($scope.ngDialogData.question.type) {
    selectedItemChanged('init', $scope.ngDialogData.question);
  } else {
    $scope.showNumOptions = false;
    $scope.showRankingNumber = false;
  }

  /* function implementation
  -------------------------- */

  function getTitle() {
    $scope.editDisabled = true;
    var title;
    if ($scope.ngDialogData.action === QUESACTION.NEW) {
      title = 'Create Question';
      $scope.editDisabled = false;
    } else if ($scope.ngDialogData.action === QUESACTION.VIEW) {
      title = 'View Question';
    } else if ($scope.ngDialogData.action === QUESACTION.EDIT) {
      title = 'Update Question';
      $scope.editDisabled = false;
    } else {
      title = '';
    }
    return title;
  }

  function getOkText() {
    var text;
    if ($scope.ngDialogData.action === QUESACTION.NEW) {
      text = 'Create';
    } else if ($scope.ngDialogData.action === QUESACTION.VIEW) {
      text = 'OK';
    } else if ($scope.ngDialogData.action === QUESACTION.EDIT) {
      text = 'Update';
    } else {
      text = '';
    }
    return text;
  }

  function selectedItemChanged(item, value) {
    if ((item === 'qtype') || (item === 'init')) {
      var typeId = value.type.type,
        showNumOpts = (questionFactory.showQuestionOptions(typeId) &&
          !questionFactory.hasPresetQuestionOptions(typeId)),
        showRankingNum = questionFactory.showRankingNumber(typeId);

      if (!showNumOpts) {
        value.numoptions = 0;
        value.options = undefined;
      }
      
      $scope.showNumOptions = showNumOpts;
      $scope.showRankingNumber = showRankingNum;
    } else if (item === 'numopts') {
      if (value.options === undefined) {
        value.options = [];
      }
      if (value.options.length < value.numoptions) {
        for (var i = value.options.length; i < value.numoptions; ++i) {
          value.options.push('');
        }
      } else {
        value.options.splice(value.numoptions, (value.options.length - value.numoptions)) ;
      }
    }
    
    
    
  }

}

