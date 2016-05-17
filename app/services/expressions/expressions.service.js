//import {Parser} from 'parser';
//import Parser from 'parser';
"use strict";
//declare var Parser: any;
//console.log('parser = ' + Parser);
var ExpressionsService = (function () {
    //private parser: any;
    function ExpressionsService() {
        //this.parser = new Parser();
    }
    ExpressionsService.prototype.parse = function (expression) {
        //return Parser.parse(expression);
        return null;
    };
    ExpressionsService.prototype.evaluate = function (expression, context) {
        /*if (typeof expression === 'string') {
          expression = Parser.parse(expression);
        }
          return expression.evaluate(context);*/
        var variables = [];
        if (context) {
            Object.keys(context).forEach(function (key) {
                variables.push("var " + key + " = " + JSON.stringify(context[key]) + ";");
            });
        }
        return eval(variables.join('\n') + expression);
        //return this.parser.parse(expression).evaluate(context);
    };
    return ExpressionsService;
}());
exports.ExpressionsService = ExpressionsService;
//# sourceMappingURL=expressions.service.js.map