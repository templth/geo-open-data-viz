"use strict";
var testing_1 = require('@angular/compiler/testing');
var testing_2 = require('@angular/core/testing');
var async_test_completer_1 = require('@angular/core/testing/async_test_completer');
var browser_1 = require('@angular/platform-browser-dynamic/testing/browser');
var map_graticule_1 = require('./map.graticule');
var layers_defaults_1 = require('./layers.defaults');
var utils_1 = require('../../../services/utils');
testing_2.describe('Test for graticule layer', function () {
    testing_2.setBaseTestProviders(browser_1.TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS, [browser_1.TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS]);
    /*setBaseTestProviders(TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
      [TEST_BROWSER_STATIC_APPLICATION_PROVIDERS, AsyncTestCompleter]);*/
    function checkGraticuleStructure(nativeElement, borderStroke, borderStrokeWidth, backgroundFill, linesStroke, linesStrokeWidth, linesStrokeOpacity) {
        // Testing defs element
        var defsElement = nativeElement.querySelector('defs');
        testing_2.expect(defsElement).not.null;
        testing_2.expect(defsElement.childNodes).not.null;
        testing_2.expect(defsElement.childNodes.length).toEqual(1);
        var pathElement = defsElement.childNodes[0];
        testing_2.expect(pathElement.nodeName.toLowerCase()).toEqual('path');
        testing_2.expect(pathElement.id).toEqual('sphere');
        testing_2.expect(pathElement.path).not.null;
        testing_2.expect(pathElement.path).not.toEqual('');
        // Testing use elements
        var useElements = nativeElement.querySelectorAll('use');
        testing_2.expect(useElements).not.null;
        testing_2.expect(useElements.length).toEqual(2);
        var firstUseElement = useElements[0];
        var firstUseElementStyles = firstUseElement.style;
        testing_2.expect(utils_1.rgb2hex(firstUseElementStyles.stroke)).toEqual(borderStroke);
        testing_2.expect(firstUseElementStyles['stroke-width']).toEqual(borderStrokeWidth);
        testing_2.expect(firstUseElementStyles.fill).toEqual('none');
        testing_2.expect(firstUseElement.getAttribute('href')).toEqual('#sphere');
        var secondUseElement = useElements[1];
        var secondUseElementStyles = secondUseElement.style;
        testing_2.expect(utils_1.rgb2hex(secondUseElementStyles.fill)).toEqual(backgroundFill);
        testing_2.expect(secondUseElement.getAttribute('href')).toEqual('#sphere');
        // Testing path elements
        var pathElement = [].find.call(nativeElement.childNodes, function (child) { return child.nodeName.toLowerCase() === 'path'; });
        testing_2.expect(pathElement.id).toEqual('layer.id');
        testing_2.expect(pathElement.d).not.null;
        testing_2.expect(pathElement.d).not.toEqual('');
        var pathElementStyles = pathElement.style;
        testing_2.expect(pathElementStyles.fill).toEqual('none');
        testing_2.expect(utils_1.rgb2hex(pathElementStyles.stroke)).toEqual(linesStroke);
        testing_2.expect(pathElementStyles['stroke-width']).toEqual(linesStrokeWidth);
        testing_2.expect(pathElementStyles['stroke-opacity']).toEqual(linesStrokeOpacity);
    }
    testing_2.it('should define default values for properties', testing_2.inject([testing_1.TestComponentBuilder, async_test_completer_1.AsyncTestCompleter], function (tcb) {
        tcb.createAsync(map_graticule_1.GraticuleLayerComponent).then(function (componentFixture) {
            var componentInstance = componentFixture.componentInstance;
            componentInstance.layer = { type: 'graticule' };
            componentInstance.path = d3.geo.path();
            componentFixture.detectChanges();
            var nativeElement = componentFixture.nativeElement;
            checkGraticuleStructure(nativeElement, layers_defaults_1.GRATICULE_DEFAULTS.BORDER_STROKE, layers_defaults_1.GRATICULE_DEFAULTS.BORDER_STROKE_WIDTH, layers_defaults_1.GRATICULE_DEFAULTS.BACKGROUND_FILL, layers_defaults_1.GRATICULE_DEFAULTS.LINES_STROKE, layers_defaults_1.GRATICULE_DEFAULTS.LINES_STROKE_WIDTH, layers_defaults_1.GRATICULE_DEFAULTS.LINES_STROKE_OPACITY);
        });
    }));
    testing_2.it('should use custom values for properties', testing_2.inject([testing_1.TestComponentBuilder, async_test_completer_1.AsyncTestCompleter], function (tcb) {
        tcb.createAsync(map_graticule_1.GraticuleLayerComponent).then(function (componentFixture) {
            var componentInstance = componentFixture.componentInstance;
            console.log(componentInstance);
            componentInstance.layer = {
                type: 'graticule',
                styles: {
                    border: {
                        stroke: '#000000',
                        strokeWidth: '3px'
                    },
                    background: {
                        fill: '#a4bac7'
                    },
                    lines: {
                        stroke: '#777777',
                        strokeWidth: '0.5px',
                        strokeOpacity: '0.5'
                    }
                }
            };
            componentInstance.path = d3.geo.path();
            componentFixture.detectChanges();
            var nativeElement = componentFixture.nativeElement;
            checkGraticuleStructure(nativeElement, '#000000', '3px', '#a4bac7', '#777777', '0.5px', '0.5');
        });
    }));
});
//# sourceMappingURL=map.graticule.spec.js.map