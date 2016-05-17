"use strict";
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var http_1 = require('@angular/http');
var app_component_1 = require('./components/app.component');
var map_service_1 = require('./services/map/map.service');
var map_update_service_1 = require('./services/map/map.update.service');
var expressions_service_1 = require('./services/expressions/expressions.service');
platform_browser_dynamic_1.bootstrap(app_component_1.AppComponent, [http_1.HTTP_PROVIDERS, map_service_1.MapService, map_update_service_1.MapUpdateService, expressions_service_1.ExpressionsService]);
//# sourceMappingURL=main.js.map