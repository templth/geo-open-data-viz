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
var GraticuleLayerComponent = (function () {
    function GraticuleLayerComponent(eltRef) {
        this.eltRef = eltRef;
        this.initialized = false;
    }
    GraticuleLayerComponent.prototype.ngOnChanges = function (changes) {
        if (this.initialized && changes.path) {
            var layerElement = d3.select(this.eltRef.nativeElement);
            layerElement.selectAll('path').attr('d', this.path);
        }
    };
    GraticuleLayerComponent.prototype.ngAfterViewInit = function () {
        this.initializeLayer();
    };
    GraticuleLayerComponent.prototype.initializeLayer = function () {
        var layerElement = d3.select(this.eltRef.nativeElement);
        var graticule = d3.geo.graticule();
        layerElement.append('defs').append('path')
            .datum({ type: 'Sphere' })
            .attr('id', 'sphere')
            .attr('d', this.path);
        var borderStroke = properties_utils_1.getPropertyValue(this.layer, 'styles', 'border', 'stroke');
        borderStroke = borderStroke || layers_defaults_1.GRATICULE_DEFAULTS.BORDER_STROKE;
        var borderStrokeWidth = properties_utils_1.getPropertyValue(this.layer, 'styles', 'border', 'strokeWidth');
        borderStrokeWidth = borderStrokeWidth || layers_defaults_1.GRATICULE_DEFAULTS.BORDER_STROKE_WIDTH;
        layerElement.append('use')
            .style('stroke', borderStroke)
            .style('stroke-width', borderStrokeWidth)
            .style('fill', 'none')
            .attr('xlink:href', '#sphere');
        var backgroundFill = properties_utils_1.getPropertyValue(this.layer, 'styles', 'background', 'fill');
        backgroundFill = backgroundFill || layers_defaults_1.GRATICULE_DEFAULTS.BACKGROUND_FILL;
        layerElement.append('use')
            .style('fill', backgroundFill)
            .attr('xlink:href', '#sphere');
        var linesStroke = properties_utils_1.getPropertyValue(this.layer, 'styles', 'lines', 'stroke');
        linesStroke = linesStroke || layers_defaults_1.GRATICULE_DEFAULTS.LINES_STROKE;
        var linesStrokeWidth = properties_utils_1.getPropertyValue(this.layer, 'styles', 'lines', 'strokeWidth');
        linesStrokeWidth = linesStrokeWidth || layers_defaults_1.GRATICULE_DEFAULTS.LINES_STROKE_WIDTH;
        var linesStrokeOpacity = properties_utils_1.getPropertyValue(this.layer, 'styles', 'lines', 'strokeOpacity');
        linesStrokeOpacity = linesStrokeOpacity || layers_defaults_1.GRATICULE_DEFAULTS.LINES_STROKE_OPACITY;
        layerElement.append('path')
            .attr('id', 'layer.id')
            .datum(graticule)
            .style('fill', 'none')
            .style('stroke', linesStroke)
            .style('stroke-width', linesStrokeWidth)
            .style('stroke-opacity', linesStrokeOpacity)
            .attr('d', this.path);
        this.initialized = true;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', map_model_1.GraticuleLayer)
    ], GraticuleLayerComponent.prototype, "layer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], GraticuleLayerComponent.prototype, "path", void 0);
    GraticuleLayerComponent = __decorate([
        core_1.Component({
            selector: '[graticule]',
            template: "\n\t"
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], GraticuleLayerComponent);
    return GraticuleLayerComponent;
}());
exports.GraticuleLayerComponent = GraticuleLayerComponent;
//# sourceMappingURL=map.graticule.js.map