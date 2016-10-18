/*jslint node: true */
'use strict';

angular.module('NgDialogUtil', ['ngDialog'])

  .factory('NgDialogFactory', NgDialogFactory);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

NgDialogFactory.$inject = ['$rootScope', 'ngDialog'];

function NgDialogFactory ($rootScope, ngDialog) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  var factory = {
    open: open,
    openAndHandle: openAndHandle,
    close: close,
    error: error,
    message: message,
    isNgDialogCancel: isNgDialogCancel,
  };
  
  return factory;

  /* function implementation
    -------------------------- */

  /**
   * Wrapper for the ngDialog open function
   * @param   {object} options dialog options
   * @see https://github.com/likeastore/ngDialog#options
   * @returns {object} dialog properties
   * @see https://github.com/likeastore/ngDialog#returns
   */
  function open (options) {
    return ngDialog.open(options);
  }
  
  /**
   * Display a dialog and process the result
   * @param   {object}   options dialog options
   * @see https://github.com/likeastore/ngDialog#options
   * @param {function} process Function to process result
   * @param {function} cancel  Function to handle a dialog cancel
   * @returns {object} dialog properties
   * @see https://github.com/likeastore/ngDialog#returns
   */
  function openAndHandle (options, process, cancel) {
    var dialog = ngDialog.open(options);

    dialog.closePromise.then(function (data) {
      if (!isNgDialogCancel(data.value)) {
        if (process) {
          process(data.value);
        }
      } else {
        if (cancel) {
          cancel();
        }
      }
    });
    return dialog;
  }
  
  
  /**
   * Wrapper for ngDialog close function
   * @param {string}   id    id of dialog to close
   * @param {[[Type]]} value optional value to resolve the dialog promise with
   * @see https://github.com/likeastore/ngDialog#closeid-value
   */
  function close (id, value) {
    ngDialog.close (id,value);
  }
  
  /**
   * Display an error dialog
   * @param {object} response http response
   * @param {string} title    Dialog title
   */
  function error(response, title) {

    // response is message
    $rootScope.errortitle = title;
    $rootScope.errormessage = '';
    if (response) {
      if (response.data) {
        if (response.data.err) {
          $rootScope.errormessage = response.data.err.message;
        } else if (response.data.message) {
          $rootScope.errormessage = response.data.message;
        }
      } else if (response.status <= 0) {
        // status codes less than -1 are normalized to zero. -1 usually means the request was aborted
        $rootScope.errormessage = 'Request aborted';
      }
    }
    if (!$rootScope.errormessage) {
      $rootScope.errormessage = 'Unknown error';
    }
    ngDialog.openConfirm({ template: 'views/errormodal.html', scope: $rootScope });
  }

  /**
   * Display a message dialog
   * @param {string} title   Dialog title
   * @param {string} message message to display
   */
  function message(title, message) {

    // response is message
    $rootScope.title = title;
    $rootScope.message = message;
    ngDialog.openConfirm({ template: 'views/messagemodal.html', scope: $rootScope });
  }

  /**
   * Check if reason for an ngDialog close was cancel
   * @param   {string}  data ngDialog result
   * @returns {boolean} true if reasonwas cancel, false otherwise
   */
  function isNgDialogCancel (data) {
    return ((data === 'cancel') || (data === '$closeButton'));
  }
  

  
}
