//import {Parser} from 'parser';
//import Parser from 'parser';

declare var Parser: any;

//console.log('parser = ' + Parser);
export class ExpressionsService {

  parse(expression:string) {
	return Parser.parse(expression);
  }

  evaluate(expression:string|any, context?:any) {
    if (typeof expression === 'string') {
	  expression = Parser.parse(expression);
    }
	return expression.evaluate(context);
  }
}