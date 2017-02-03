/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassResultController', CanvassResultController);



/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassResultController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'canvassFactory', 'electionFactory', 'surveyFactory', 'addressFactory', 'canvassResultFactory', 'questionFactory', 'NgDialogFactory', 'stateFactory', 'utilFactory', 'pagerFactory', 'storeFactory', 'RES', 'ADDRSCHEMA', 'CANVASSRES_SCHEMA', 'roleFactory', 'ROLES', 'userFactory', 'CANVASSASSIGN', 'UTIL', 'QUESTIONSCHEMA', 'CHARTS'];

function CanvassResultController($scope, $rootScope, $state, $stateParams, $filter, canvassFactory, electionFactory, surveyFactory, addressFactory, canvassResultFactory, questionFactory, NgDialogFactory, stateFactory, utilFactory, pagerFactory, storeFactory, RES, ADDRSCHEMA, CANVASSRES_SCHEMA, roleFactory, ROLES, userFactory, CANVASSASSIGN, UTIL, QUESTIONSCHEMA, CHARTS) {

  console.log('CanvassResultController id', $stateParams.id);

  var MAX_DISP_PAGE = 5,
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

  $scope.perPageOpt = [5, 10, 15, 20];
  $scope.perPage = 10;

  setupGroup(RES.ALLOCATED_ADDR, 'Addresses', CANVASSASSIGN.ASSIGNMENTCHOICES, 'Assigned', false);
  setupGroup(RES.ALLOCATED_CANVASSER, 'Canvassers', CANVASSASSIGN.ASSIGNMENTCHOICES, 'Has Allocation', true);

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.filterList = filterList;
  $scope.updateList = updateList;
  $scope.sortList = sortList;
  $scope.getQuestionTypeName = questionFactory.getQuestionTypeName;
  $scope.showPieChart = showPieChart;
  $scope.showBarChart = showBarChart;
  $scope.showPolarAreaChart = showPolarAreaChart;
  $scope.showChart = showChart;
  $scope.showResultDetail = showResultDetail;


  // generate quick response labels & data
  $scope.quickLabels = [];
  $scope.quickData = [];
  quickDetails.forEach(function (detail) {
    $scope.quickLabels.push(detail.label);
    $scope.quickData.push(0);
  });

  // generate support labels & data
  $scope.supportLabels = ['Unknown'];
  $scope.supportData = [0];
  for (i = CANVASSRES_SCHEMA.SUPPORT_MIN; i <= CANVASSRES_SCHEMA.SUPPORT_MAX; ++i) {
    $scope.supportLabels.push(i.toString());
    $scope.supportData.push(0);
  }
  $scope.resultCount = 0;

  $scope.canvassLabels = ['Completed', 'Pending'];
  $scope.canvassComplete = 0;
  $scope.canvassPending = 0;

//  $scope.canvass = canvassFactory.getObj(RES.ACTIVE_CANVASS);
  $scope.survey = surveyFactory.getObj(RES.ACTIVE_SURVEY);

  $scope.addresses = addressFactory.getList(RES.ALLOCATED_ADDR);
  $scope.addresses.addOnChange(canvassChartData);

  $scope.results = canvassResultFactory.getList(RES.CANVASS_RESULT);
  $scope.results.addOnChange(processsResults);

  $scope.questions = questionFactory.getList(RES.CANVASS_QUESTIONS);
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
    $scope.canvassComplete = completed;
    $scope.canvassPending = pending;
  }

  function processsResults (resList) {
    console.log('results');
    console.log(resList);
    $scope.resultCount = resList.count;

    $scope.quickData.fill(0);
    $scope.supportData.fill(0);

    resList.forEachInList(function (result) {
      // calc quick responses
      for (i = 0; i < quickDetails.length; ++i) {
        if (result[quickDetails[i].property] !== quickDetails[i].dfltValue) {
          ++$scope.quickData[i];
        }
      }

      // ca;c support
      if (result[supportProperty] === CANVASSRES_SCHEMA.SUPPORT_UNKNOWN) {
        ++$scope.supportData[0];
      } else {
        i = result[supportProperty] - CANVASSRES_SCHEMA.SUPPORT_MIN + 1;
        if (i < $scope.supportData.length) {
          ++$scope.supportData[i];
        }
      }
    });
  }

  function processQuestions (resList) {
    console.log('questions');
    console.log(resList);

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
          val = ((question.maxValue + 5) / 5).toFixed() * 5;
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
      total = 0,
      details = []; // combined label & count info

    if (questionFactory.showQuestionOptions(question.type)) {
      // selection from options
      if (question.series) {
        seriesIdx = question.series.length - 1;
      } else {
        seriesIdx = -1;
      }
      for (i = 0; i < question.labels.length; ++i) {
        if (seriesIdx >= 0) {
          value = question.data[seriesIdx][i];
        } else {
          value = question.data[i];
        }
        details.push({
          label: question.labels[i],
          value: value
        });
        total += value;
      }
      details.forEach(function (detail) {
        value = (detail.value * 100) / total;
        if (!Number.isInteger(value)) {
          value = value.toFixed(1);
        }
        detail.percent = value;
      });
    } else if (questionFactory.showTextInput(question.type)) {
      // text input
      details = question.data;
    }

    dialog = NgDialogFactory.open({ template: 'canvasses/result.detail.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'ResultDetailController',
                  data: {
                    question: question,
                    chart: chartCtrl(question),
                    details: details
                  }});

    dialog.closePromise.then(function (data) {
      if (!NgDialogFactory.isNgDialogCancel(data.value)) {
        // noop
      }
    });
  }





  function getFactory(id) {
    var factory;
    if (id === RES.ALLOCATED_ADDR) {
      factory = addressFactory;
    } else {
      factory = userFactory;
    }
    return factory;
  }

  function setupGroup(id, label, assignmentChoices, assignmentLabel,  nameFields) {
    var factory = getFactory(id);

    $scope[id] = factory.newList(id, {
      titile: label,
      flags: storeFactory.CREATE_INIT
    });
    $scope[id].sortOptions = factory.getSortOptions();
    $scope[id].sortBy = $scope[id].sortOptions[0];
    $scope[id].assignmentChoices = assignmentChoices;
    $scope[id].assignmentLabel = assignmentLabel;
    $scope[id].factory = factory;
    $scope[id].nameFields = nameFields;

    var filter = RES.getFilterName(id);
    $scope[filter] = storeFactory.newObj(filter, function () {
        return newFilter(factory);
      }, storeFactory.CREATE_INIT);

    var pager = RES.getPagerName(id);
    $scope[pager] = pagerFactory.newPager(pager, [], 1, $scope.perPage, MAX_DISP_PAGE);

    setFilter(id, $scope[filter]);
    factory.setPager(id, $scope[pager]);
  }

  function getAssignmentChoiceIndex (value) {
    var idx = -1;
    for (var i = CANVASSASSIGN.ASSIGNMENT_YES_IDX; i <= CANVASSASSIGN.ASSIGNMENT_ALL_IDX; ++i) {
      if (value === CANVASSASSIGN.ASSIGNMENTCHOICES[i].val) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  function filterFunction (list, tests, filter) {
    var incTest,
      dfltFilter = angular.copy(filter);  // filter for use by default filter function
    if (filter && filter.assignment) {
      // remove assignment from default filter otherwise there'll be no moatches
      delete dfltFilter.assignment;

      var idx = getAssignmentChoiceIndex(filter.assignment);
      if ((idx >= 0) && (idx < tests.length)) {
        incTest = tests[idx];
      }
    }

    // list specific filter function
    var filterList = list.factory.getFilteredList(list, dfltFilter);

    // apply allocated criteria
    if (incTest) {
      var outList = [];
      filterList.forEach(function (element) {
        if (incTest(element)) {
          outList.push(element);
        }
      });
      filterList = outList;
    }
    list.filterList = filterList;
  }

  function addrFilterFunction (list, filter) {
    // address specific filter function
    filterFunction(list, [
        function (element) {  // yes test
          return (element.canvasser);
        },
        function (element) {  // no test
          return (!element.canvasser);
        }
      ], filter);
  }

  function cnvsrFilterFunction (list, filter) {
    // canvasser specific filter function
    filterFunction(list, [
        function (element) {  // yes test
          return (element.addresses && element.addresses.length);
        },
        function (element) {  // no test
          return (!element.addresses || !element.addresses.length);
        }
      ], filter);
  }

  function newFilter(factory, data) {
    var filter = factory.newFilter(data);
    // add assignment specific fields
    if (data && data.assignment) {
      filter.filterBy.assignment = data.assignment;
    }
    // override default customFunction with enhanced version
    if (factory.ID_TAG === ADDRSCHEMA.ID_TAG) {
      filter.customFunction = addrFilterFunction;
    } else {
      filter.customFunction = cnvsrFilterFunction;
    }
    return filter;
  }





  function setFilter (id , filter) {
    var factory = getFactory(id),
      // allocatedAddrFilterStr or allocatedCanvasserFilterStr
      filterStr = RES.getFilterStrName(id),
      filterStrPrefix;
    if (!filter) {
      filter = newFilter(factory);
    }
    if (filter.filterBy.assignment) {
      // set filter string prefix to assignment text
      var idx = getAssignmentChoiceIndex(filter.filterBy.assignment);
      if ((idx >= 0) && (idx < CANVASSASSIGN.ASSIGNMENTCHOICES.length)) {
        var list = factory.getList(id);
        if (list) {
          filterStrPrefix = list.assignmentLabel + ': '+           CANVASSASSIGN.ASSIGNMENTCHOICES[idx].text;
        }
      }
    }

    $scope[filterStr] = filter.toString(filterStrPrefix);

    // add canvasser restriction to filter
    if ((id === RES.ALLOCATED_CANVASSER) && $scope.canvasser) {
      filter.role = $scope.canvasser._id;
    }

    return factory.setFilter(id, filter);
  }

  function sortList (resList) {
    return resList.sort();
  }

  function filterList (resList, action) {

    if (action === 'c') {       // clear filter
      setFilter(resList.id);
//      if (resList.id === RES.UNASSIGNED_CANVASSER) {
//        resList.setList([]);  // clear list of addresses
//      }
      resList.applyFilter();
    } else if (action === 'a') {  // no filter, get all
      var list = setFilter(resList.id);
      if (list) {
        resList.factory.getFilteredResource(resList, list.filter, resList.label);
      }
    } else {  // set filter
      var filter = angular.copy(resList.filter.filterBy);

      var dialog = NgDialogFactory.open({ template: 'canvasses/assignmentfilter.html', scope: $scope, className: 'ngdialog-theme-default', controller: 'AssignmentFilterController',
                    data: {action: resList.id,
                           ctrl: { title: resList.title,
                                  assignmentChoices: resList.assignmentChoices,
                                  assignmentLabel: resList.assignmentLabel,
                                  nameFields: resList.nameFields},
                           filter: filter}});

      dialog.closePromise.then(function (data) {
        if (!NgDialogFactory.isNgDialogCancel(data.value)) {

//          ngDialogData.filter.assignment

          var factory = getFactory(data.value.action),
            filter = newFilter(factory, data.value.filter);

          var resList = setFilter(data.value.action, filter);
          if (resList) {
            if (resList.id === RES.UNASSIGNED_CANVASSER) {
              // request filtered addresses from server
              $scope.equestCanvassers(resList, filter);
            } else {
              resList.applyFilter();
            }
          }
        }
      });
    }

  }


  function updateList (action) {
    var addrList = utilFactory.getSelectedList($scope.allocatedAddr.list),
      cnvsList = utilFactory.getSelectedList($scope.allocatedCanvasser.list),
      aidx, cidx,
      canvasser, addr,
      clrSel;

    if (action === 'alloc') {
      clrSel = true;
      for (aidx = 0; aidx < addrList.length; ++aidx) {
        addr = addrList[aidx];

        unlinkAddress(addr);  // unlink addr from previous

        for (cidx = 0; cidx < cnvsList.length; ++cidx) {
          canvasser = cnvsList[cidx];
          canvassFactory.linkCanvasserToAddr(canvasser, addr);
        }
      }
    } else if (action === 'unalloc') {
      clrSel = true;

      // unallocate all addresses allocated to selected canvassers
      cnvsList.forEach(function (unallocCnvsr) {
        canvassFactory.unlinkAddrListFromCanvasser(unallocCnvsr, $scope.allocatedAddr.list);
      });
      // unallocate all selected addresses
      addrList.forEach(function (unallocAddr) {
        unlinkAddress(unallocAddr);
      });
    } else if (action === 'show') {
      // TODO show allocations
    }

    if (clrSel) {
      $scope.setItemSel($scope.allocatedAddr, UTIL.CLR_SEL);
      $scope.setItemSel($scope.allocatedCanvasser, UTIL.CLR_SEL);
    }
  }

  function unlinkAddress (addr) {
    if (addr.canvasser) {
      var canvasser = $scope.allocatedCanvasser.findInList(function (element) {
          return (element._id === addr.canvasser);
        });
      if (canvasser) {
        canvassFactory.unlinkAddrFromCanvasser(canvasser, addr);
      }
    }
  }
}

