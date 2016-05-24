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
var d3_service_1 = require('./d3.service');
var MapService = (function () {
    function MapService() {
    }
    MapService.prototype.createProjection = function (map) {
        if (map.projection.type === 'orthographic') {
            return this.createOrthographicProjection(map.projection);
        }
        else if (map.projection.type === 'mercator') {
            return this.createMercatorProjection(map.projection);
        }
        else if (map.projection.type === 'satellite') {
            return this.createSatelliteProjection(map.projection);
        }
    };
    MapService.prototype.createOrthographicProjection = function (projectionConfig) {
        return d3.geo.orthographic()
            .scale(248)
            .clipAngle(90);
    };
    MapService.prototype.createMercatorProjection = function (projectionConfig) {
        return d3.geo.mercator();
    };
    MapService.prototype.createSatelliteProjection = function (projectionConfig) {
        return d3.geo.satellite()
            .distance(1.1)
            .scale(5500)
            .rotate([76.00, -34.50, 32.12])
            .center([-2, 5])
            .tilt(25)
            .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI - 1e-6)
            .precision(.1);
    };
    MapService.prototype.isSphericalProjection = function (projectionConfig) {
        return (projectionConfig.type === 'orthographic' ||
            projectionConfig.type === 'satellite');
    };
    MapService.prototype.configureMapBehaviors = function (component, element, projection, map) {
        var projectionConfig = map.projection;
        var svg = d3.select(element);
        if (this.isSphericalProjection(projectionConfig)) {
            this.configureSphericalMapBehaviors(component, svg, projection, projectionConfig);
        }
        else {
            this.configureConformalMapBehaviors(component, svg, projection, projectionConfig);
        }
    };
    MapService.prototype.configureConformalMapBehaviors = function (component, svg, projection, projectionConfig) {
        var _this = this;
        var zoom = d3.behavior.zoom()
            .scale(projection.scale())
            .on('zoom', function () {
            if (d3.event.scale != projection.scale()) {
                projection.scale(d3.event.scale);
                _this.current.scale = projection.scale();
                component.path = d3.geo.path().projection(projection);
            }
            else {
                projection.translate(d3.event.translate);
                _this.current.center = projection.center();
                component.path = d3.geo.path().projection(projection);
            }
        });
        svg.call(zoom);
    };
    MapService.prototype.configureSphericalMapBehaviors = function (component, svg, projection, projectionConfig) {
        var _this = this;
        // Zoom
        var zoom = d3.behavior.zoom()
            .scale(projection.scale())
            .on('zoom', function () {
            if (d3.event.scale != projection.scale()) {
                _this.current.previousScale = projection.scale();
                projection.scale(d3.event.scale);
                _this.current.scale = projection.scale();
                component.path = d3.geo.path().projection(projection);
            }
        });
        svg.call(zoom);
        // Move
        var m0 = null;
        var o0;
        var o1;
        var drag = d3.behavior.drag()
            .on('dragstart', function () {
            m0 = d3_service_1.trackballAngles(projection, d3.mouse(svg[0][0]));
            o0 = projection.rotate();
        })
            .on('drag', function () {
            var m1 = d3_service_1.trackballAngles(projection, d3.mouse(svg[0][0]));
            o1 = d3_service_1.composedRotation(o0[0], o0[1], o0[2], m1[0] - m0[0], m1[1] - m0[1]);
            projection.rotate(o1);
            _this.current.center = projection.rotate();
            component.path = d3.geo.path().projection(projection);
        });
        svg.call(drag);
    };
    MapService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MapService);
    return MapService;
}());
exports.MapService = MapService;
//# sourceMappingURL=map.service.js.map