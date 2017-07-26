/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassResultController', CanvassResultController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassResultController.$inject = ['$scope', '$rootScope', '$state', 'canvassFactory', 'electionFactory', 'surveyFactory', 'addressFactory', 'canvassResultFactory', 'questionFactory', 'NgDialogFactory', 'stateFactory', 'pagerFactory', 'storeFactory', 'miscUtilFactory', 'RES', 'ADDRSCHEMA', 'CANVASSRES_SCHEMA', 'roleFactory', 'ROLES', 'userFactory', 'CANVASSASSIGN', 'QUESTIONSCHEMA', 'CHARTS', 'SCHEMA_CONST', 'compareFactory', 'filterFactory'];

function CanvassResultController($scope, $rootScope, $state, canvassFactory, electionFactory, surveyFactory, addressFactory, canvassResultFactory, questionFactory, NgDialogFactory, stateFactory, pagerFactory, storeFactory, miscUtilFactory, RES, ADDRSCHEMA, CANVASSRES_SCHEMA, roleFactory, ROLES, userFactory, CANVASSASSIGN, QUESTIONSCHEMA, CHARTS, SCHEMA_CONST, compareFactory, filterFactory) {

  var factories = {},
    i,
    quickDetails = [
      { label: 'Not Available',
        id: CANVASSRES_SCHEMA.IDs.AVAILABLE
      },
      { label: 'Don\'t Canvass',
        id: CANVASSRES_SCHEMA.IDs.DONTCANVASS
      },
      { label: 'Try Again',
        id: CANVASSRES_SCHEMA.IDs.TRYAGAIN
      }
    ],
    supportProperty = CANVASSRES_SCHEMA.SCHEMA.getModelName(CANVASSRES_SCHEMA.IDs.SUPPORT);

  quickDetails.forEach(function (detail) {
    detail.property = CANVASSRES_SCHEMA.SCHEMA.getModelName(detail.id);
    detail.dfltValue = CANVASSRES_SCHEMA.SCHEMA.getDfltValue(detail.id);
  });

  pagerFactory.addPerPageOptions($scope, 5, 5, 4, 1); // 4 opts, from 5 inc 5, dflt 10

  setupGroup(RES.ALLOCATED_ADDR, addressFactory, 'Addresses',
             CANVASSASSIGN.ASSIGNMENTCHOICES, 'Assigned', false);
  setupGroup(RES.ALLOCATED_CANVASSER, userFactory, 'Canvassers',
             CANVASSASSIGN.ASSIGNMENTCHOICES, 'Has Allocation', true);

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.getQuestionTypeName = questionFactory.getQuestionTypeName;
  $scope.showPieChart = showPieChart;
  $scope.showBarChart = showBarChart;
  $scope.showPolarAreaChart = showPolarAreaChart;
  $scope.showChart = showChart;
  $scope.showResultDetail = showResultDetail;
  $scope.toPercent = toPercent;

  // generate quick response labels & data
  $scope.quickLabels = [];
  $scope.quickData = new Array(quickDetails.length);
  quickDetails.forEach(function (detail) {
    $scope.quickLabels.push(detail.label);
  });
  $scope.pieChartOptions = {
    legend: {
      display: true
    }
  };

  // generate support labels & data
  $scope.supportLabels = ['Unknown'];
  $scope.supportData = [0];
  for (i = CANVASSRES_SCHEMA.SUPPORT_MIN; i <= CANVASSRES_SCHEMA.SUPPORT_MAX; ++i) {
    $scope.supportLabels.push('Level ' + i.toString());
    $scope.supportData.push(0);
  }
  $scope.resultCount = 0;

  $scope.canvassLabels = ['Completed', 'Pending'];
  $scope.canvassComplete = $scope.canvassPending = makeCountPercent(0, 0);

  $scope.survey = surveyFactory.getObj(RES.ACTIVE_SURVEY);

  $scope.addresses = addressFactory.getList(RES.ALLOCATED_ADDR);
  $scope.addresses.addOnChange(canvassChartData);

  $scope.results = canvassResultFactory.getList(RES.CANVASS_RESULT);
  $scope.results.addOnChange(processsResults);

  $scope.questions = questionFactory.getList(RES.SURVEY_QUESTIONS);
  $scope.questions.addOnChange(processQuestions);



  /* function implementation
  -------------------------- */

  function canvassChartData(resList) {
    var completed = 0,
      pending = 0;
    resList.forEachInList(function (entry) {
      if (entry.canvassResult) {
        ++completed;
      } else {
        ++pending;
      }
    });
    $scope.canvassComplete = makeCountPercent(completed, resList.count);
    $scope.canvassPending = makeCountPercent(pending, resList.count);
  }

  function processsResults (resList) {

    /* TODO curently only support a single canvass result per address
       TODO preventing the multiple counting of results for an address should be handled on the server
    */

    var i,
      filteredList = canvassResultFactory.filterResultsLatestPerAddress(resList.slice());

    $scope.resultCount = filteredList.length;

    var quickData = new Array($scope.quickData.length),
      supportData = new Array($scope.supportData.length),
      quickCnt = 0,   // number of quick responses
      supportCnt = 0; // number of support responses
    quickData.fill(0);
    supportData.fill(0);

    filteredList.forEach(function (result) {
      // calc quick responses
      for (i = 0; i < quickDetails.length; ++i) {
        if (result[quickDetails[i].property] !== quickDetails[i].dfltValue) {
          // quick responses are mutually exclusive, so if one isn't its default value, thats it
          ++quickData[i];
          ++quickCnt;
          break;
        }
      }

      // ca;c support
      if (result[supportProperty] === CANVASSRES_SCHEMA.SUPPORT_UNKNOWN) {
        ++supportData[0];
      } else {
        i = result[supportProperty] - CANVASSRES_SCHEMA.SUPPORT_MIN + 1;
        if (i < supportData.length) {
          ++supportData[i];
          ++supportCnt;
        }
      }
    });

    $scope.quickLabelData = makeLabelData($scope.quickLabels, quickData, quickCnt);
    $scope.quickData = quickData;
    $scope.quickDataCnt = quickCnt;
    $scope.supportLabelData = makeLabelData($scope.supportLabels, supportData, supportCnt);
    $scope.supportData = supportData;
    $scope.supportDataCnt = supportCnt;
  }

  function makeLabelData (labels, values, total) {
    var ll = labels.length,
      labelData = new Array(ll);
    for (var i = 0; i < ll; ++i) {
      labelData[i] = {
        label: labels[i],
        data: makeCountPercent(values[i], total)
      };
    }
    return labelData;
  }

  function processQuestions (resList) {
    var val;
    resList.forEachInList(function (question) {
      question.chartType = chartCtrl(question);
      switch (question.chartType) {
        case CHARTS.PIE:
          question.chartOptions = {
            legend: {
              display: true
            }
          };
          break;
        case CHARTS.BAR:
        case CHARTS.HORZ_BAR:
          question.chartOptions = {
            legend: {
              display: false  // don't display as no series names
            },
            scales: {
              // horizontal bar
              xAxes: [{
                ticks: {
                  beginAtZero: true,
                  min: 0
                }
              }]
            }
          };
          break;
        case CHARTS.POLAR:
          val = ((question.resData.maxValue + 5) / 5).toFixed() * 5;
          question.chartOptions = {
            legend: {
              display: true
            },
            scale: {
              ticks: {
                beginAtZero: true,
                min: 0,
                max: val,
                stepSize: (val > 10 ? 10 : 5)
              }
            }
          };
          break;
        default:
          break;
      }
    });
  }

  function chartCtrl (question) {
    var chart;
    switch (question.type) {
      case QUESTIONSCHEMA.TYPEIDs.QUESTION_YES_NO:
      case QUESTIONSCHEMA.TYPEIDs.QUESTION_YES_NO_MAYBE:
      case QUESTIONSCHEMA.TYPEIDs.QUESTION_CHOICE_SINGLESEL:
        chart = CHARTS.PIE;
        break;
      case QUESTIONSCHEMA.TYPEIDs.QUESTION_CHOICE_MULTISEL:
        chart = CHARTS.BAR;
        break;
      case QUESTIONSCHEMA.TYPEIDs.QUESTION_RANKING:
        chart = CHARTS.POLAR;
        break;
      default:
        chart = undefined;
        break;
    }
    return chart;
  }

  function showChart (question) {
    return (chartCtrl(question) !== undefined);
  }

  function showPieChart (question) {
    return (chartCtrl(question) === CHARTS.PIE);
  }

  function showBarChart (question) {
    return (chartCtrl(question) === CHARTS.BAR);
  }

  function showPolarAreaChart (question) {
    return (chartCtrl(question) === CHARTS.POLAR);
  }


  function showResultDetail (question) {

    var dialog,
      i,
      seriesIdx,
      value,
      total = 0,    // total number of options selected
      resData = question.resData,
      data,
      details = []; // combined label & count info

    if (questionFactory.showQuestionOptions(question.type)) {
      // selection from options
      if (resData.series) {
        seriesIdx = resData.series.length - 1;
      } else {
        seriesIdx = -1;
      }
      if (seriesIdx >= 0) {
        data = resData.data[seriesIdx];
      } else {
        data = resData.data;
      }
      for (i = 0; i < resData.labels.length; ++i) {
        details.push({
          label: resData.labels[i],
          value: data[i] //value
        });
        total += data[i]  /*value*/;
      }
      details.forEach(function (detail) {
        detail.percent = toPercent(detail.value, total);
      });
    } else if (questionFactory.showTextInput(question.type)) {
      // text input
      details = resData.data;
    }

    dialog = NgDialogFactory.open({ template: 'canvasses/result.detail.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'ResultDetailController',
                  data: {
                    question: question,
                    chart: chartCtrl(question),
                    details: details,
                    respCnt: $scope.resultCount
                  }});

    dialog.closePromise.then(function (data) {
      if (!NgDialogFactory.isNgDialogCancel(data.value)) {
        // noop
      }
    });
  }


  function toPercent (value, total, digits) {
    var percent;
    if (total === 0) {
      percent = 0;
    } else {
      percent = (value * 100) / total;
      if (!Number.isInteger(percent)) {
        if (!angular.isNumber(digits)) {
          digits = 1;  // to 1 digit by default
        }
        percent = percent.toFixed(digits);
      }
    }
    return percent;
  }

  function makeCountPercent (value, total, digits) {
    return {
      value: value,
      percent: toPercent(value, total, digits)
    };
  }


  function setupGroup(id, factory, label, assignmentChoices, assignmentLabel,  nameFields) {
    factories[id] = factory;

    $scope[id] = factory.getList(id, storeFactory.CREATE_INIT);
    $scope[id].title = label;
    $scope[id].assignmentChoices = assignmentChoices;
    $scope[id].assignmentLabel = assignmentLabel;
    $scope[id].nameFields = nameFields;
  }

}

