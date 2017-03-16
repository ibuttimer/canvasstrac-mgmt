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

  // management app settings
  window.__env.apiKey = "@@mapsApiKey";

  window.__env.DEV_MODE = @@DEV_MODE;
  window.__env.DEV_USER = "@@DEV_USER";
  window.__env.DEV_PASSWORD = "@@DEV_PASSWORD";

  window.__env.storeFactory = @@storeFactory;
  window.__env.localStorage = @@localStorage;
  window.__env.surveyFactory = @@surveyFactory;
  window.__env.canvassFactory = @@canvassFactory;
  window.__env.electionFactory = @@electionFactory;
  window.__env.CanvassController = @@CanvassController;
  window.__env.CanvassActionController = @@CanvassActionController;
  window.__env.SurveyController = @@SurveyController;
  window.__env.navService = @@navService;

}(this));
