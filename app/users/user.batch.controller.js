/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .directive('file', function(){
      // Based on http://angularjstutorial.blogspot.ie/2012/12/angularjs-with-input-file-directive.html#.WWi57YjyuHs
      return {
          scope: {
              file: '='   // bidirectional binding
          },
          /**
           * Directive link function
           * @param {object} scope   Scope object
           * @param {object} element jqLite-wrapped element that this directive matches
           * @param {object} attrs   hash object with key-value pairs of normalized attribute names and their corresponding attribute values
           */
          link: function(scope, element, attrs){
              element.bind('change', function(event){
                  var file = event.target.files[0];
                  scope.file = file ? file : undefined;
                  scope.$apply();
              });
          }
      };
  })

  .controller('UserBatchController', UserBatchController);

/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

UserBatchController.$inject = ['$scope', 'roleFactory', 'userFactory', 'userService', 'NgDialogFactory', 'stateFactory', 'controllerUtilFactory', 'miscUtilFactory', 'USERSCHEMA', 'STATES', 'UTIL', 'DEBUG'];

function UserBatchController($scope, roleFactory, userFactory, userService, NgDialogFactory, stateFactory, controllerUtilFactory, miscUtilFactory, USERSCHEMA, STATES, UTIL, DEBUG) {

  if (DEBUG.devmode) {
    $scope.debug = DEBUG;
  }

  $scope.param = {};
  $scope.errors = [];

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  $scope.processForm = processForm;


  /* function implementation
  -------------------------- */

  function processForm() {

    $scope.errors = [];

    if ($scope.param.file) {
      var reader = new FileReader();
      reader.onload = function (event) {
        // The file's text will be printed here
        console.log(event.target.result);
        
        var obj;
        try {
          obj = JSON.parse(event.target.result);
          
          userFactory.save('batch', obj,
            // success function
            function (response) {
              $scope.errors = response.errors;

              $scope.param = {};
              $scope.userBatchForm.$setPristine();

              var info = getResultTitleMsg(response);
              NgDialogFactory.message(info.title, info.msg);
            },
            // error function
            function (response) {
              $scope.errors = response.data.errors;
            
              var info = getResultTitleMsg(response.data);
              NgDialogFactory.errormessage(info.title, info.msg);
            }
          );
          
        }
        catch (ex) {
          NgDialogFactory.errormessage('Error', ex.message);
        }
        
      };
      reader.readAsText($scope.param.file);
    }
    
  }
  
  function getResultTitleMsg (result) {
    var title,
      msg = [];
    if (result.failed > 0) {
      if (result.created === 0) {
        title = 'Processing Unsuccessful';
      } else {
        title = 'Processing Partially Completed';
        msg.push(puraliseMsg(result.created, 'user', 'created'));
      }
      msg.push(puraliseMsg(result.failed, 'error', 'error during processing'));
    } else if ((result.failed === 0) && (result.created === 0)) {
      title = 'Nothing Processed';
      msg.push('Please verify input file');
    } else {
      title = 'Processing Completed';
      msg.push(puraliseMsg(result.created, 'user', 'created'));
    }
    return {
      title: title,
      msg: msg
    };
  }

  function puraliseMsg (count, noun, base) {
    var msg;
    if (count === 1) {
      msg = '1 ' + noun + ' ' + base;
    } else if (count === 0) {
      msg = 'No ' + noun + 's ' + base;
    } else {
      msg = count + ' ' + noun + 's ' + base;
    }
    return msg;
  }

}

