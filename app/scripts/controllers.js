/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  // Heroku SparkPost add-on shutdown 15/10/2020, disable email for the moment
  // .controller('ContactController', ContactController)

  // .controller('FeedbackController', ['$scope', '$state', 'messageFactory' ,'NgDialogFactory', 'STATES', function ($scope, $state, messageFactory, NgDialogFactory, STATES) {


  //   $scope.sendMessage = function () {

  //     var resource;
  //     if ($state.is(STATES.CONTACTUS)) {
  //       resource = 'feedback';
  //     } else if ($state.is(STATES.SUPPORT)) {
  //       resource = 'support';
  //     }

  //     if (resource) {
  //       // post message to server
  //       messageFactory.save(resource, $scope.message,
  //         // success function
  //         function (/*response*/) {
  //           // re-init for next comment entry
  //           $scope.initMessage(true);

  //           $scope.messageForm.$setPristine();
  //         },
  //         // error function
  //         function (response) {
  //           // response is message
  //           NgDialogFactory.error(response, 'Error saving');
  //         }
  //       );
  //     }
  //   };
  // }])


  .controller('AboutController', ['$scope', function ($scope) {


  }]);


// Heroku SparkPost add-on shutdown 15/10/2020, disable email for the moment
// ContactController.$inject = ['$scope', '$state', 'STATES', 'MESSAGESCHEMA'];

// function ContactController ($scope, $state, STATES, MESSAGESCHEMA) {

//   // function to initialise feedback object
//   $scope.initMessage = function (submitted) {
//     $scope.message = MESSAGESCHEMA.SCHEMA.getObject();
//     $scope.message.submitted = submitted;
//   };

//   if ($state.is(STATES.CONTACTUS)) {
//     $scope.title = 'Send Feedback';
//     $scope.thanks = 'Thank you for your feedback';
//     $scope.entryPrompt = 'Your Feedback';
//   } else if ($state.is(STATES.SUPPORT)) {
//     $scope.title = 'Support Request';
//     $scope.thanks = 'Thank you for your request, you will receive a response as soon as possible.';
//     $scope.entryPrompt = 'Details';
//   }

//   $scope.initMessage();
// }


