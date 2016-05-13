import {Component, Input, ElementRef} from '@angular/core';
import {isPresent} from '@angular/compiler/src/facade/lang';
import {GraticuleLayer} from '../../../model/map.model';
import {GRATICULE_DEFAULTS} from './layers.defaults';
import {getPropertyValue} from '../../../utils/properties.utils';
import {ExpressionsService} from '../../../services/expressions/expressions.service';

declare var d3: any;

@Component({
  selector: '[shape]',
  template: `
  `
})
export class ShapeLayerComponent {
  @Input()
  layer: any;
  @Input()
  path: any;

  initialized: boolean = false;

  constructor(private eltRef: ElementRef, private expressionService:ExpressionsService) {
  }

  ngOnChanges(changes) {
    if (this.initialized && changes.path) {
      var layerElement = d3.select(this.eltRef.nativeElement);
      layerElement.selectAll('path').attr('d', this.path);
    }
  }

  ngAfterViewInit() {
    this.initializeLayer();
  }

  initializeLayer() {
    var layerElement = d3.select(this.eltRef.nativeElement);

    var r = this.expressionService.evaluate('test', { test: 19 });
    console.log('r = ' + r);

    d3.csv('data/meteorites.csv', (features) => {
			var circle = d3.geo.circle();
			var pathElements = layerElement.selectAll('path')
				.data(features)
				.enter()
				.append('path')
				.datum((d, i) => {
					//console.log('datum - d = '+JSON.stringify(d));
					//var orig = this.expressionService.evaluate('d.reclat + d.reclong', { d, i });
					//console.log(orig);
					var orig = [d.reclat, d.reclong];/*expressionService.evaluateExpression(origin,
					d, i, additionalContext);*/
						orig[0] = parseFloat(orig[0]);
					orig[1] = parseFloat(orig[1]);
					/*var rad = expressionService.evaluateExpression(radius,
					d, i, additionalContext);
					rad = parseFloat(rad);*/
					var c = circle
						.origin(orig)
						.angle(10)({d,i});
					console.log('c = ' + c);
					c.d = d;
					return c;
				})
				.attr('id', function(d) {
					return d.d.name;
				})
				.attr('class', 'point')
				.attr('d', this.path)
				//.style('fill-opacity', 0.0)
				.style('opacity', 0.75)
				.style('fill', 'rgb(254, 178, 76)');
		});


		this.initialized = true;
	}
}