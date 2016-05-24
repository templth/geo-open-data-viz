import {Component, Input, ElementRef} from '@angular/core';
import {isPresent} from '@angular/compiler/src/facade/lang';

import {AbstractLayer} from './map.layer';
import {ShapeCircleLayer} from '../../../model/map.model';
import {SHAPE_CIRCLE_DEFAULTS} from './layers.defaults';
import {getPropertyValue, hasProperty} from '../../../utils/properties.utils';
import {MapService} from '../../../services/map/map.service';
import {MapUpdateService} from '../../../services/map/map.update.service';
import {ExpressionsService} from '../../../services/expressions/expressions.service';

declare var d3: any;

@Component({
  selector: '[shape]',
  template: `
  `
})
export class ShapeCircleLayerComponent extends AbstractLayer {
  @Input()
  layer: ShapeCircleLayer;
  @Input()
  path: any;

  data: any;

  constructor(private eltRef: ElementRef,
      private mapService: MapService,
      private updateService: MapUpdateService,
      private expressionService: ExpressionsService) {
    super();
  }

  /**
   * Detect path updates
   */
  ngOnChanges(changes) {
    if (this.initialized && changes.path) {
      var layerElement = d3.select(this.eltRef.nativeElement);
      layerElement.selectAll('path')
        .attr('d', this.path);
    }
  }

  /**
   * Detect layer configuration updates
   */
  ngOnInit() {
    this.updateService.registerOnLayerConfigurationUpdated(this.layer).subscribe(
      (updates) => {
        this.handleUpdates(updates);
      }
    );
  }

  /**
   * Update layer configuration updates
   */
  handleUpdates(updates) {
    this.layer = updates.layer;

    var pathElements = d3.select(this.eltRef.nativeElement).selectAll('path');

    // Fill
    if (this.hasStylesBackgroundFill(updates.diffs)) {
      pathElements.style('fill',
        this.getStylesBackgroundFill(updates.diffs));
    }
    // Opacity
    if (this.hasStylesBackgroundOpacity(updates.diffs)) {
      pathElements.style('opacity',
        this.getStylesBackgroundOpacity(updates.diffs));
    }

    // Lines
    if (this.hasStylesLinesStroke(updates.diffs)) {
      pathElements.style('stroke',
        this.getStylesLinesStroke(updates.diffs));
    }
    if (this.hasStylesLinesStrokeWidth(updates.diffs)) {
      pathElements.style('stroke-width',
        this.getStylesLinesStrokeWidth(updates.diffs));
    }
    if (this.hasStylesLinesStrokeOpacity(updates.diffs)) {
      pathElements.style('stroke-opacity',
        this.getStylesLinesStrokeOpacity(updates.diffs));
    }
  }

  /**
    * Trigger the layer initialization where data are there
    */
  ngAfterViewInit() {
    this.updateService.registerOnLayerDataLoaded(this.layer).subscribe(data => {
      this.initializeLayer(data.data);
    });
  }

  /** 
    * Initialize the layer based on data
    */
  initializeLayer(data: any) {
    var layerElement = d3.select(this.eltRef.nativeElement);

    var circle = d3.geo.circle();

    var originExpression = this.getShapeOriginExpression(this.layer);
    var radius = this.getShapeRadius(this.layer);
    var radiusExpression = this.getShapeRadiusExpression(this.layer);

    var backgroundFill = this.getStylesBackgroundFill(this.layer);
    var backgroundOpacity = this.getStylesBackgroundOpacity(this.layer);
    var linesStroke = this.getStylesLinesStroke(this.layer);
    var linesStrokeWidth = this.getStylesLinesStrokeWidth(this.layer);
    var linesStrokeOpacity = this.getStylesLinesStrokeOpacity(this.layer);

    var pathElements = layerElement.selectAll('path')
          .data(data)
          .enter()
          .append('path')
          .datum((d, i) => {
            var orig = this.expressionService.evaluate(originExpression,
              { d, i/*, additionalContext*/ });
            orig[0] = parseFloat(orig[0]);
            orig[1] = parseFloat(orig[1]);
            var rad = radiusExpression ?
                this.expressionService.evaluate(radiusExpression,
                   { d, i/*, additionalContext*/ }) :
                radius;
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
          .style('opacity', backgroundOpacity)
          .style('stroke', linesStroke)
          .style('stroke-width', linesStrokeWidth)
          .style('stroke-opacity', linesStrokeOpacity)
          .style('fill', backgroundFill);

    this.initialized = true;
    this.layerLoaded.next(true);
  }

  // Direct getters for property values

  getShapeConfiguration(obj) {
    return getPropertyValue(obj, ['display', 'shape'], {});
  }

  getShapeOriginExpression(obj) {
    return getPropertyValue(obj,
      ['display', 'shape', 'originExpr'],
      '');
  }

  getShapeRadius(obj) {
    return getPropertyValue(obj,
      ['display', 'shape', 'radius'],
      '');
  }

  getShapeRadiusExpression(obj) {
    return getPropertyValue(obj,
      ['display', 'shape', 'radiusExpr'],
      '');
  }

  hasStylesBackgroundFill(obj: any) {
    return hasProperty(obj,
      ['styles', 'background', 'fill']);
  }

  getStylesBackgroundFill(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'background', 'fill'],
      SHAPE_CIRCLE_DEFAULTS.BACKGROUND_FILL);
  }

  hasStylesBackgroundOpacity(obj: any) {
    return hasProperty(obj,
      ['styles', 'background', 'fill']);
  }

  getStylesBackgroundOpacity(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'background', 'opacity'],
      SHAPE_CIRCLE_DEFAULTS.BACKGROUND_OPACITY);
  }

  hasStylesLinesStroke(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'stroke']);
  }

  getStylesLinesStroke(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'stroke'],
      SHAPE_CIRCLE_DEFAULTS.LINES_STROKE);
  }

  hasStylesLinesStrokeWidth(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'strokeWidth']);
  }

  getStylesLinesStrokeWidth(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'strokeWidth'],
      SHAPE_CIRCLE_DEFAULTS.LINES_STROKE_WIDTH);
  }

  hasStylesLinesStrokeOpacity(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'strokeOpacity']);
  }

  getStylesLinesStrokeOpacity(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'strokeOpacity'],
      SHAPE_CIRCLE_DEFAULTS.LINES_STROKE_OPACITY);
  }

}