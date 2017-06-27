/*jslint node: true */
'use strict';

angular.module('NgDialogUtil', ['ngDialog'])

  .factory('NgDialogFactory', NgDialogFactory);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

NgDialogFactory.$inject = ['authFactory', 'ngDialog', '$state', 'STATES', 'RSPCODE'];

function NgDialogFactory (authFactory, ngDialog, $state, STATES, RSPCODE) {

  // Bindable Members Up Top, https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y033
  var factory = {
    open: open,
    openAndHandle: openAndHandle,
    close: close,
    closeAll: closeAll,
    error: error,
    message: message,
    errormessage: errormessage,
    isNgDialogCancel: isNgDialogCancel,
    yesNoDialog: yesNoDialog
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
   * @param {string}   id    id of dialog to close. If id is not specified it will close all currently active modals.
   * @param {[[Type]]} value optional value to resolve the dialog promise with
   * @see https://github.com/likeastore/ngDialog#closeid-value
   */
  function close (id, value) {
    ngDialog.close (id,value);
  }
  
  /**
   * Wrapper for ngDialog closeAll function
   * @param {[[Type]]} value optional value to resolve the dialog promise with
   * @see https://github.com/likeastore/ngDialog#closeallvalue
   */
  function closeAll (value) {
    ngDialog.closeAll (value);
  }

  /**
   * Display an error dialog from a server response
   * @param {object} response http response
   * @param {string} title    Dialog title
   */
  function error (response, title) {
    var authErr = false,
      options = {
        template: 'views/errormodal.html',
        className: 'ngdialog-theme-default'
      },
      msg;

    // response is message
    if (response) {
      if (!title) {
        switch (response.status) {
          case RSPCODE.HTTP_FORBIDDEN:
            title = 'Access denied';
            break;
          default:
            if (response.status <= 0) {
              title = 'Aborted';
            } else {
              title = 'Error ' + response.status + ': ' + response.statusText;
            }
            break;
        }
      }

      if (response.data) {
        if (response.data.err) {
          msg = response.data.err.message;
        } else if (response.data.message) {
          msg = response.data.message;
        }
      } else if (response.status <= 0) {
        // status codes less than -1 are normalized to zero. -1 usually means the request was aborted
        msg = 'Request aborted';
      }

      authErr = authFactory.checkForAuthError(response);
    }
    if (!msg) {
      msg = 'Unknown error';
    }

    options.data = {
      title: title,
      message: msg
    };

    if (authErr) {
      ngDialog.openConfirm(options)
        .then( function (value) {
	          gotoHome();
            return value;
	         }, function (reason) {
	          gotoHome();
	          return reason;
	        });
    } else {
      ngDialog.openConfirm(options);
    }
  }

  /**
   * Got to the home screen
   */
  function gotoHome () {
    $state.go(STATES.APP);
  }

  /**
   * Display a message dialog
   * @param {string} title   Dialog title
   * @param {string} message message to display
   */
  function message (title, message) {

    // response is message
    ngDialog.openConfirm({
      template: 'views/messagemodal.html',
      className: 'ngdialog-theme-default',
      data: { title: title, message: message }
    });
  }

  /**
   * Display an error message dialog
   * @param {string} title   Dialog title
   * @param {string} message message to display
   */
  function errormessage (title, message) {
    ngDialog.openConfirm({
      template: 'views/errormodal.html',
      className: 'ngdialog-theme-default',
      data: { title: title, message: message }
    });
  }

  /**
   * Check if reason for an ngDialog close was cancel
   * @param   {string}  data ngDialog result
   * @returns {boolean} true if reasonwas cancel, false otherwise
   */
  function isNgDialogCancel (data) {
    return ((data === undefined) ||   // ngDialog.close
            (data === 'cancel') || (data === '$closeButton') || (data === '$escape') || (data === '$document'));
  }
  
  /**
   * Display a message dialog with yes/no buttons
   * @param {string} title   Dialog title
   * @param {string} message message to display
   * @param {function} process Function to process result
   * @param {function} cancel  Function to handle a dialog cancel
   * @returns {object} dialog properties
   * @see https://github.com/likeastore/ngDialog#returns
   */
  function yesNoDialog (title, message, process, cancel) {

    var options = {
      template: 'views/yesno.modal.html',
      className: 'ngdialog-theme-default',
      data: { title: title, message: message }
    };
    return openAndHandle(options, process, cancel);
  }
  
}
