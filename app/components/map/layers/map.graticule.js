"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var map_layer_1 = require('./map.layer');
var map_model_1 = require('../../../model/map.model');
var layers_defaults_1 = require('./layers.defaults');
var properties_utils_1 = require('../../../utils/properties.utils');
var map_update_service_1 = require('../../../services/map/map.update.service');
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
var GraticuleLayerComponent = (function (_super) {
    __extends(GraticuleLayerComponent, _super);
    function GraticuleLayerComponent(eltRef, updateService) {
        _super.call(this);
        this.eltRef = eltRef;
        this.updateService = updateService;
    }
    /**
     * Detect path updates
     */
    GraticuleLayerComponent.prototype.ngOnChanges = function (changes) {
        if (this.initialized && changes.path) {
            var layerElement = d3.select(this.eltRef.nativeElement);
            layerElement.selectAll('path').attr('d', this.path);
        }
    };
    /**
     * Detect layer configuration updates
     */
    GraticuleLayerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.updateService.registerOnLayerConfigurationUpdated(this.layer).subscribe(function (updates) {
            _this.handleUpdates(updates);
        });
    };
    /**
     * Update layer configuration updates
     */
    GraticuleLayerComponent.prototype.handleUpdates = function (updates) {
        this.layer = updates.layer;
        // Borders
        if (this.hasStylesBorderStroke(updates.diffs)) {
            d3.select('#borders').style('stroke', this.getStylesBorderStroke(updates.diffs));
        }
        if (this.hasStylesBorderStrokeWidth(updates.diffs)) {
            d3.select('#borders').style('stroke-width', this.getStylesBorderStrokeWidth(updates.diffs));
        }
        // Fill
        if (this.hasStylesBackgroundFill(updates.diffs)) {
            d3.select('#fill').style('fill', this.getStylesBackgroundFill(updates.diffs));
        }
        // Lines
        if (this.hasStylesLinesStroke(updates.diffs)) {
            d3.select('#lines').style('stroke', this.getStylesLinesStroke(updates.diffs));
        }
        if (this.hasStylesLinesStrokeWidth(updates.diffs)) {
            d3.select('#lines').style('stroke-width', this.getStylesLinesStrokeWidth(updates.diffs));
        }
        if (this.hasStylesLinesStrokeOpacity(updates.diffs)) {
            d3.select('#lines').style('stroke-opacity', this.getStylesLinesStrokeOpacity(updates.diffs));
        }
    };
    /**
      * Trigger the graticule layer initialization
      */
    GraticuleLayerComponent.prototype.ngAfterViewInit = function () {
        this.initializeLayer();
    };
    /**
      * Initialize the graticule layer
      */
    GraticuleLayerComponent.prototype.initializeLayer = function () {
        var layerElement = d3.select(this.eltRef.nativeElement);
        var graticule = d3.geo.graticule();
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
    };
    // Direct getters for property values
    GraticuleLayerComponent.prototype.hasStylesBorderStroke = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles', 'border', 'stroke']);
    };
    GraticuleLayerComponent.prototype.getStylesBorderStroke = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles', 'border', 'stroke'], layers_defaults_1.GRATICULE_DEFAULTS.BORDER_STROKE);
    };
    GraticuleLayerComponent.prototype.hasStylesBorderStrokeWidth = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles', 'border', 'strokeWidth']);
    };
    GraticuleLayerComponent.prototype.getStylesBorderStrokeWidth = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles', 'border', 'strokeWidth'], layers_defaults_1.GRATICULE_DEFAULTS.BORDER_STROKE_WIDTH);
    };
    GraticuleLayerComponent.prototype.hasStylesBackgroundFill = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles', 'background', 'fill']);
    };
    GraticuleLayerComponent.prototype.getStylesBackgroundFill = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles', 'background', 'fill'], layers_defaults_1.GRATICULE_DEFAULTS.BACKGROUND_FILL);
    };
    GraticuleLayerComponent.prototype.hasStylesLinesStroke = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles', 'lines', 'stroke']);
    };
    GraticuleLayerComponent.prototype.getStylesLinesStroke = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles', 'lines', 'stroke'], layers_defaults_1.GRATICULE_DEFAULTS.LINES_STROKE);
    };
    GraticuleLayerComponent.prototype.hasStylesLinesStrokeWidth = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles', 'lines', 'strokeWidth']);
    };
    GraticuleLayerComponent.prototype.getStylesLinesStrokeWidth = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles', 'lines', 'strokeWidth'], layers_defaults_1.GRATICULE_DEFAULTS.LINES_STROKE_WIDTH);
    };
    GraticuleLayerComponent.prototype.hasStylesLinesStrokeOpacity = function (obj) {
        return properties_utils_1.hasProperty(obj, ['styles', 'lines', 'strokeOpacity']);
    };
    GraticuleLayerComponent.prototype.getStylesLinesStrokeOpacity = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['styles', 'lines', 'strokeOpacity'], layers_defaults_1.GRATICULE_DEFAULTS.LINES_STROKE_OPACITY);
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
        __metadata('design:paramtypes', [core_1.ElementRef, map_update_service_1.MapUpdateService])
    ], GraticuleLayerComponent);
    return GraticuleLayerComponent;
}(map_layer_1.AbstractLayer));
exports.GraticuleLayerComponent = GraticuleLayerComponent;
//# sourceMappingURL=map.graticule.js.map