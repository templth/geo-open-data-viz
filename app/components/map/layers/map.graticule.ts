import {Component, Input, ElementRef} from '@angular/core';
import {isPresent} from '@angular/compiler/src/facade/lang';
import {GraticuleLayer} from '../../../model/map.model';
import {GRATICULE_DEFAULTS} from './layers.defaults';
import {getPropertyValue} from '../../../utils/properties.utils';

declare var d3: any;

@Component({
	selector: '[graticule]',
	template: `
	`
})
export class GraticuleLayerComponent {
  @Input()
  layer: GraticuleLayer;
  @Input()
  path: any;

  initialized: boolean = false;

  constructor(private eltRef: ElementRef) {
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
    var graticule = d3.geo.graticule()
      /*.extent([[-180, 27], [180 + 1e-6, 57 + 1e-6]])
      .step([3, 3])*/;

    layerElement.append('defs').append('path')
      .datum({ type: 'Sphere' })
      .attr('id', 'sphere')
      .attr('d', this.path);

    var borderStroke = getPropertyValue(this.layer, 'styles', 'border', 'stroke');
    borderStroke = borderStroke || GRATICULE_DEFAULTS.BORDER_STROKE;
    var borderStrokeWidth = getPropertyValue(this.layer, 'styles', 'border', 'strokeWidth');
    borderStrokeWidth = borderStrokeWidth || GRATICULE_DEFAULTS.BORDER_STROKE_WIDTH;
    layerElement.append('use')
      .style('stroke', borderStroke)
      .style('stroke-width', borderStrokeWidth)
      .style('fill', 'none')
      .attr('xlink:href', '#sphere');

    var backgroundFill = getPropertyValue(this.layer, 'styles', 'background', 'fill');
    backgroundFill = backgroundFill || GRATICULE_DEFAULTS.BACKGROUND_FILL;
    layerElement.append('use')
      .style('fill', backgroundFill)
      .attr('xlink:href', '#sphere');

    var linesStroke = getPropertyValue(this.layer, 'styles', 'lines', 'stroke');
    linesStroke = linesStroke || GRATICULE_DEFAULTS.LINES_STROKE;
    var linesStrokeWidth = getPropertyValue(this.layer, 'styles', 'lines', 'strokeWidth');
    linesStrokeWidth = linesStrokeWidth || GRATICULE_DEFAULTS.LINES_STROKE_WIDTH;
    var linesStrokeOpacity = getPropertyValue(this.layer, 'styles', 'lines', 'strokeOpacity');
    linesStrokeOpacity = linesStrokeOpacity || GRATICULE_DEFAULTS.LINES_STROKE_OPACITY;
    layerElement.append('path')
      .attr('id', 'layer.id')
      .datum(graticule)
      .style('fill', 'none')
      .style('stroke', linesStroke)
      .style('stroke-width', linesStrokeWidth)
      .style('stroke-opacity', linesStrokeOpacity)
      .attr('d', this.path);

    this.initialized = true;
  }
}