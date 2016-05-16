import {
	beforeEach,
	ddescribe,
	xdescribe,
	describe,
	expect,
	iit,
	inject,
	beforeEachProviders,
	setBaseTestProviders,
	it,
	xit
} from '@angular/core/testing';

import {ExpressionsService} from './expressions.service';

describe('Test expressions', () => {
  it('should support literals', () => {
    let service = new ExpressionsService();
    expect(service.evaluate('10')).toEqual(10);
    expect(service.evaluate('10.1')).toEqual(10.1);
    expect(service.evaluate('"10"+"11"')).toEqual('1011');
    expect(service.evaluate('10+11')).toEqual('21');
    expect(service.evaluate('"10"+"11"')).toEqual('1011');
    expect(service.evaluate('["10", "11"]')).toEqual(['10', '11']);
  });

  it('should support context', () => {
    let service = new ExpressionsService();
    expect(service.evaluate('test', {test:10})).toEqual(10);
    expect(service.evaluate('test', { test: 10.1 })).toEqual(10.1);
    expect(service.evaluate('test', { test: '10' })).toEqual('10');
    expect(service.evaluate('test+test1', { test: 10, test1: 11 })).toEqual('1011');
    expect(service.evaluate('[test, test1]',{test:10,test1:11})).toEqual(['10', '11']);
  });

  it('should support condition', () => {
    let service = new ExpressionsService();
    expect(service.evaluate('test === 10 ? "first" : "second"', { test: 10 })).toEqual('first');
    expect(service.evaluate('test === 10 ? "first" : "second"', { test: 11 })).toEqual('second');
  });
});