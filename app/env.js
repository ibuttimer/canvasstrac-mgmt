/**
 * Assign __env to the root window object.
 *
 * The goal of this file is to allow the deployment
 * process to pass in environment values into the application.
 *
 * The deployment process can overwrite this file to pass in
 * custom values:
 *
 * window.__env = window.__env || {};
 * window.__env.url = 'some-url';
 * window.__env.key = 'some-key';
 *
 * Keep the structure flat (one level of properties only) so
 * the deployment process can easily map environment keys to
 * properties.
 *
 * Based on this example
 *  http://plnkr.co/edit/XvFh4CkCYM7QgS9Fg8Kz
 * from
 *  http://www.jvandemo.com/how-to-configure-your-angularjs-application-using-environment-variables/
 *
 * And here's a nice explaination of IIFE
 *  https://toddmotto.com/what-function-window-document-undefined-iife-really-means/
 */

(function (window) {
  window.__env = window.__env || {};

  // server/management app common settings
  window.__env.baseURL = "localhost";
  window.__env.forceHttps = false;
  window.__env.httpPort = 4000;
  window.__env.httpsPortOffset = 443;
  window.__env.socketTimeout = 120000;

  // management app settings
  window.__env.mapsApiKey = "";

  window.__env.autoLogout = "2000";
  window.__env.autoLogoutCount = "10";
  window.__env.tokenRefresh = "1000";
  window.__env.reloadMargin = "60";

  window.__env.DEV_MODE = true;
  window.__env.DEV_USER1 = "";
  window.__env.DEV_PASSWORD1 = "";
  window.__env.DEV_USER2 = "";
  window.__env.DEV_PASSWORD2 = "";
  window.__env.DEV_USER3 = "";
  window.__env.DEV_PASSWORD3 = "";

  /* TODO debug flags really need some work */
  window.__env.dbgstoreFactory = false;
  window.__env.dbglocalStore = false;
  window.__env.dbgsurveyFactory = true;
  window.__env.dbgcanvassFactory = true;
  window.__env.dbgelectionFactory = true;
  window.__env.dbgCanvassController = true;
  window.__env.dbgCanvassActionController = true;
  window.__env.dbgSurveyController = true;
  window.__env.dbgHeaderController = true;
  window.__env.dbgElectionController = true;
  window.__env.dbgCanvassController = true;
  window.__env.dbgCanvassAddressController = false;
  window.__env.dbgnavService = true;

}(this));
