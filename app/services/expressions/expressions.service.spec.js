"use strict";
var testing_1 = require('@angular/core/testing');
var expressions_service_1 = require('./expressions.service');
testing_1.describe('Test expressions', function () {
    testing_1.it('should support literals', function () {
        var service = new expressions_service_1.ExpressionsService();
        testing_1.expect(service.evaluate('10')).toEqual(10);
        testing_1.expect(service.evaluate('10.1')).toEqual(10.1);
        testing_1.expect(service.evaluate('"begin"+"end"')).toEqual('beginend');
        testing_1.expect(service.evaluate('"10"+"11"')).toEqual('1011');
        testing_1.expect(service.evaluate('10+11')).toEqual(21);
        testing_1.expect(service.evaluate('"10"+"11"')).toEqual('1011');
        testing_1.expect(service.evaluate('["10", "11"]')).toEqual(['10', '11']);
    });
    testing_1.it('should support context', function () {
        var service = new expressions_service_1.ExpressionsService();
        testing_1.expect(service.evaluate('test', { test: 10 })).toEqual(10);
        testing_1.expect(service.evaluate('test', { test: 10.1 })).toEqual(10.1);
        testing_1.expect(service.evaluate('test', { test: '10' })).toEqual('10');
        testing_1.expect(service.evaluate('test+test1', { test: 'begin', test1: 'end' })).toEqual('beginend');
        testing_1.expect(service.evaluate('test+test1', { test: 10, test1: 11 })).toEqual(21);
        testing_1.expect(service.evaluate('[test, test1]', { test: 10, test1: 11 })).toEqual([10, 11]);
        testing_1.expect(service.evaluate('test+test1', { test: '10', test1: '11' })).toEqual('1011');
        testing_1.expect(service.evaluate('[test, test1]', { test: '10', test1: '11' })).toEqual(['10', '11']);
    });
    testing_1.it('should support condition', function () {
        var service = new expressions_service_1.ExpressionsService();
        testing_1.expect(service.evaluate('test === 10 ? "first" : "second"', { test: 10 })).toEqual('first');
        testing_1.expect(service.evaluate('test === 10 ? "first" : "second"', { test: 11 })).toEqual('second');
    });
    testing_1.xit('should support function', function () {
        var service = new expressions_service_1.ExpressionsService();
        var fct = service.evaluate('function test(d, i) { return prefix + " " + d.tabs[i]; }', { prefix: 'pref:' });
        testing_1.expect().toEqual(fct({ tab: [10, 11] }, 1)).toEqual('pref 11');
    });
});
//# sourceMappingURL=expressions.service.spec.js.map