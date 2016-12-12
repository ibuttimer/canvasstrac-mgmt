/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassSurveyController', CanvassSurveyController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassSurveyController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'canvassFactory', 'electionFactory', 'surveyFactory', 'questionFactory', 'addressFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'UTIL', 'RES'];

function CanvassSurveyController($scope, $rootScope, $state, $stateParams, $filter, canvassFactory, electionFactory, surveyFactory, questionFactory, addressFactory, NgDialogFactory, stateFactory, utilFactory, UTIL, RES) {

  console.log('CanvassSurveyController id', $stateParams.id);

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.toggleQuestionSel = toggleQuestionSel;
  $scope.questionDelete = questionDelete;
  $scope.questionSelClear = questionSelClear;
  $scope.questionSelAll = questionSelAll;
  $scope.confirmDeleteQuestion = confirmDeleteQuestion;
  $scope.openQuestion = openQuestion;
  $scope.getQuestionTypeName = questionFactory.getQuestionTypeName;
  $scope.showQuestionOptions = questionFactory.showQuestionOptions;

  $scope.canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS);
  $scope.survey = surveyFactory.getObj(RES.ACTIVE_SURVEY);

  
  /* function implementation
  -------------------------- */

  function toggleQuestionSel (entry) {
    $scope.selQuestionCnt = utilFactory.toggleSelection(entry, $scope.selQuestionCnt);
  }

  function haveSurveyQuestions () {
    return ($scope.survey && $scope.survey.questions);
  }

  function questionSelClear () {
    if (haveSurveyQuestions()) {
      $scope.selQuestionCnt = utilFactory.setSelected($scope.survey.questions, UTIL.CLR_SEL);
    }
  }

  function questionSelAll () {
    if (haveSurveyQuestions()) {
      $scope.selQuestionCnt = utilFactory.setSelected($scope.survey.questions, UTIL.SET_SEL);
    }
  }


  function questionDelete () {
    if (haveSurveyQuestions()) {
      var selectedList = utilFactory.getSelectedList($scope.survey.questions);
      confirmDeleteQuestion(selectedList);
    }
  }


  function confirmDeleteQuestion (deleteList) {

    $scope.confirmDelete (
      {template: 'canvasses/confirmdelete_question.html', 
        scope: $scope, className: 'ngdialog-theme-default', 
        controller: 'CanvassSurveyController', data: {list: deleteList}},
      function (data) {
        // perform delete
        var delParams = {};
        angular.forEach(data.value, function (entry) {
          delParams[entry._id] = true;
        });

        questionFactory.getQuestions().delete(delParams)
          .$promise.then(
            // success function
            function (response) {
              
              surveyFactory.getSurveys().get({id: $scope.canvass.survey})
                .$promise.then(
                  // success function
                  function (response) {
                    surveyFactory.readSurveyRsp(response, {
                      objId: [RES.ACTIVE_SURVEY, RES.BACKUP_SURVEY]
                    });
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
    if (action === 'new') {
      qdata = {};
    } else if ((action === 'view') || (action == 'edit')) {
      
      for (var i = 0; i < $scope.survey.questions.length; ++i) {
        if ($scope.survey.questions[i].isSelected) {
          qdata = angular.copy($scope.survey.questions[i]);
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
    
    
    var dialog = NgDialogFactory.open({ template: 'surveys/question.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'QuestionController', 
                	data: {action: action, question: qdata},
									resolve: {
										questionTypes: function depFactory() {
											return questionFactory.getQuestionTypes();
										}
									}});

    dialog.closePromise.then(function (data) {
      if (!NgDialogFactory.isNgDialogCancel(data.value)) {

        var resource = questionFactory.getQuestions();

        // dialog returns question type object, only need the type value for the server
        data.value.question.type = data.value.question.type.type;
        
        if (data.value.action === 'new') {
          resource.save(data.value.question)
            .$promise.then(
              // success function
              function (response) {
                if (!$scope.survey.questions) {
                  $scope.survey.questions = [];
                }
                $scope.survey.questions.push(response._id);

                $scope.processSurvey(RES.PROCESS_UPDATE);
              },
              // error function
              function (response) {
                NgDialogFactory.error(response, 'Creation Unsuccessful');
              }
            );
        } else if (data.value.action === 'edit') {
          resource.update({id: data.value.question._id}, data.value.question)
            .$promise.then(
              // success function
              function (response) {
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

  
  
}


