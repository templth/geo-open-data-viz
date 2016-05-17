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
var layers_defaults_1 = require('./layers.defaults');
var properties_utils_1 = require('../../../utils/properties.utils');
var map_update_service_1 = require('../../../services/map/map.update.service');
var expressions_service_1 = require('../../../services/expressions/expressions.service');
var ShapeLayerComponent = (function () {
    function ShapeLayerComponent(eltRef, updateService, expressionService) {
        this.eltRef = eltRef;
        this.updateService = updateService;
        this.expressionService = expressionService;
        this.initialized = false;
    }
    ShapeLayerComponent.prototype.ngOnChanges = function (changes) {
        if (this.initialized && changes.path) {
            var layerElement = d3.select(this.eltRef.nativeElement);
            layerElement.selectAll('path').attr('d', this.path);
        }
    };
    ShapeLayerComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.updateService.registerOnLayerDataLoaded(this.layer).subscribe(function (data) {
            _this.initializeLayer(data.data);
        });
    };
    ShapeLayerComponent.prototype.initializeLayer = function (data) {
        if (this.isCircleShape(this.layer)) {
            this.initializeCircleShapeLayer(this.layer, data);
        }
        this.initialized = true;
    };
    ShapeLayerComponent.prototype.initializeCircleShapeLayer = function (layer, data) {
        var _this = this;
        var layerElement = d3.select(this.eltRef.nativeElement);
        var features = data.filter(function (d) { return d.mass > 50000; });
        console.log('features = ' + features.length);
        var circle = d3.geo.circle();
        var originExpression = this.getShapeOrigin(this.layer);
        var radiusExpression = this.getShapeRadius(this.layer);
        var opacity = this.getShapeOpacity(this.layer);
        var pathElements = layerElement.selectAll('path')
            .data(features)
            .enter()
            .append('path')
            .datum(function (d, i) {
            var orig = _this.expressionService.evaluate(originExpression, { d: d, i: i /*, additionalContext*/ });
            orig[0] = parseFloat(orig[0]);
            orig[1] = parseFloat(orig[1]);
            var rad = _this.expressionService.evaluate(radiusExpression, { d: d, i: i /*, additionalContext*/ });
            console.log('rad = ' + rad);
            rad = parseFloat(rad);
            var c = circle
                .origin(orig)
                .angle(rad)({ d: d, i: i });
            c.d = d;
            return c;
        })
            .attr('id', function (d) {
            return d.d.name;
        })
            .attr('class', 'point')
            .attr('d', this.path)
            .style('opacity', opacity)
            .style('fill', 'rgb(254, 178, 76)');
    };
    // Direct getters for property values
    ShapeLayerComponent.prototype.getShapeConfiguration = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['display', 'shape'], {});
    };
    ShapeLayerComponent.prototype.isCircleShape = function (obj) {
        return (properties_utils_1.getPropertyValue(obj, ['display', 'shape', 'type'], '') === 'circle');
    };
    ShapeLayerComponent.prototype.getShapeOrigin = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['display', 'shape', 'origin'], '');
    };
    ShapeLayerComponent.prototype.getShapeRadius = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['display', 'shape', 'radius'], '');
    };
    ShapeLayerComponent.prototype.getShapeOpacity = function (obj) {
        return properties_utils_1.getPropertyValue(obj, ['display', 'shape', 'opacity'], layers_defaults_1.SHAPE_DEFAULTS.SHAPE_OPACITY);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ShapeLayerComponent.prototype, "layer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ShapeLayerComponent.prototype, "path", void 0);
    ShapeLayerComponent = __decorate([
        core_1.Component({
            selector: '[shape]',
            template: "\n  "
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, map_update_service_1.MapUpdateService, expressions_service_1.ExpressionsService])
    ], ShapeLayerComponent);
    return ShapeLayerComponent;
}());
exports.ShapeLayerComponent = ShapeLayerComponent;
//# sourceMappingURL=map.shape.js.map