/*jslint node: true */
'use strict';

angular.module('canvassTrac')

  .service('menuFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    this.getDishes = function () {
      // need to update dishes with new comments, so need a custom PUT action as the default resource "class" object doesn't have one
      return $resource(baseURL + 'dishes/:id', null, {'update': {method: 'PUT'}});
    };


    // implement a function named getPromotion
    // that returns a selected promotion.

    this.getPromotion = function () {
      // only getting promos, so no need for a custom action as the default resource "class" object has get/query
      return $resource(baseURL + 'promotions/:id', null, null);
    };

  }])

  .factory('corporateFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    var corpfac = {};

    corpfac.getLeader = function () {
      // only getting leaders, so no need for a custom action as the default resource "class" object has get/query
      return $resource(baseURL + 'leadership/:id', null, null);
    };

    return corpfac;
  }])

  .factory('feedbackFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    var feedbackfac = {};

    feedbackfac.putFeedback = function () {
      // default resource "class" object contains a save method so no need for a custom action
      return $resource(baseURL + 'feedback/', null, null);
    };

    return feedbackfac;
  }]);


