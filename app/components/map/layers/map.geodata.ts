import {Component, Input, ElementRef} from '@angular/core';
import {GeodataLayer} from '../../../model/map.model';
import {GEODATA_DEFAULTS} from './layers.defaults';
import {getPropertyValue, hasProperty} from '../../../utils/properties.utils';
import {MapUpdateService} from '../../../services/map/map.update.service';
import {ExpressionsService} from '../../../services/expressions/expressions.service';

declare var d3: any;
declare var topojson: any;

/*
 * A geodata layer can be configured using the following content:
 *
 * {
 *   id: 'worldLayer',
 *   type: 'geodata',
 *   rank: 2,
 *   data: {
       layer: {
 *       url: 'http://localhost:9000/scripts/json/continent.json',
 *       rootObject: 'countries',
 *       type: 'topojson'
 *     },
 *     threshold: {
 *       
 *     }
 *   },
 *   display: {
 *     fill: {
 *       categorical: {
 *         name: 'category20b',
 *         value: 'i'
 *         }//,
 *              //value: 'd.id === 840 || d.id === 250 ? "#ff0000" : "#000000"'
 *       },
 *       threshold: {
 *         values: [ 0.02, 0.04, 0.06, 0.08, 0.10 ],
 *         colors: [ '#f2f0f7', '#dadaeb', '#bcbddc',
 *                '#9e9ac8', '#756bb1', '#54278f' ]
 *         value: 'd.rate'
 *       }
 *     }
 *   }
 *   styles: {
 *     background: {
 *       fill: '#ff0000'
 *     },
 *     lines: {
 *       stroke: '#fff',
 *       strokeWidth: '1px',
 *       strokeOpacity: '1'
 *     }
 *   }
 * }
 */

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
    let layerElement = d3.select(this.eltRef.nativeElement);

    // TODO
    let features = topojson.feature(data,
      data.objects['countries']).features;

    var backgroundFill = this.getStylesBackgroundFill(this.layer);
    var linesStroke = this.getStylesLinesStroke(this.layer);
    var linesStrokeWidth = this.getStylesLinesStrokeWidth(this.layer);
    var linesStrokeOpacity = this.getStylesLinesStrokeOpacity(this.layer);
    var fillProperty = this.initializeFill(data, features, backgroundFill);

    layerElement.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('id', function(d) { return d.id; })
        .attr('d', this.path)
        .style('fill', fillProperty)
        .style('stroke', linesStroke)
        .style('stroke-width', linesStrokeWidth)
        .style('stroke-opacity', linesStrokeOpacity)
        .on('hover', () => console.log('hover'))
        .on('blur', () => console.log('blur'));

    this.initialized = true;
  }

  /**
   *
   */
  initializeFill(data: any, features: any, backgroundFill: string): any {
    if (this.hasDisplayFillCategorical(this.layer)) {
      // Categorical
      this.initializeCategoricalFill(data, features);
    } else if (this.hasDisplayFillThreshold(this.layer)) {
      // Threshold
      this.initializeThresholdFill(data, features);
    } else if (this.hasDisplayFillChoropleth(this.layer)) {
      // Choropleth
      this.initializeChoroplethFill(data, features);
    } else {
      // Default
      return backgroundFill;
    }
  }

  initializeCategoricalFill(data: any, features: any) {
    let categoricalConfig = this.getDisplayFillCategorical(this.layer);
    let color = d3.scale.category20b();
    let colorRangeSize = 20;

    if (!categoricalConfig.distinctNeighbors) {
      // category background
      return (d, i) => {
        return color(i);
      };
    } else {
      // category background with neighbors support
      var neighbors = topojson.neighbors(data.objects.countries.geometries);
      return (d, i) => {
        d.color = d3.max(neighbors[i], function(n) {
          return features[n].color || 0;
        }) + 1;
        d.color = d.color * colorRangeSize;
        return color(d.color);
      };
    }
  }

  initializeThresholdFill(data: any, features: any) {
    let thresholdConfig = this.getDisplayFillThreshold(this.layer);
    
    var valueExpr = thresholdConfig.value;
    var values = {};
    data.forEach(data, function(d, i) {
      values[d.id] = this.expressionService.evaluate(
        valueExpr, { d, i }/*, additionalContext*/);
    });

    var color = d3.scale.threshold()
      .domain(thresholdConfig.values)
      .range(thresholdConfig.colors);

    return (d) => {
      return color(values[d.id]);
    };
  }

  initializeChoroplethFill(data: any, features: any) {
    let choroplethConfig = this.getDisplayFillChoropleth(this.layer);

    var valueExpr = choroplethConfig.value;
    var values = {};
    data.forEach(data, function(d, i) {
      values[d.id] = this.expressionService.evaluate(
        valueExpr, { d, i }/*, additionalContext*/);
    });

    var color = d3.scale.quantize()
      .domain(choroplethConfig.values)
      .range(choroplethConfig.colors);

    return (d) => {
      return color(values[d.id]);
    };
  }

  // Direct getters for property values

  hasStylesBackgroundFill(obj: any) {
    return hasProperty(obj,
      ['styles', 'background', 'fill']);
  }

  getStylesBackgroundFill(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'background', 'fill'],
      GEODATA_DEFAULTS.BACKGROUND_FILL);
  }

  hasDisplayFillCategorical(obj: any) {
    return hasProperty(obj,
      ['display', 'fill', 'categorical']);
  }

  getDisplayFillCategorical(obj: any) {
    return getPropertyValue(obj,
      ['display', 'fill', 'categorical'],
      {});
  }

  hasDisplayFillThreshold(obj: any) {
    return hasProperty(obj,
      ['display', 'fill', 'threshold']);
  }

  getDisplayFillThreshold(obj: any) {
    return getPropertyValue(obj,
      ['display', 'fill', 'threshold'],
      {});
  }

  hasDisplayFillChoropleth(obj: any) {
    return hasProperty(obj,
      ['display', 'fill', 'choropleth']);
  }

  getDisplayFillChoropleth(obj: any) {
    return getPropertyValue(obj,
      ['display', 'fill', 'choropleth'],
      {});
  }

  hasStylesLinesStroke(obj: any) {
    return hasProperty(obj,
      ['styles/lines/stroke']);
  }

  getStylesLinesStroke(obj: any) {
    return getPropertyValue(obj,
      ['styles/lines/stroke'],
      GEODATA_DEFAULTS.LINES_STROKE);
  }

  hasStylesLinesStrokeWidth(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'strokeWidth']);
  }

  getStylesLinesStrokeWidth(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'strokeWidth'],
      GEODATA_DEFAULTS.LINES_STROKE_WIDTH);
  }

  hasStylesLinesStrokeOpacity(obj: any) {
    return hasProperty(obj,
      ['styles', 'lines', 'strokeOpacity']);
  }

  getStylesLinesStrokeOpacity(obj: any) {
    return getPropertyValue(obj,
      ['styles', 'lines', 'strokeOpacity'],
      GEODATA_DEFAULTS.LINES_STROKE_OPACITY);
  }
}