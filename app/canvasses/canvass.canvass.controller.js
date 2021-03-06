/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .controller('CanvassCanvassController', CanvassCanvassController);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

CanvassCanvassController.$inject = ['$scope', 'canvassFactory', 'electionFactory', 'NgDialogFactory'];

function CanvassCanvassController($scope, canvassFactory, electionFactory, NgDialogFactory) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033

  // get list of elections selecting name field, _id field is always provided
  $scope.elections = electionFactory.query('election', {fields: 'name'},
    // success function
    function (response) {
      // response is actual data
      $scope.elections = response;
    },
    // error function
    function (response) {
      // response is message
      NgDialogFactory.error(response, 'Unable to retrieve Elections');
    }
  );
  

  /* function implementation
  -------------------------- */

  
}


