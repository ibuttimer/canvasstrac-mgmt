/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassSurveyController', CanvassSurveyController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassSurveyController.$inject = ['$scope', '$rootScope', '$state', '$filter', 'canvassFactory', 'electionFactory', 'surveyFactory', 'questionFactory', 'addressFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'QUESACTION', 'UTIL', 'RES'];

function CanvassSurveyController($scope, $rootScope, $state, $filter, canvassFactory, electionFactory, surveyFactory, questionFactory, addressFactory, NgDialogFactory, stateFactory, utilFactory, QUESACTION, UTIL, RES) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.toggleQuestionSel = toggleQuestionSel;
  $scope.questionDelete = questionDelete;
  $scope.questionSelClear = questionSelClear;
  $scope.questionSelAll = questionSelAll;
  $scope.openQuestion = openQuestion;
  $scope.getQuestionTypeName = questionFactory.getQuestionTypeName;
  $scope.showQuestionOptions = questionFactory.showQuestionOptions;
  $scope.onSurveyChange = onSurveyChange;
  $scope.quesButtons = [
    { txt: 'New', icon: 'fa-plus-square-o', tip: 'Create new',
      class: 'btn-primary', act: QUESACTION.NEW },
    { txt: 'View', icon: 'fa-eye', tip: 'View selected',
      class: 'btn-info', act: QUESACTION.VIEW },
    { txt: 'Edit', icon: 'fa-pencil-square-o', tip: 'Edit selected',
      class: 'btn-warning', act: QUESACTION.EDIT },
    { txt: 'Delete', icon: 'fa-trash-o', tip: 'Delete selected',
      class: 'btn-danger' },
    { txt: 'Unselect', state: 'unsel', icon: 'fa-square-o', tip: 'Unselect all',
      class: 'btn-default' },
    { txt: 'Select', state: 'sel', icon: 'fa-check-square-o', tip: 'Select all',
      class: 'btn-default' }
  ];

  $scope.showQuesButton = showQuesButton;
  $scope.exeQuesButton = exeQuesButton;
  $scope.disableQuesButton = disableQuesButton;



  $scope.canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS);
  $scope.survey = surveyFactory.getObj(RES.ACTIVE_SURVEY);
  $scope.questions = questionFactory.getList(RES.SURVEY_QUESTIONS);

  
  /* function implementation
  -------------------------- */

  function toggleQuestionSel (entry) {
    $scope.selQuestionCnt = utilFactory.toggleSelection(entry, $scope.selQuestionCnt);
  }

  function countQuestionSel () {
    $scope.selQuestionCnt = utilFactory.countSelected($scope.questions.list);
  }

  function haveSurveyQuestions () {
    return ($scope.survey && $scope.questions.count);
  }

  function questionSelUnSel (action) {
    if (haveSurveyQuestions()) {
      $scope.selQuestionCnt = utilFactory.setSelected($scope.questions.list, action);
    } else {
      $scope.selQuestionCnt = 0;
    }
  }

  function questionSelClear () {
    questionSelUnSel(UTIL.CLR_SEL);
  }

  function questionSelAll () {
    questionSelUnSel(UTIL.SET_SEL);
  }


  function questionDelete () {
    if (haveSurveyQuestions()) {
      var selectedList = utilFactory.getSelectedList($scope.questions.list);
      confirmDeleteQuestion(selectedList);
    }
  }


  function confirmDeleteQuestion (deleteList) {

    NgDialogFactory.openAndHandle({
        template: 'canvasses/confirmdelete_question.html', scope: $scope,
        className: 'ngdialog-theme-default', controller: 'CanvassSurveyController',
        data: { list: deleteList}
      },
      // process function
      function (value) {
        // perform delete
        var delParams = {},
          idx,
          updatedSurvey = angular.copy($scope.survey);
        angular.forEach(value, function (entry) {
          delParams[entry._id] = true;

          idx = updatedSurvey.questions.findIndex(function (ques) {
            return (ques === entry._id);
          });
          if (idx >= 0) {
            updatedSurvey.questions.splice(idx, 1);
          }
        });

        questionFactory.getQuestions().delete(delParams)
          .$promise.then(
            // success function
            function (/*response*/) {
              // update survey's list of questions
              surveyFactory.getSurveys().update({id: updatedSurvey._id}, updatedSurvey)
                .$promise.then(
                  // success function
                  function (response) {
                    surveyFactory.readResponse(response, $scope.getSurveyRspOptions());

                    countQuestionSel();
                  },
                  // error function
                  function (response) {
                    // response is message
                    NgDialogFactory.error(response, 'Unable to retrieve Survey');
                  }
                );
            },
            // error function
            function (response) {
              NgDialogFactory.error(response, 'Delete Unsuccessful');
            }
          );
      });
  }
  
  
  function openQuestion (action) {
    var qdata;

    if (action === QUESACTION.NEW) {
      qdata = {};
    } else if ((action === QUESACTION.VIEW) || (action === QUESACTION.EDIT)) {
      
      for (var i = 0; i < $scope.questions.list.length; ++i) {
        if ($scope.questions.list[i].isSelected) {
          qdata = angular.copy($scope.questions.list[i]);
          // change qdata.type to a question type object as expected by dialog
          qdata.type = questionFactory.getQuestionTypeObj(qdata.type);
          // set numoptions as that's not part of the model but needed by dialog
          qdata.numoptions = 0;
          if (qdata.type.showOptions && qdata.options) {
            qdata.numoptions = qdata.options.length;
          }
          break;
        }
      }
    } 

    var dialog = NgDialogFactory.open({
      template: 'surveys/question.html', scope: $scope,
      className: 'ngdialog-theme-default', controller: 'QuestionController',
      data: { action: action, question: qdata },
      resolve: {
        questionTypes: function depFactory() {
          return questionFactory.getQuestionTypes();
        }
      }
    });

    dialog.closePromise.then(function (data) {
      if (!NgDialogFactory.isNgDialogCancel(data.value)) {

        var resource = questionFactory.getQuestions();

        // dialog returns question type object, only need the type value for the server
        data.value.question.type = data.value.question.type.type;

        if (data.value.action === QUESACTION.NEW) {
          resource.save(data.value.question)
            .$promise.then(
              // success function
              function (response) {
                if (!$scope.survey.questions) {
                  $scope.survey.questions = [];
                }
                $scope.survey.questions.push(response._id);

                var surveyProc;
                if (!$scope.survey._id) {
                  surveyProc = RES.PROCESS_UPDATE_NEW;
                } else {
                  surveyProc = RES.PROCESS_UPDATE;
                }
                $scope.processSurvey(surveyProc, countQuestionSel);
              },
              // error function
              function (response) {
                NgDialogFactory.error(response, 'Creation Unsuccessful');
              }
            );
        } else if (data.value.action === QUESACTION.EDIT) {
          resource.update({id: data.value.question._id}, data.value.question)
            .$promise.then(
              // success function
              function (response) {

                var idx = $scope.questions.findIndexInList(function (entry) {
                  return (entry._id === response._id);
                });
                if (idx >= 0) {
                  toggleQuestionSel(
                    $scope.questions.updateInList(idx,
                                questionFactory.readRspObject(response)));
                }

                if (!$scope.survey.questions) {
                  $scope.survey.questions = [];
                  $scope.survey.questions.push(response._id);
                }

                $scope.processSurvey(RES.PROCESS_UPDATE);
              },
              // error function
              function (response) {
                NgDialogFactory.error(response, 'Creation Unsuccessful');
              }
            );
        }
        
        // clear selected question list
//        initSelected($scope.survey.questions);
      }
    });

  }


  function showQuesButton (btn, form) {
    var show = false;
    switch (btn.txt) {
      case 'New':
        show = (!$scope.editDisabled && !form.$invalid);
        break;
      case 'View':
        show = ($scope.questions.count > 0);
        break;
      case 'Edit':
      case 'Delete':
      case 'Unselect':
      case 'Select':
        show = (!$scope.editDisabled && ($scope.questions.count > 0));
        break;
    }
    return show;
  }

  function exeQuesButton (btn) {
    switch (btn.txt) {
      case 'New':
      case 'View':
      case 'Edit':
        openQuestion(btn.act);
        break;
      case 'Delete':
        questionDelete();
        break;
      case 'Unselect':
        questionSelClear();
        break;
      case 'Select':
        questionSelAll();
        break;
    }
  }

  function disableQuesButton (btn, form) {
    var disable = false;
    switch (btn.txt) {
      case 'New':
        disable = !$scope.editDisabled && form.$invalid;
        break;
      case 'View':
      case 'Edit':
        disable = ($scope.selQuestionCnt !== 1);
        break;
      case 'Delete':
        disable = ($scope.selQuestionCnt < 1);
        break;
      case 'Unselect':
        disable = ($scope.selQuestionCnt === 0);
        break;
      case 'Select':
        disable = ($scope.selQuestionCnt === $scope.questions.count);
        break;
    }
    return disable;
  }





  function onSurveyChange () {
    /* save the updated survey to the store, as processSurvey in the parent
      controller doesn't see the changes to name & description.
      Something to do with scopes? */
    surveyFactory.setObj(RES.ACTIVE_SURVEY, $scope.survey);
  }
  
  
}


