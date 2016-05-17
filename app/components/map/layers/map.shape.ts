import {Component, Input, ElementRef} from '@angular/core';
import {isPresent} from '@angular/compiler/src/facade/lang';
import {GraticuleLayer} from '../../../model/map.model';
import {SHAPE_DEFAULTS} from './layers.defaults';
import {getPropertyValue, hasProperty} from '../../../utils/properties.utils';
import {MapUpdateService} from '../../../services/map/map.update.service';
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

  constructor(private eltRef: ElementRef,
    private updateService: MapUpdateService,
    private expressionService: ExpressionsService) {
  }

  ngOnChanges(changes) {
    if (this.initialized && changes.path) {
      var layerElement = d3.select(this.eltRef.nativeElement);
      layerElement.selectAll('path').attr('d', this.path);
    }
  }

  ngAfterViewInit() {
    this.updateService.registerOnLayerDataLoaded(this.layer).subscribe(data => {
      this.initializeLayer(data.data);
    });
  }

  initializeLayer(data: any) {
    if (this.isCircleShape(this.layer)) {
      this.initializeCircleShapeLayer(this.layer, data);
    }
    this.initialized = true;
  }

  initializeCircleShapeLayer(layer, data) {
    var layerElement = d3.select(this.eltRef.nativeElement);

    var features = data.filter(d => d.mass > 50000);
    console.log('features = ' + features.length);
    var circle = d3.geo.circle();

    var originExpression = this.getShapeOrigin(this.layer);
    var radiusExpression = this.getShapeRadius(this.layer);
    var opacity = this.getShapeOpacity(this.layer);

    var pathElements = layerElement.selectAll('path')
          .data(features)
          .enter()
          .append('path')
          .datum((d, i) => {
            var orig = this.expressionService.evaluate(originExpression,
              { d, i/*, additionalContext*/ });
            orig[0] = parseFloat(orig[0]);
            orig[1] = parseFloat(orig[1]);
            var rad = this.expressionService.evaluate(radiusExpression,
              { d, i/*, additionalContext*/ });
            console.log('rad = ' + rad);
            rad = parseFloat(rad);
            var c = circle
              .origin(orig)
              .angle(rad)({d,i});
            c.d = d;
            return c;
          })
          .attr('id', function(d) {
            return d.d.name;
          })
          .attr('class', 'point')
          .attr('d', this.path)
          //.style('fill-opacity', 0.0)
          .style('opacity', opacity)
          .style('fill', 'rgb(254, 178, 76)');

  }

  // Direct getters for property values

  getShapeConfiguration(obj) {
    return getPropertyValue(obj, ['display', 'shape'], {});
  }

  isCircleShape(obj) {
    return (getPropertyValue(obj, ['display', 'shape', 'type'], '') === 'circle');
  }

  getShapeOrigin(obj) {
    return getPropertyValue(obj,
      ['display', 'shape', 'origin'],
      '');
  }

  getShapeRadius(obj) {
    return getPropertyValue(obj,
      ['display', 'shape', 'radius'],
      '');
  }

  getShapeOpacity(obj) {
    return getPropertyValue(obj,
      ['display', 'shape', 'opacity'],
      SHAPE_DEFAULTS.SHAPE_OPACITY);
  }
}