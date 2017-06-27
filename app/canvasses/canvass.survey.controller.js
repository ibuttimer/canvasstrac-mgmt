/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassSurveyController', CanvassSurveyController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassSurveyController.$inject = ['$scope', '$rootScope', '$state', '$filter', 'canvassFactory', 'electionFactory', 'surveyFactory', 'questionFactory', 'addressFactory', 'miscUtilFactory', 'NgDialogFactory', 'stateFactory', 'QUESACTION', 'RES', 'DECOR'];

function CanvassSurveyController($scope, $rootScope, $state, $filter, canvassFactory, electionFactory, surveyFactory, questionFactory, addressFactory, miscUtilFactory, NgDialogFactory, stateFactory, QUESACTION, RES, DECOR) {

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
    { txt: 'New', icon: DECOR.NEW.icon, tip: 'Create new',
      class: DECOR.DASH.class, act: QUESACTION.NEW },
    { txt: 'View', icon: DECOR.VIEW.icon, tip: 'View selected',
      class: DECOR.VIEW.class, act: QUESACTION.VIEW },
    { txt: 'Edit', icon: DECOR.EDIT.icon, tip: 'Edit selected',
      class: DECOR.EDIT.class, act: QUESACTION.EDIT },
    { txt: 'Delete', icon: DECOR.DEL.icon, tip: 'Delete selected',
      class: DECOR.DEL.class },
    { txt: 'Unselect', state: 'unsel', icon: DECOR.UNSEL.icon, tip: 'Unselect all',
      class: DECOR.UNSEL.class },
    { txt: 'Select', state: 'sel', icon: DECOR.SEL.icon, tip: 'Select all',
      class: DECOR.SEL.class }
  ];

  $scope.showQuesButton = showQuesButton;
  $scope.exeQuesButton = exeQuesButton;
  $scope.disableQuesButton = disableQuesButton;



  $scope.questions = questionFactory.getList(RES.SURVEY_QUESTIONS);

  
  /* function implementation
  -------------------------- */

  function toggleQuestionSel (entry) {
    $scope.selQuestionCnt = miscUtilFactory.toggleSelection(entry, $scope.selQuestionCnt);
  }

  function countQuestionSel () {
    $scope.selQuestionCnt = miscUtilFactory.countSelected($scope.questions);
  }

  function haveSurveyQuestions () {
    return ($scope.survey && $scope.questions.count);
  }

  function questionSelUnSel (action) {
    if (haveSurveyQuestions()) {
      $scope.selQuestionCnt = miscUtilFactory.setSelected($scope.questions, action);
    } else {
      $scope.selQuestionCnt = 0;
    }
  }

  function questionSelClear () {
    questionSelUnSel(miscUtilFactory.CLR_SEL);
  }

  function questionSelAll () {
    questionSelUnSel(miscUtilFactory.SET_SEL);
  }


  function questionDelete () {
    if (haveSurveyQuestions()) {
      var selectedList = miscUtilFactory.getSelectedList($scope.questions);
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

        questionFactory.delete('question', delParams,
          // success function
          function (/*response*/) {
            // update survey's list of questions
            surveyFactory.update('survey', {id: updatedSurvey._id}, updatedSurvey,
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
      
      qdata = miscUtilFactory.findSelected($scope.questions);
      if (qdata) {
        qdata = angular.copy(qdata);
        // change qdata.type to a question type object as expected by dialog
        qdata.type = questionFactory.getQuestionTypeObj(qdata.type);
        // set numoptions as that's not part of the model but needed by dialog
        qdata.numoptions = 0;
        if (qdata.type.showOptions && qdata.options) {
          qdata.numoptions = qdata.options.length;
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

        // dialog returns question type object, only need the type value for the server
        data.value.question.type = data.value.question.type.type;

        if (data.value.action === QUESACTION.NEW) {
          questionFactory.save('question', data.value.question,
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
          questionFactory.update('question', {id: data.value.question._id}, data.value.question,
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
//    surveyFactory.setObj(RES.ACTIVE_SURVEY, $scope.survey);
  }
  
  
}


