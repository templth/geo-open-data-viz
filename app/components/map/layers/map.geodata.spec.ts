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

import {ShapePointLayerComponent} from './map.shape.point';
import {GEODATA_DEFAULTS} from './layers.defaults';
import {GeodataLayer} from '../../../model/map.model';
import {rgb2hex} from '../../../services/utils';
import {MapService} from '../../../services/map/map.service';
import {MapUpdateService} from '../../../services/map/map.update.service';
import {ExpressionsService} from '../../../services/expressions/expressions.service';

declare var d3: any;

describe('Tests for geodata layer', () => {
  // http://stackoverflow.com/questions/37417049/spy-on-does-not-return-true-although-the-code-triggers-the-event
});