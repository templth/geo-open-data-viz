"use strict";
var Rx_1 = require('rxjs/Rx');
var MapUpdateService = (function () {
    function MapUpdateService() {
        this.layerDataConfigurationUpdated$ = new Rx_1.Subject();
        this.layerDataLoaded$ = new Rx_1.Subject();
    }
    MapUpdateService.prototype.registerOnLayerConfigurationUpdated = function (layer) {
        return this.layerDataConfigurationUpdated$
            .filter(function (update) { return update.layerId === layer.id; });
    };
    MapUpdateService.prototype.triggerLayerConfigurationUpdates = function (layer, diffs) {
        this.layerDataConfigurationUpdated$
            .next({ layerId: layer.id, layer: layer, diffs: diffs });
    };
    MapUpdateService.prototype.registerOnLayerDataLoaded = function (layer) {
        return this.layerDataLoaded$
            .filter(function (update) { return update.layerId === layer.id; });
    };
    MapUpdateService.prototype.triggerLayerDataLoaded = function (layer, data) {
        this.layerDataLoaded$
            .next({ layerId: layer.id, data: data });
    };
    return MapUpdateService;
}());
exports.MapUpdateService = MapUpdateService;
//# sourceMappingURL=map.update.service.js.map