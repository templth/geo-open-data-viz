import {Component, Input, ElementRef} from '@angular/core';
import {isPresent} from '@angular/compiler/src/facade/lang';

import {AbstractLayer} from './map.layer';
import {GraticuleLayer} from '../../../model/map.model';
import {GRATICULE_DEFAULTS} from './layers.defaults';
import {getPropertyValue, hasProperty} from '../../../utils/properties.utils';
import {MapUpdateService} from '../../../services/map/map.update.service';

declare var d3: any;

/**
 * A graticule layer can be configured using the following content:
 *
 * {
 *   id: 'graticule',
 *   type: 'graticule',
 *   styles: {
 *     border: {
 *       stroke: '',
 *       strokeWidth: ''
 *     },
 *     background: {
 *       fill: ''
 *     },
 *     lines: {
 *       stroke: '',
 *       strokeWidth: '',
 *       strokeOpacity: '',
 *     }
 *   }
 * }
 */

@Component({
	selector: '[graticule]',
	template: `
	`
})
export class GraticuleLayerComponent extends AbstractLayer {
  @Input()
  layer: GraticuleLayer;
  @Input()
  path: any;

  constructor(private eltRef: ElementRef,
      private updateService: MapUpdateService) {
    super();
  }

  /**
   * Detect path updates
   */
  ngOnChanges(changes) {
    if (this.initialized && changes.path) {
      var layerElement = d3.select(this.eltRef.nativeElement);
      layerElement.selectAll('path').attr('d', this.path);
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

    // Borders
    if (this.hasStylesBorderStroke(updates.diffs)) {
      d3.select('#borders').style('stroke', 
        this.getStylesBorderStroke(updates.diffs));
    }
    if (this.hasStylesBorderStrokeWidth(updates.diffs)) {
      d3.select('#borders').style('stroke-width',
        this.getStylesBorderStrokeWidth(updates.diffs));
    }

    // Fill
    if (this.hasStylesBackgroundFill(updates.diffs)) {
      d3.select('#fill').style('fill',
        this.getStylesBackgroundFill(updates.diffs));
    }

    // Lines
    if (this.hasStylesLinesStroke(updates.diffs)) {
      d3.select('#lines').style('stroke',
        this.getStylesLinesStroke(updates.diffs));
    }
    if (this.hasStylesLinesStrokeWidth(updates.diffs)) {
      d3.select('#lines').style('stroke-width',
        this.getStylesLinesStrokeWidth(updates.diffs));
    }
    if (this.hasStylesLinesStrokeOpacity(updates.diffs)) {
      d3.select('#lines').style('stroke-opacity',
        this.getStylesLinesStrokeOpacity(updates.diffs));
    }
  }

  /**
    * Trigger the graticule layer initialization
    */
  ngAfterViewInit() {
    this.initializeLayer();
  }

  /** 
    * Initialize the graticule layer
    */
  initializeLayer() {
    var layerElement = d3.select(this.eltRef.nativeElement);
    var graticule = d3.geo.graticule()
      /*.extent([[-180, 27], [180 + 1e-6, 57 + 1e-6]])
      .step([3, 3])*/;

    layerElement.append('defs').append('path')
      .datum({ type: 'Sphere' })
      .attr('id', 'sphere')
      .attr('d', this.path);

    // Use element for borders
    var borderStroke = this.getStylesBorderStroke(this.layer);
    var borderStrokeWidth = this.getStylesBorderStrokeWidth(this.layer);
    layerElement.append('use')
      .attr('id', 'borders')
      .style('stroke', borderStroke)
      .style('stroke-width', borderStrokeWidth)
      .style('fill', 'none')
      .attr('xlink:href', '#sphere');

    // Use element for background
    var backgroundFill = this.getStylesBackgroundFill(this.layer);
    layerElement.append('use')
      .attr('id', 'fill')
      .style('fill', backgroundFill)
      .attr('xlink:href', '#sphere');

    // Path element for lines
    var linesStroke = this.getStylesLinesStroke(this.layer);
    var linesStrokeWidth = this.getStylesLinesStrokeWidth(this.layer);
    var linesStrokeOpacity = this.getStylesLinesStrokeOpacity(this.layer);
    layerElement.append('path')
      .attr('id', 'lines')
      .datum(graticule)
      .style('fill', 'none')
      .style('stroke', linesStroke)
      .style('stroke-width', linesStrokeWidth)
      .style('stroke-opacity', linesStrokeOpacity)
      .attr('d', this.path);

    this.initialized = true;
    this.layerLoaded.next(true);
  }

  // Direct getters for property values

  hasStylesBorderStroke(obj: any) {
    return hasProperty(obj,
      ['styles', 'border', 'stroke']);
  }

  getStylesBorderStroke(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'border', 'stroke'],
        GRATICULE_DEFAULTS.BORDER_STROKE);
  }

  hasStylesBorderStrokeWidth(obj: any) {
    return hasProperty(obj,
      ['styles', 'border', 'strokeWidth']);
  }

  getStylesBorderStrokeWidth(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'border', 'strokeWidth'],
        GRATICULE_DEFAULTS.BORDER_STROKE_WIDTH);
  }

  hasStylesBackgroundFill(obj: any) {
    return hasProperty(obj,
      ['styles', 'background', 'fill']);
  }

  getStylesBackgroundFill(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'background', 'fill'],
        GRATICULE_DEFAULTS.BACKGROUND_FILL);
  }

  hasStylesLinesStroke(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'stroke']);
  }

  getStylesLinesStroke(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'stroke'],
        GRATICULE_DEFAULTS.LINES_STROKE);
  }

  hasStylesLinesStrokeWidth(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'strokeWidth']);
  }

  getStylesLinesStrokeWidth(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'strokeWidth'],
        GRATICULE_DEFAULTS.LINES_STROKE_WIDTH);
  }

  hasStylesLinesStrokeOpacity(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'strokeOpacity']);
  }

  getStylesLinesStrokeOpacity(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'strokeOpacity'],
        GRATICULE_DEFAULTS.LINES_STROKE_OPACITY);
  }

}