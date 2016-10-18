/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .controller('ContactController', ['$scope', function ($scope) {

    // function to initialise feedback object
    $scope.initFeedback = function () {
      $scope.feedback = {
        mychannel: '',
        firstName: '',
        lastName: '',
        agree: false,
        email: ''
      };

      $scope.invalidChannelSelection = false;
    };

    $scope.initFeedback();

    // function to log feedback object to console
    $scope.logFeedback = function (message) {
      console.log(message + ':');
      console.log($scope.feedback);
    };

    $scope.channels = [{value: 'tel', label: 'Tel.'}, {value: 'Email', label: 'Email'}];
  }])

  .controller('FeedbackController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

    $scope.sendFeedback = function () {

      $scope.logFeedback('sendFeedback');

      if ($scope.feedback.agree && ($scope.feedback.mychannel === '')) {
        $scope.invalidChannelSelection = true;
        console.log('invalidChannelSelection');
      } else {
        // post comment to server
        feedbackFactory.putFeedback().save($scope.feedback)
          .$promise.then(
            // success function
            function (response) {
              // response is actual data

              // re-init for next comment entry
              $scope.initFeedback();

              $scope.feedbackForm.$setPristine();

              $scope.logFeedback('clearFeedback');
            },
            // error function
            function (response) {
              // reponse is message
              var message = 'Error saving feedback\n\n' +
                  'Error: ' + response.status + ' ' + response.statusText;
              alert(message);
            }
          );
      }
    };
  }])


  .controller('AboutController', ['$scope', function ($scope) {


  }]);



