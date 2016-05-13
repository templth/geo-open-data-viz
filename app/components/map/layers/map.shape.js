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
var expressions_service_1 = require('../../../services/expressions/expressions.service');
var ShapeLayerComponent = (function () {
    function ShapeLayerComponent(eltRef, expressionService) {
        this.eltRef = eltRef;
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
        this.initializeLayer();
    };
    ShapeLayerComponent.prototype.initializeLayer = function () {
        var _this = this;
        var layerElement = d3.select(this.eltRef.nativeElement);
        var r = this.expressionService.evaluate('test', { test: 19 });
        console.log('r = ' + r);
        d3.csv('data/meteorites.csv', function (features) {
            var circle = d3.geo.circle();
            var pathElements = layerElement.selectAll('path')
                .data(features)
                .enter()
                .append('path')
                .datum(function (d, i) {
                //console.log('datum - d = '+JSON.stringify(d));
                //var orig = this.expressionService.evaluate('d.reclat + d.reclong', { d, i });
                //console.log(orig);
                var orig = [d.reclat, d.reclong]; /*expressionService.evaluateExpression(origin,
                d, i, additionalContext);*/
                orig[0] = parseFloat(orig[0]);
                orig[1] = parseFloat(orig[1]);
                /*var rad = expressionService.evaluateExpression(radius,
                d, i, additionalContext);
                rad = parseFloat(rad);*/
                var c = circle
                    .origin(orig)
                    .angle(10)({ d: d, i: i });
                console.log('c = ' + c);
                c.d = d;
                return c;
            })
                .attr('id', function (d) {
                return d.d.name;
            })
                .attr('class', 'point')
                .attr('d', _this.path)
                .style('opacity', 0.75)
                .style('fill', 'rgb(254, 178, 76)');
        });
        this.initialized = true;
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
        __metadata('design:paramtypes', [core_1.ElementRef, expressions_service_1.ExpressionsService])
    ], ShapeLayerComponent);
    return ShapeLayerComponent;
}());
exports.ShapeLayerComponent = ShapeLayerComponent;
//# sourceMappingURL=map.shape.js.map