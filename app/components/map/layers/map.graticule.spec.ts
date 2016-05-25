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

import {GraticuleLayerComponent} from './map.graticule';
import {GRATICULE_DEFAULTS} from './layers.defaults';
import {GraticuleLayer} from '../../../model/map.model';
import {rgb2hex} from '../../../services/utils';
import {MapUpdateService} from '../../../services/map/map.update.service';

declare var d3: any;

describe('Tests for graticule layer', () => {
  var graticuleLayerConfig = <GraticuleLayer>{
    id: 'graticuleLayer',
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

  function checkGraticuleStructure(nativeElement, borderStroke:string,
    borderStrokeWidth:string, backgroundFill:string, linesStroke:string,
    linesStrokeWidth:string, linesStrokeOpacity:string) {
    // Testing defs element
    var defsElement = nativeElement.querySelector('defs');
    expect(defsElement).not.null;
    expect(defsElement.childNodes).not.null;
    expect(defsElement.childNodes.length).toEqual(1);
    var pathElement = defsElement.childNodes[0]
    expect(pathElement.nodeName.toLowerCase()).toEqual('path');
    expect(pathElement.id).toEqual('sphere');
    expect(pathElement.path).not.null;
    expect(pathElement.path).not.toEqual('');

    // Testing use elements
    var useElements = nativeElement.querySelectorAll('use');
    expect(useElements).not.null;
    expect(useElements.length).toEqual(2);

    var firstUseElement = useElements[0];
    var firstUseElementStyles = firstUseElement.style;
    expect(rgb2hex(firstUseElementStyles.stroke)).toEqual(borderStroke);
    expect(firstUseElementStyles['stroke-width']).toEqual(borderStrokeWidth);
    expect(firstUseElementStyles.fill).toEqual('none');
    expect(firstUseElement.getAttribute('href')).toEqual('#sphere');

    var secondUseElement = useElements[1];
    var secondUseElementStyles = secondUseElement.style;
    expect(rgb2hex(secondUseElementStyles.fill)).toEqual(backgroundFill);
    expect(secondUseElement.getAttribute('href')).toEqual('#sphere');

    // Testing path elements
    var pathElement = [].find.call(nativeElement.childNodes, child => child.nodeName.toLowerCase() === 'path');
    expect(pathElement.id).toEqual('lines');
    expect(pathElement.d).not.null;
    expect(pathElement.d).not.toEqual('');
    var pathElementStyles = pathElement.style;
    expect(pathElementStyles.fill).toEqual('none');
    expect(rgb2hex(pathElementStyles.stroke)).toEqual(linesStroke);
    expect(pathElementStyles['stroke-width']).toEqual(linesStrokeWidth);
    expect(pathElementStyles['stroke-opacity']).toEqual(linesStrokeOpacity);
  }
    
  it('should define default values for properties',
    async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      var updateService = new MapUpdateService();

      tcb.overrideProviders(GraticuleLayerComponent, [
            provide(MapUpdateService, { useValue: updateService })
          ])
          .createAsync(GraticuleLayerComponent).then((componentFixture) => {
        let componentInstance = componentFixture.componentInstance;
        componentInstance.layer = { type: 'graticule' };
        componentInstance.path = d3.geo.path();

        componentFixture.detectChanges();

        let nativeElement = componentFixture.nativeElement;
        checkGraticuleStructure(nativeElement, GRATICULE_DEFAULTS.BORDER_STROKE,
          GRATICULE_DEFAULTS.BORDER_STROKE_WIDTH, GRATICULE_DEFAULTS.BACKGROUND_FILL,
          GRATICULE_DEFAULTS.LINES_STROKE, GRATICULE_DEFAULTS.LINES_STROKE_WIDTH,
          GRATICULE_DEFAULTS.LINES_STROKE_OPACITY);
      });
    })));

  it('should use custom values for properties',
    async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      var updateService = new MapUpdateService();

      tcb.overrideProviders(GraticuleLayerComponent, [
             provide(MapUpdateService, { useValue: updateService })
           ])
          .createAsync(GraticuleLayerComponent).then((componentFixture) => {
        let componentInstance = componentFixture.componentInstance;
        componentInstance.layer = graticuleLayerConfig;
        componentInstance.path = d3.geo.path();

        componentFixture.detectChanges();

        let nativeElement = componentFixture.nativeElement;
        checkGraticuleStructure(nativeElement, '#000000',
          '3px', '#a4bac7', '#777777', '0.5px', '0.5');
      });
    })));

  it('should update values for properties',
    async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      var updateService = new MapUpdateService();

      tcb.overrideProviders(GraticuleLayerComponent, [
            provide(MapUpdateService, { useValue: updateService })
          ])
          .createAsync(GraticuleLayerComponent).then((componentFixture) => {
        let componentInstance = componentFixture.componentInstance;
        componentInstance.layer = graticuleLayerConfig;
        componentInstance.path = d3.geo.path();

        componentFixture.detectChanges();

        let nativeElement = componentFixture.nativeElement;
        checkGraticuleStructure(nativeElement, '#000000',
          '3px', '#a4bac7', '#777777', '0.5px', '0.5');

        updateService.triggerLayerConfigurationUpdates(graticuleLayerConfig, {
          styles: {
            border: {
              stroke: '#000001',
              strokeWidth: '1px'
            },
            background: {
              fill: '#ff0000'
            },
            lines: {
              stroke: '#777771',
              strokeWidth: '5px',
              strokeOpacity: '0.1'
            }
          }
        });

        componentFixture.detectChanges();

        checkGraticuleStructure(nativeElement, '#000001',
          '1px', '#ff0000', '#777771', '5px', '0.1');
      });
    })));
});