//import {Parser} from 'parser';
//import Parser from 'parser';
"use strict";
//console.log('parser = ' + Parser);
var ExpressionsService = (function () {
    function ExpressionsService() {
    }
    ExpressionsService.prototype.parse = function (expression) {
        return Parser.parse(expression);
    };
    ExpressionsService.prototype.evaluate = function (expression, context) {
        if (typeof expression === 'string') {
            expression = Parser.parse(expression);
        }
        return expression.evaluate(context);
    };
    return ExpressionsService;
}());
exports.ExpressionsService = ExpressionsService;
//# sourceMappingURL=expressions.service.js.map