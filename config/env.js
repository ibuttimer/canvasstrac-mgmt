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
  window.__env.baseURL = "@@baseURL";
  window.__env.forceHttps = @@forceHttps;
  window.__env.httpPort = @@httpPort;
  window.__env.httpsPortOffset = @@httpsPortOffset;
  window.__env.socketTimeout = @@socketTimeout;

  window.__env.disableAuth = @@disableAuth;

  // management app settings
  window.__env.mapsApiKey = "@@mapsApiKey";

  window.__env.autoLogout = "@@autoLogout";
  window.__env.autoLogoutCount = "@@autoLogoutCount";
  window.__env.tokenRefresh = "@@tokenRefresh";
  window.__env.reloadMargin = "@@reloadMargin";

  window.__env.DEV_MODE = @@DEV_MODE;
  window.__env.DEV_USER1 = "@@DEV_USER1";
  window.__env.DEV_PASSWORD1 = "@@DEV_PASSWORD1";
  window.__env.DEV_USER2 = "@@DEV_USER2";
  window.__env.DEV_PASSWORD2 = "@@DEV_PASSWORD2";
  window.__env.DEV_USER3 = "@@DEV_USER3";
  window.__env.DEV_PASSWORD3 = "@@DEV_PASSWORD3";

  /* TODO debug flags really need some work */
  // client common flags
  window.__env.dbgstoreFactory = @@storeFactory;
  window.__env.dbglocalStore = @@localStore;
  window.__env.dbgsurveyFactory = @@surveyFactory;
  window.__env.dbgcanvassFactory = @@canvassFactory;
  window.__env.dbgelectionFactory = @@electionFactory;

  //  mgmt client app flags
  window.__env.dbgCanvassController = @@CanvassController;
  window.__env.dbgCanvassActionController = @@CanvassActionController;
  window.__env.dbgSurveyController = @@SurveyController;
  window.__env.dbgHeaderController = @@HeaderController;
  window.__env.dbgElectionController = @@ElectionController;
  window.__env.dbgCanvassController = @@CanvassController;
  window.__env.dbgCanvassAddressController = @@CanvassAddressController;

}(this));
