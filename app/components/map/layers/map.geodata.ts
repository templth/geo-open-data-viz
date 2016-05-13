import {Component, Input, ElementRef} from '@angular/core';
import {GeodataLayer} from '../../../model/map.model';
import {GEODATA_DEFAULTS} from './layers.defaults';
import {getPropertyValue} from '../../../utils/properties.utils';

declare var d3: any;
declare var topojson: any;

@Component({
  selector: '[geodata]',
  template: `
  `
})
export class GeodataLayerComponent {
  @Input()
  layer: GeodataLayer;
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
    let layerElement = d3.select(this.eltRef.nativeElement);

    d3.json('data/continent.json', (data) => {
      let features = topojson.feature(data,
    	  data.objects['countries']).features;

      var backgroundFill = getPropertyValue(this.layer, 'styles', 'background', 'fill');
      backgroundFill = backgroundFill || GEODATA_DEFAULTS.BACKGROUND_FILL;
      var linesStroke = getPropertyValue(this.layer, 'styles', 'lines', 'stroke');
      linesStroke = linesStroke || GEODATA_DEFAULTS.LINES_STROKE;
      var linesStrokeWidth = getPropertyValue(this.layer, 'styles', 'lines', 'strokeWidth');
      linesStrokeWidth = linesStrokeWidth || GEODATA_DEFAULTS.LINES_STROKE_WIDTH;
      var linesStrokeOpacity = getPropertyValue(this.layer, 'styles', 'lines', 'strokeOpacity');
      linesStrokeOpacity = linesStrokeOpacity || GEODATA_DEFAULTS.LINES_STROKE_OPACITY;

      // TODO: 
      /*
      fill: {
                categorical: {
                  name: 'category20b',
                  value: 'i'
                }
      */

    var color = d3.scale.category20c();
    var colorRangeSize = 20;
    var neighbors = topojson.neighbors(data.objects.countries.geometries);
    //var countries = topojson.feature(data, data.objects.countries).features;

  var pathElements = layerElement.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('id', function(d) { return d.id; })
        .attr('d', this.path)
        //.style('fill', backgroundFill)
        .style('fill', (d, i) => {
      // See https://gist.github.com/jasondavies/4188334
      //return color(i * colorRangeSize);
      //console.log(neighbors[i]);
      d.color = d3.max(neighbors[i], function(n) {
        //console.log('n = ' + n);
        return features[n].color || 0;
      }) + 1
      d.color = d.color * colorRangeSize;
      //console.log('--> ' + d.color);
      return color(d.color);
        })
        .style('stroke', linesStroke)
        .style('stroke-width', linesStrokeWidth)
        .style('stroke-opacity', linesStrokeOpacity)
        .on('hover', () => console.log('hover'))
        .on('blur', () => console.log('blur'));
    });

    this.initialized = true;
  }
}