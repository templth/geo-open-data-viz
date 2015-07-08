'use strict';

angular.module('mapManager.console', [])
  .service('consoleService', function() {
  	return {
  	  messages: [],
  	  logMessage: function(level, msg) {
  	    this.messages.unshift({
  	      level: level,
  	      description: msg
  	    });
  	  },

  	  clearMessages: function() {
  	  	this.messages = [];
  	  }
  	};
  })

  /*.factory('$exceptionHandler', [ 'consoleService', function(consoleService) {
    return function(exception, cause) {
    	console.log(JSON.stringify(exception));
    	console.log(cause);
      consoleService.logMessage('error', cause);
    };
  }])*/;