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
var map_1 = require('./map/map');
var AppComponent = (function () {
    function AppComponent() {
    }
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            template: "\n\n        <!--button md-button>title1</button-->\n\n    <!--md-content class=\"md-padding\" layout=\"row\" layout-wrap layout-align=\"center start\">\n      <div flex=\"50\" layout=\"column\" flex-xs=\"100\">\n        <md-card>\n          <img src=\"public/images/grass.jpg\" class=\"md-card-image\" alt=\"Grass\">\n          <md-card-title>\n            <md-card-title-text>\n              <span class=\"md-headline\">Action buttons</span>\n            </md-card-title-text>\n          </md-card-title>\n          <md-card-content-->\n            <map></map>\n          <!--/md-card-content>\n        </md-card>\n      </div>\n    </md-content-->\n\n  ",
            directives: [map_1.MapComponent /*, MATERIAL_DIRECTIVES*/]
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map