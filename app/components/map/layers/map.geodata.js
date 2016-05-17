"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var map_model_1 = require('../../../model/map.model');
var layers_defaults_1 = require('./layers.defaults');
var properties_utils_1 = require('../../../utils/properties.utils');
var map_update_service_1 = require('../../../services/map/map.update.service');
var expressions_service_1 = require('../../../services/expressions/expressions.service');
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
var GeodataLayerComponent = (function () {
    function GeodataLayerComponent(eltRef, updateService, expressionService) {
        this.eltRef = eltRef;
        this.updateService = updateService;
        this.expressionService = expressionService;
        this.initialized = false;
    }
    GeodataLayerComponent.prototype.ngOnChanges = function (changes) {
        if (this.initialized && changes.path) {
            var layerElement = d3.select(this.eltRef.nativeElement);
            layerElement.selectAll('path').attr('d', this.path);
        }
    };
    GeodataLayerComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.updateService.registerOnLayerDataLoaded(this.layer).subscribe(function (data) {
            _this.initializeLayer(data.data);
        });
    };
    GeodataLayerComponent.prototype.initializeLayer = function (data) {
        var layerElement = d3.select(this.eltRef.nativeElement);
        // TODO
        var features = topojson.feature(data, data.objects['countries']).features;
        var backgroundFill = this.getStylesBackgroundFill(this.layer);
        var linesStroke = this.getStylesLinesStroke(this.layer);
        var linesStrokeWidth = this.getStylesLinesStrokeWidth(this.layer);
        var linesStrokeOpacity = this.getStylesLinesStrokeOpacity(this.layer);
        var fillProperty = this.initializeFill(data, features, backgroundFill);
        layerElement.selectAll('path')
            .data(features)
            .enter()
            .append('path')
            .attr('id', function (d) { return d.id; })
            .attr('d', this.path)
            .style('fill', fillProperty)
            .style('stroke', linesStroke)
            .style('stroke-width', linesStrokeWidth)
            .style('stroke-opacity', linesStrokeOpacity)
            .on('hover', function () { return console.log('hover'); })
            .on('blur', function () { return console.log('blur'); });
        this.initialized = true;
    };
    /**
     *
     */
    GeodataLayerComponent.prototype.initializeFill = function (data, features, backgroundFill) {
        if (this.hasDisplayFillCategorical(this.layer)) {
            // Categorical
            this.initializeCategoricalFill(data, features);
        }
        else if (this.hasDisplayFillThreshold(this.layer)) {
            // Threshold
            this.initializeThresholdFill(data, features);
        }
        else if (this.hasDisplayFillChoropleth(this.layer)) {
            // Choropleth
            this.initializeChoroplethFill(data, features);
        }
        else {
            // Default
            return backgroundFill;
        }
    };
    GeodataLayerComponent.prototype.initializeCategoricalFill = function (data, features) {
        var categoricalConfig = this.getDisplayFillCategorical(this.layer);
        var color = d3.scale.category20b();
        var colorRangeSize = 20;
        if (!categoricalConfig.distinctNeighbors) {
            // category background
            return function (d, i) {
                return color(i);
            };
        }
        else {
            // category background with neighbors support
            var neighbors = topojson.neighbors(data.objects.countries.geometries);
            return function (d, i) {
                d.color = d3.max(neighbors[i], function (n) {
                    return features[n].color || 0;
                }) + 1;
                d.color = d.color * colorRangeSize;
                return color(d.color);
            };
        }
    };
    GeodataLayerComponent.prototype.initializeThresholdFill = function (data, features) {
        var thresholdConfig = this.getDisplayFillThreshold(this.layer);
        var valueExpr = thresholdConfig.value;
        var values = {};
        data.forEach(data, function (d, i) {
            values[d.id] = this.expressionService.evaluate(valueExpr, { d: d, i: i } /*, additionalContext*/);
        });
        var color = d3.scale.threshold()
            .domain(thresholdConfig.values)
            .range(thresholdConfig.colors);
        return function (d) {
            return color(values[d.id]);
        };
    };
    GeodataLayerComponent.prototype.initializeChoroplethFill = function (data, features) {
        var choroplethConfig = this.getDisplayFillChoropleth(this.layer);
        var valueExpr = choroplethConfig.value;
        var values = {};
        data.forEach(data, function (d, i) {
            values[d.id] = this.expressionService.evaluate(valueExpr, { d: d, i: i } /*, additionalContext*/);
        });
        var color = d3.scale.quantize()
            .domain(choroplethConfig.values)
            .range(choroplethConfig.colors);
        return function (d) {
            return color(values[d.id]);
        };
    };
    // Direct getters for property values
    GeodataLayerComponent.prototype.hasStylesBackgroundFill = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles', 'background', 'fill']);
    };
    GeodataLayerComponent.prototype.getStylesBackgroundFill = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles', 'background', 'fill'], layers_defaults_1.GEODATA_DEFAULTS.BACKGROUND_FILL);
    };
    GeodataLayerComponent.prototype.hasDisplayFillCategorical = function (obj) {
        return properties_utils_1.hasProperty(obj, ['display', 'fill', 'categorical']);
    };
    GeodataLayerComponent.prototype.getDisplayFillCategorical = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['display', 'fill', 'categorical'], {});
    };
    GeodataLayerComponent.prototype.hasDisplayFillThreshold = function (obj) {
        return properties_utils_1.hasProperty(obj, ['display', 'fill', 'threshold']);
    };
    GeodataLayerComponent.prototype.getDisplayFillThreshold = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['display', 'fill', 'threshold'], {});
    };
    GeodataLayerComponent.prototype.hasDisplayFillChoropleth = function (obj) {
        return properties_utils_1.hasProperty(obj, ['display', 'fill', 'choropleth']);
    };
    GeodataLayerComponent.prototype.getDisplayFillChoropleth = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['display', 'fill', 'choropleth'], {});
    };
    GeodataLayerComponent.prototype.hasStylesLinesStroke = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles/lines/stroke']);
    };
    GeodataLayerComponent.prototype.getStylesLinesStroke = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles/lines/stroke'], layers_defaults_1.GEODATA_DEFAULTS.LINES_STROKE);
    };
    GeodataLayerComponent.prototype.hasStylesLinesStrokeWidth = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles', 'lines', 'strokeWidth']);
    };
    GeodataLayerComponent.prototype.getStylesLinesStrokeWidth = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles', 'lines', 'strokeWidth'], layers_defaults_1.GEODATA_DEFAULTS.LINES_STROKE_WIDTH);
    };
    GeodataLayerComponent.prototype.hasStylesLinesStrokeOpacity = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles', 'lines', 'strokeOpacity']);
    };
    GeodataLayerComponent.prototype.getStylesLinesStrokeOpacity = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles', 'lines', 'strokeOpacity'], layers_defaults_1.GEODATA_DEFAULTS.LINES_STROKE_OPACITY);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', map_model_1.GeodataLayer)
    ], GeodataLayerComponent.prototype, "layer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], GeodataLayerComponent.prototype, "path", void 0);
    GeodataLayerComponent = __decorate([
        core_1.Component({
            selector: '[geodata]',
            template: "\n  "
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, map_update_service_1.MapUpdateService, expressions_service_1.ExpressionsService])
    ], GeodataLayerComponent);
    return GeodataLayerComponent;
}());
exports.GeodataLayerComponent = GeodataLayerComponent;
//# sourceMappingURL=map.geodata.js.map