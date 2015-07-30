'use strict';

angular.module('mapManager.utilities', [ ])

// Map creator service

/**
 * @ngdoc service
 * @name mapManager.utilities:valueChecker
 * @description
 * Provide functions to check values.
 */
.service('valueChecker', function() {
  return {
    /**
     * @ngdoc method
     * @name isNull
     * @methodOf mapManager.utilities:attributeChecker
     * @description
     * Check if a value is null or undefined.
     *
     * @param {Object} val the value to check
    */
    isNull: function(val) {
      return _.isUndefined(val) || _.isNull(val);
    },

    /**
     * @ngdoc method
     * @name isNull
     * @methodOf mapManager.utilities:attributeChecker
     * @description
     * Check if a value is null, undefined or empty.
     *
     * @param {Object} val the value to check
    */
    isNullOrEmpty: function(val) {
      return this.isNull(val) || _.isEmpty(val);
    },

    /**
     * @ngdoc method
     * @name isNotNull
     * @methodOf mapManager.utilities:attributeChecker
     * @description
     * Check if a value isn't null and undefined.
     *
     * @param {Object} val the value to check
    */
    isNotNull: function(val) {
      return !_.isUndefined(val) && !_.isNull(val);
    },

    /**
     * @ngdoc method
     * @name isNotNullAndNotEmpty
     * @methodOf mapManager.utilities:attributeChecker
     * @description
     * Check if a value isn't null, undefined and
     * not empty.
     *
     * @param {Object} val the value to check
    */
    isNotNullAndNotEmpty: function(val) {
      return this.isNotNull(val) && !_.isEmpty(val);
    }
  };
});