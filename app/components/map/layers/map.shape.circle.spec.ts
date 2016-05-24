import {provide} from '@angular/core';
import {
  TestComponentBuilder
} from '@angular/compiler/testing';

import {
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  expect,
  iit,
  inject,
  injectAsync,
  async,
  beforeEachProviders,
  setBaseTestProviders,
  it,
  xit
} from '@angular/core/testing';

import {
  TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
  TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS
} from '@angular/platform-browser-dynamic/testing/browser';

import {ShapeCircleLayerComponent} from './map.shape.circle';
import {SHAPE_CIRCLE_DEFAULTS} from './layers.defaults';
import {ShapeCircleLayer} from '../../../model/map.model';
import {rgb2hex} from '../../../services/utils';
import {MapService} from '../../../services/map/map.service';
import {MapUpdateService} from '../../../services/map/map.update.service';
import {ExpressionsService} from '../../../services/expressions/expressions.service';

declare var d3: any;

describe('Test for shape circle layer', () => {
  setBaseTestProviders(TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
    TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS);

  var defaultShapeLayerConfig = <ShapeCircleLayer>{
    id: 'shapeLayer',
    type: 'shape',
    display: {
      shape: {
        type: 'circle',
        //radius: 'd.mass / 5000000',
        radius: '10',
        originExpr: '[ d.reclong, d.reclat ]'
      }
    }
  };

  var shapeLayerConfig = <ShapeCircleLayer>{
	id: 'shapeLayer',
	type: 'shape',
	display: {
      shape: {
        type: 'circle',
        //radius: 'd.mass / 5000000',
        radius: '10',
        originExpr: '[ d.reclong, d.reclat ]'
      }
    },
    styles: {
      background: {
        fill: '#ff0000',
        opacity: '0.5'
      },
      lines: {
        stroke: '#777771',
        strokeWidth: '5px',
        strokeOpacity: '0.1'
      }
    }
  };

  var data = [
    { name: 'Hoba', id: '11890', nametype: 'Valid', recclass: 'Iron, IVB', mass: '60000000', fall: 'Found', year: '01 / 01 / 1920 12:00:00 AM', reclat: '-19.583330', reclong: '17.916670', geoLocation: '(-19.583330, 17.916670)' }
    // Campo del Cielo
    // Bendegó
  ];

  var projection = d3.geo.orthographic()
    .scale(248)
    .clipAngle(90);

  beforeEachProviders(() => {
    return [MapService, ExpressionsService];
  });

  function checkShapeStructure(nativeElement, backgroundFill: string,
  	  backgroundOpacity: string, linesStroke: string,
      linesStrokeWidth: string, linesStrokeOpacity: string) {
    // Testing path elements
    //var pathElements = [].find.call(nativeElement.childNodes, child => child.nodeName.toLowerCase() === 'path');
    var pathElements = nativeElement.querySelectorAll('path');
    expect(pathElements).not.null;
    expect(pathElements.length).toEqual(1);

    // Testing path element
    var pathElement = pathElements[0];
    expect(pathElement.id).toEqual('Hoba');
    expect(pathElement.d).not.null;
    expect(pathElement.d).not.toEqual('');
    var pathElementStyles = pathElement.style;
    expect(pathElementStyles.opacity).toEqual(backgroundOpacity);
    expect(rgb2hex(pathElementStyles.fill)).toEqual(backgroundFill);
    expect(rgb2hex(pathElementStyles.stroke)).toEqual(linesStroke);
    expect(pathElementStyles['stroke-width']).toEqual(linesStrokeWidth);
    expect(pathElementStyles['stroke-opacity']).toEqual(linesStrokeOpacity);
  }

  it('should define default values for properties',
    async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      var updateService = new MapUpdateService();

      tcb.overrideProviders(ShapeCircleLayerComponent, [
        provide(MapUpdateService, { useValue: updateService })
      ])
      .createAsync(ShapeCircleLayerComponent).then((componentFixture) => {
        let componentInstance = componentFixture.componentInstance;

        componentInstance.layer = defaultShapeLayerConfig;
        componentInstance.path = d3.geo.path().projection(projection);

        componentFixture.detectChanges();

        updateService.triggerLayerDataLoaded(defaultShapeLayerConfig, data);

        let nativeElement = componentFixture.nativeElement;
        checkShapeStructure(nativeElement, SHAPE_CIRCLE_DEFAULTS.BACKGROUND_FILL,
			SHAPE_CIRCLE_DEFAULTS.BACKGROUND_OPACITY,
			SHAPE_CIRCLE_DEFAULTS.LINES_STROKE, SHAPE_CIRCLE_DEFAULTS.LINES_STROKE_WIDTH,
			SHAPE_CIRCLE_DEFAULTS.LINES_STROKE_OPACITY);
	});
  })));

  it('should use custom values for properties',
    async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      var updateService = new MapUpdateService();

      tcb.overrideProviders(ShapeCircleLayerComponent, [
        provide(MapUpdateService, { useValue: updateService })
      ])
      .createAsync(ShapeCircleLayerComponent).then((componentFixture) => {
        let componentInstance = componentFixture.componentInstance;
        componentInstance.layer = shapeLayerConfig;
        componentInstance.path = d3.geo.path().projection(projection);

        componentFixture.detectChanges();

        updateService.triggerLayerDataLoaded(shapeLayerConfig, data);

        let nativeElement = componentFixture.nativeElement;
        checkShapeStructure(nativeElement, '#ff0000',
          '0.5', '#777771', '5px', '0.1');
      });
  })));

  it('should update style values for properties',
    async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      var updateService = new MapUpdateService();

      tcb.overrideProviders(ShapeCircleLayerComponent, [
        provide(MapUpdateService, { useValue: updateService })
      ])
      .createAsync(ShapeCircleLayerComponent).then((componentFixture) => {
        let componentInstance = componentFixture.componentInstance;
        componentInstance.layer = shapeLayerConfig;
        componentInstance.path = d3.geo.path().projection(projection);

        componentFixture.detectChanges();

        updateService.triggerLayerDataLoaded(shapeLayerConfig, data);

        let nativeElement = componentFixture.nativeElement;
        checkShapeStructure(nativeElement, '#ff0000',
          '0.5', '#777771', '5px', '0.1');

        updateService.triggerLayerConfigurationUpdates(shapeLayerConfig, {
          styles: {
            background: {
              fill: '#ff0001',
              opacity: '0.4'
            },
            lines: {
              stroke: '#777777',
              strokeWidth: '0.5px',
              strokeOpacity: '0.4'
            }
          }
        });

        componentFixture.detectChanges();

        checkShapeStructure(nativeElement, '#ff0001',
          '0.4', '#777777', '0.5px', '0.4');
      });
  })));

  // TODO: circle values
  // TODO: circle variable radius
  // TODO: circle threshold for background
});