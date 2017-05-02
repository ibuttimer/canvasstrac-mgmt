/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('ContactController', ContactController)

  .controller('FeedbackController', ['$scope', '$state', 'messageFactory' ,'NgDialogFactory', 'STATES', function ($scope, $state, messageFactory, NgDialogFactory, STATES) {


    $scope.sendMessage = function () {

      var resource;
      if ($state.is(STATES.CONTACTUS)) {
        resource = messageFactory.getFeedback();
      } else if ($state.is(STATES.SUPPORT)) {
        resource = messageFactory.getSupport();
      }

      // post message to server
      resource.save($scope.message)
        .$promise.then(
          // success function
          function (/*response*/) {
            // response is actual data

            // re-init for next comment entry
            $scope.initMessage(true);

            $scope.messageForm.$setPristine();
          },
          // error function
          function (response) {
            // response is message
            NgDialogFactory.error(response, 'Error saving');
          }
        );
    };
  }])


  .controller('AboutController', ['$scope', function ($scope) {


  }]);


ContactController.$inject = ['$scope', '$state', 'STATES', 'MESSAGESCHEMA'];

function ContactController ($scope, $state, STATES, MESSAGESCHEMA) {

  // function to initialise feedback object
  $scope.initMessage = function (submitted) {
    $scope.message = MESSAGESCHEMA.SCHEMA.getObject();
    $scope.message.submitted = submitted;
  };

  if ($state.is(STATES.CONTACTUS)) {
    $scope.title = 'Send Feedback';
    $scope.thanks = 'Thank you for your feedback';
    $scope.entryPrompt = 'Your Feedback';
  } else if ($state.is(STATES.SUPPORT)) {
    $scope.title = 'Support Request';
    $scope.thanks = 'Thank you for your request, you will receive a response as soon as possible.';
    $scope.entryPrompt = 'Details';
  }

  $scope.initMessage();
}


