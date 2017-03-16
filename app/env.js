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

  // management app settings
  window.__env.apiKey = "";

  window.__env.DEV_MODE = true;
  window.__env.DEV_USER = "";
  window.__env.DEV_PASSWORD = "";

  window.__env.storeFactory = false;
  window.__env.localStorage = false;
  window.__env.surveyFactory = true;
  window.__env.canvassFactory = true;
  window.__env.electionFactory = true;
  window.__env.CanvassController = true;
  window.__env.CanvassActionController = true;
  window.__env.SurveyController = true;
  window.__env.navService = true;

}(this));
