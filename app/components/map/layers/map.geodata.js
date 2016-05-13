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
var GeodataLayerComponent = (function () {
    function GeodataLayerComponent(eltRef) {
        this.eltRef = eltRef;
        this.initialized = false;
    }
    GeodataLayerComponent.prototype.ngOnChanges = function (changes) {
        if (this.initialized && changes.path) {
            var layerElement = d3.select(this.eltRef.nativeElement);
            layerElement.selectAll('path').attr('d', this.path);
        }
    };
    GeodataLayerComponent.prototype.ngAfterViewInit = function () {
        this.initializeLayer();
    };
    GeodataLayerComponent.prototype.initializeLayer = function () {
        var _this = this;
        var layerElement = d3.select(this.eltRef.nativeElement);
        d3.json('data/continent.json', function (data) {
            var features = topojson.feature(data, data.objects['countries']).features;
            var backgroundFill = properties_utils_1.getPropertyValue(_this.layer, 'styles', 'background', 'fill');
            backgroundFill = backgroundFill || layers_defaults_1.GEODATA_DEFAULTS.BACKGROUND_FILL;
            var linesStroke = properties_utils_1.getPropertyValue(_this.layer, 'styles', 'lines', 'stroke');
            linesStroke = linesStroke || layers_defaults_1.GEODATA_DEFAULTS.LINES_STROKE;
            var linesStrokeWidth = properties_utils_1.getPropertyValue(_this.layer, 'styles', 'lines', 'strokeWidth');
            linesStrokeWidth = linesStrokeWidth || layers_defaults_1.GEODATA_DEFAULTS.LINES_STROKE_WIDTH;
            var linesStrokeOpacity = properties_utils_1.getPropertyValue(_this.layer, 'styles', 'lines', 'strokeOpacity');
            linesStrokeOpacity = linesStrokeOpacity || layers_defaults_1.GEODATA_DEFAULTS.LINES_STROKE_OPACITY;
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
                .attr('id', function (d) { return d.id; })
                .attr('d', _this.path)
                .style('fill', function (d, i) {
                // See https://gist.github.com/jasondavies/4188334
                //return color(i * colorRangeSize);
                //console.log(neighbors[i]);
                d.color = d3.max(neighbors[i], function (n) {
                    //console.log('n = ' + n);
                    return features[n].color || 0;
                }) + 1;
                d.color = d.color * colorRangeSize;
                //console.log('--> ' + d.color);
                return color(d.color);
            })
                .style('stroke', linesStroke)
                .style('stroke-width', linesStrokeWidth)
                .style('stroke-opacity', linesStrokeOpacity)
                .on('hover', function () { return console.log('hover'); })
                .on('blur', function () { return console.log('blur'); });
        });
        this.initialized = true;
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
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], GeodataLayerComponent);
    return GeodataLayerComponent;
}());
exports.GeodataLayerComponent = GeodataLayerComponent;
//# sourceMappingURL=map.geodata.js.map