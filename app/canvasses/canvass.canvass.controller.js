/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassCanvassController', CanvassCanvassController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassCanvassController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'canvassFactory', 'electionFactory', 'CANVASS'];

function CanvassCanvassController($scope, $rootScope, $state, $stateParams, $filter, canvassFactory, electionFactory, CANVASS) {

  console.log('CanvassCanvassController id', $stateParams.id);

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033

  // get list of elections selecting name field, _id field is always provided
  $scope.elections = electionFactory.getElections().query({fields: 'name'})
    .$promise.then(
      // success function
      function (response) {
        // response is actual data
        $scope.elections = response;
      },
      // error function
      function (response) {
        // response is message
        $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
      }
    );
  

  $scope.canvass = canvassFactory.getCanvass(CANVASS.WORK);

  /* function implementation
  -------------------------- */

  
}


