//import {Parser} from 'parser';
//import Parser from 'parser';

//declare var Parser: any;

//console.log('parser = ' + Parser);
export class ExpressionsService {
  //private parser: any;

  constructor() {
    //this.parser = new Parser();
  }

  parse(expression:string) {
    //return Parser.parse(expression);
    return null;
  }

  evaluate(expression:string|any, context?:any) {
    /*if (typeof expression === 'string') {
	  expression = Parser.parse(expression);
    }
	  return expression.evaluate(context);*/
    var variables = [];
    if (context) {
      Object.keys(context).forEach((key) => {
        variables.push(`var ${key} = ${JSON.stringify(context[key])};`);
      });
    }
    return eval(variables.join('\n')+expression);
    //return this.parser.parse(expression).evaluate(context);
  }
}