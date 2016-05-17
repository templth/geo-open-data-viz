"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Layer = (function () {
    function Layer() {
    }
    return Layer;
}());
exports.Layer = Layer;
// Graticule layer
var GraticuleLayerDisplay = (function () {
    function GraticuleLayerDisplay() {
    }
    return GraticuleLayerDisplay;
}());
exports.GraticuleLayerDisplay = GraticuleLayerDisplay;
var GraticuleLayerStyles = (function () {
    function GraticuleLayerStyles() {
    }
    return GraticuleLayerStyles;
}());
exports.GraticuleLayerStyles = GraticuleLayerStyles;
var GraticuleLayer = (function (_super) {
    __extends(GraticuleLayer, _super);
    function GraticuleLayer() {
        _super.apply(this, arguments);
    }
    return GraticuleLayer;
}(Layer));
exports.GraticuleLayer = GraticuleLayer;
// Geo data layer
var GeodataLayerStyles = (function () {
    function GeodataLayerStyles() {
    }
    return GeodataLayerStyles;
}());
exports.GeodataLayerStyles = GeodataLayerStyles;
var GeodataLayerDisplay = (function () {
    function GeodataLayerDisplay() {
    }
    return GeodataLayerDisplay;
}());
exports.GeodataLayerDisplay = GeodataLayerDisplay;
var GeodataLayer = (function (_super) {
    __extends(GeodataLayer, _super);
    function GeodataLayer() {
        _super.apply(this, arguments);
    }
    return GeodataLayer;
}(Layer));
exports.GeodataLayer = GeodataLayer;
// Shape layer
// Map
var Map = (function () {
    function Map() {
    }
    return Map;
}());
exports.Map = Map;
//# sourceMappingURL=map.model.js.map