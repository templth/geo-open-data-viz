'use strict';

// Service

angular.module('mapManager.d3.services')

// Layer service

/**
 * @ngdoc service
 * @name mapManager.d3.services:layerService
 * @description
 * Provide functions to create and manipulate layers of maps.
 */
.service('layerService', function(currentMapService, mapInteractionService,
      consoleService, valueChecker, expressionService, d3Service, propertiesHelper,
      mapHelper, d3Helper, $interval) {
  return {
    // Utility function to update map

    getLoadFunction: function(type) {
      var loadFct = null;
      if (type === 'json' || type === 'topojson') {
        loadFct = d3Service.json;
      } else if (type === 'csv') {
        loadFct = d3Service.csv;
      } else if (type === 'tsv') {
        loadFct = d3Service.tsv;
      }
      return loadFct;
    },

    /**
     * @ngdoc method
     * @name toggleLayerVisibility
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Toggle visibility of a specific layer without removing it
     * from the SVG content.
     *
     * @param {Object} layer the layer
    */
    toggleLayerVisibility: function(layer) {
      var currentMapId = currentMapService.getCurrentMapId();
      var layerElement = d3.select(document.getElementById(
        currentMapId + '-' +layer.id));
      var visible = (layerElement.style('visibility') === 'visible');
      if (visible) {
        consoleService.logMessage('info',
          'Hidden layer with id "' + layer.id + '"');
        layerElement.style('visibility', 'hidden');
      } else {
        consoleService.logMessage('info',
          'Displayed layer with id "' + layer.id + '"');
        layerElement.style('visibility', 'visible');
      }
    },

    /**
     * @ngdoc method
     * @name toggleLayerApplying
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Toggle applying of a specific layer. It actually removes it
     * from the SVG content.
     *
     * @param {Object} layer the layer
    */
    toggleLayerApplying: function(svg, path, layer) {
      if (layer.applied) {
        this.deleteLayer(svg, path, layer);
      } else {
        this.createLayer(svg, path, layer);
      }
    },

    /**
     * @ngdoc method
     * @name refreshLayerApplying
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Refresh applying of a specific layer. It actually removes
     * and adds again the layer content within the SVG content.
     *
     * @param {Object} layer the layer
    */
    refreshLayerApplying: function(svg, path, layer) {
      if (layer.applied) {
        this.deleteLayer(svg, path, layer);
        this.createLayer(svg, path, layer);
      }
    },

    /**
     * @ngdoc method
     * @name getLayerElement
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Get an instance of the layer in the SVG content.
     *
     * It creates a new sub element with identifier the
     * specified layer identifier under the element with
     * identifier `layers`.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} layer the layer
    */
    getLayerElement: function(svg, layer) {
      var currentMapContext = currentMapService.getCurrentMapContext();
      var currentMapId = currentMapService.getCurrentMapId();
      console.log('>> currentMapId = '+currentMapId);
      var layerElement = d3Service.select(document.getElementById(
        currentMapId + '-' + layer.id));
      console.log('>> layerElement.empty() = '+layerElement.empty());
      if (layerElement.empty()) {
        console.log('  >> 0');
        var applyOn = layer.applyOn;
        if (valueChecker.isNull(applyOn)) {
          console.log('  >> 1');
          applyOn = 'layers';
        }
        console.log('  >> 2');
        var sel = d3Service.select(document.getElementById(
          currentMapId + '-' + applyOn));
        console.log('  >> 3 - '+currentMapId + '-' + applyOn);
        if (valueChecker.isNull(sel)) {
          console.log('  >> 4');
          sel = svg;
        }

        console.log('  >> 5- sel.empty() = '+sel.empty());
        layerElement = sel.append('g')
            .attr('id', currentMapId + '-' + layer.id);
        console.log('  >> 6 - '+currentMapId + '-' + layer.id);
      }

      return layerElement;
    },

    addPropertiesToData: function(layerData, data,
        handleData, additionalContext) {
      var self = this;

      var propertiesUrl = expressionService.parseExpression(
        layerData.properties.url);
      var loadPropertiesFct = self.getLoadFunction(
        layerData.properties.type);
      loadPropertiesFct(expressionService.evaluateExpression(
          propertiesUrl, null, null, additionalContext), function(properties) {
        data = self.formatDataAsArray(layerData, data);

        _.forEach(data.objects[layerData.rootObject].geometries, function(d) {
          var prop = _.find(properties, 'id', d.id.toString());
          if (valueChecker.isNotNull(prop)) {
            d.properties = prop;
          }
        });

        data.objects[layerData.rootObject].geometries = self.filterDataForLayer(
          layerData, data.objects[layerData.rootObject].geometries, additionalContext);

        handleData(data);
      });
    },

    /**
     * @ngdoc method
     * @name loadDataForLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Actually handle data loading. It also supports preloaded
     * and inline data.
     *
     * @param {Object} layerData actually the layer.data attribute
     * @param {Function} handleData the function to actually handle data
    */
    loadDataForLayer: function(layerData, additionalContext, handleData) {
      var self = this;
      if (layerData.loaded) {
        handleData(this.filterDataForLayer(
          layerData.content, layerData.properties));
      } else if (valueChecker.isNotNullAndNotEmpty(layerData.inline)) {
        var data = expressionService.parseExpression(layerData.inline);
        handleData(self.filterDataForLayer(
          layerData, data(), additionalContext));
      } else {
        var url = expressionService.parseExpression(layerData.url);
        var loadFct = self.getLoadFunction(layerData.type);
        loadFct(expressionService.evaluateExpression(
            url, null, null, additionalContext), function(data) {
          if (layerData.type === 'topojson' &&
              valueChecker.isNotNull(layerData.properties) &&
              valueChecker.isNotNull(layerData.properties.url)) {
            self.addPropertiesToData(layerData, data,
              handleData, additionalContext);
          } else {
            data = self.formatDataAsArray(layerData, data);
            handleData(self.filterDataForLayer(
              layerData, data, additionalContext));
          }
        });
      }
    },

    formatDataAsArray: function(layerData, data) {
      if (_.isObject(data) && layerData.formatDataAsArray) {
        var formatedData = [];
        _.forEach(data, function(n, key) {
          formatedData.push(n);
        });
        return formatedData;
      }

      return data;
    },

    /**
     * @ngdoc method
     * @name filterDataForLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Filter data according to the specified configuration.
     *
     * @param {Object} layerData actually the layer.data attribute
     * @param {Object} data the data to filter
    */
    filterDataForLayer: function(layerData, data, additionalContext) {
      if (valueChecker.isNotNull(layerData.where)) {
        var dataWhere = expressionService.parseExpression(layerData.where);
        data = _.filter(data, function(d, i) {
          //console.log('>> d = '+JSON.stringify(d));
          //console.log('>> additionalContext = '+JSON.stringify(additionalContext));
          return dataWhere(expressionService.getExpressionContext(
            d, i, additionalContext));
        });
      }

          if (layerData.url === '"http://localhost:9000/scripts/json/us/us-main-cities.csv"') {
            console.log('additionalContext = '+JSON.stringify(additionalContext));
              console.log('data = '+JSON.stringify(data));
            }


      if (valueChecker.isNotNull(layerData.order) &&
          valueChecker.isNotNull(layerData.order.field)) {
        var field = layerData.order.field;
        var order = layerData.order ? layerData.order : true;
        data = data.sort(function(a, b) {
          if (order.ascending) {
            return a[field] - b[field];
          } else {
            return b[field] - a[field];
          }
        });
      }

      return data;
    },

    // Tooltips

    createTooltipEvents: function(elements, values, tooltipDiv,
        tooltipText, showEvent, hideEvent, additionalContext) {
      // Show tooltip
      if (showEvent === 'click') {
        elements.on('click', function(d, i) {
          //d3.select(this).transition().duration(300).style('opacity', 1);
          // TODO: enlighten borders rather
          tooltipDiv.transition().duration(300)
             .style('opacity', 1);
          tooltipDiv.html(function() {
            // Workaround for circle shape where the data object is embedded
            // within the generated geo path. See method createCircleObjectsDataLayer
            // for more details
            if (valueChecker.isNotNull(d.d)) {
              var context = expressionService.getExpressionContext(
                d.d, i, additionalContext);
              if (valueChecker.isNotNull(values)) {
                context.value = values[d.d.id];
              }
              return expressionService.evaluateExpression(
                tooltipText, null, null, context);
            } else {
              var context = expressionService.getExpressionContext(
                d, i, additionalContext);
              if (valueChecker.isNotNull(values)) {
                context.value = values[d.id];
              }
              return expressionService.evaluateExpression(
                tooltipText, null, null, context);
            }
          })
             .style('left', (d3Service.event.pageX) + 'px')
             .style('top', (d3Service.event.pageY - 30) + 'px');
        });
      } else if (showEvent === 'mouseover') {
        elements.on('mouseover', function(d, i) {
          // TODO: enlighten borders rather
          //d3.select(this).transition().duration(300).style('opacity', 1);
          tooltipDiv.transition().duration(300)
             .style('opacity', 1);
          tooltipDiv.html(function() {
            if (valueChecker.isNotNull(d.d)) {
              var context = expressionService.getExpressionContext(
                d.d, i, additionalContext);
              if (valueChecker.isNotNull(values)) {
                context.value = values[d.d.id];
              }
              return tooltipText(context);
            } else {
              var context = expressionService.getExpressionContext(
                d, i, additionalContext);
              if (valueChecker.isNotNull(values)) {
                context.value = values[d.id];
              }
              return tooltipText(context);
            }
          })
             .style('left', (d3Service.event.pageX) + 'px')
             .style('top', (d3Service.event.pageY - 30) + 'px');
        });
      }

      // Hide tooltip
      if (hideEvent === 'mouseout') {
        elements.on('mouseout', function() {
          console.log('mouseout');
          /*d3.select(this)
            .transition().duration(300)
            .style('opacity', 0.8);*/
          tooltipDiv.transition().duration(300)
             .style('opacity', 0);
        });
      }
    },

    // End tooltips

    // Graticule layer

    /**
     * @ngdoc method
     * @name createGraticuleLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path element for the projection
     * @param {Object} layer the layer
     * @param {Object} additionalContext the additional context
    */
    createGraticuleLayer: function(svg, path, layer, layers, additionalContext) {
      consoleService.logMessage('info',
        'Creating graticule layer with identifier "' + layer.id + '"');
      if (layer.id === null) {
        layer.id = 'graticuleLayer';
      }

      var layerElement = this.getLayerElement(svg, layer);

      var graticule = d3Service.geo.graticule();

      if (layer.display.background && layer.display.border) {
        layerElement.append('defs').append('path')
          .datum({type: 'Sphere'})
          .attr('id', 'sphere')
          .attr('d', path);

        if (layer.display.border) {
          var borderStroke = '#000';
          var borderStrokeWidth = '1px';
          if (layer.styles.border != null) {
            if (layer.styles.border.stroke != null) {
              borderStroke = layer.styles.border.stroke;
            }
            if (layer.styles.border.strokeWidth != null) {
              borderStrokeWidth = layer.styles.border.strokeWidth;
            }
          }

          layerElement.append('use')
            .style('stroke', borderStroke)
            .style('stroke-width', borderStrokeWidth)
            .style('fill', 'none')
            .attr('xlink:href', '#sphere');
        }

        if (layer.display.background) {
          var backgroundFill = '#000';
          if (layer.styles.background != null) {
            if (layer.styles.background.fill != null) {
              backgroundFill = layer.styles.background.fill;
            }
          }

          layerElement.append('use')
            .style('fill', backgroundFill)
            .attr('xlink:href', '#sphere');
        }
      }

      if (layer.display.lines) {
        var linesStroke = '#777';
        var linesStrokeWidth = '0.5px';
        var linesStrokeOpacity = '0.5';
        if (layer.styles.lines != null) {
          if (layer.styles.lines.stroke != null) {
            linesStroke = layer.styles.lines.stroke;
          }
          if (layer.styles.lines.strokeWidth != null) {
            linesStrokeWidth = layer.styles.lines.strokeWidth;
          }
          if (layer.styles.lines.strokeOpacity != null) {
            linesStrokeOpacity = layer.styles.lines.strokeOpacity;
          }
        }

        layerElement.append('path')
          .attr('id', layer.id)
          .datum(graticule)
          .style('fill', 'none')
          .style('stroke', linesStroke)
          .style('stroke-width', linesStrokeWidth)
          .style('stroke-opacity', linesStrokeOpacity)
          .attr('d', path);
      }
    },

    // End graticule layer

    // Geo data layer

    /**
     * @ngdoc method
     * @name applyStylesForGeoDataLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Apply styles on the geo data according to the configuration
     * of the layer:
     *
     * * layer.styles.background for the background
     * * layer.styles.lines for lines
     *
     * Regarding the background color, random colors can be applied
     * based on the element `layer.display.fill`.
     *
     * @param {Object} layer the layer
     * @param {Object} pathElements the path elements to apply styles on
     * @param {Object} additionalContext the additional context for expressions
    */
    applyStylesForGeoDataLayer: function(
        layer, pathElements, additionalContext) {
      if (valueChecker.isNotNull(layer.styles)) {
        if (valueChecker.isNotNull(layer.styles.background)) {
          var background = '#fff';
          if (valueChecker.isNotNull(layer.styles.background.fill)) {
            background = layer.styles.background.fill;
          }
          pathElements.style('fill', background);
        }

        if (valueChecker.isNotNull(layer.styles.lines)) {
          var stroke = '#fff';
          var strokeWidth = '0.5px';
          var strokeOpacity = '0.5';
          if (valueChecker.isNotNull(layer.styles.lines.stroke)) {
            stroke = layer.styles.lines.stroke;
          }
          if (valueChecker.isNotNull(layer.styles.lines.strokeWidth)) {
            strokeWidth = layer.styles.lines.strokeWidth;
          }
          if (valueChecker.isNotNull(layer.styles.lines.strokeOpacity)) {
            strokeOpacity = layer.styles.lines.strokeOpacity;
          }

          pathElements.style('stroke', stroke);
          pathElements.style('stroke-width', strokeWidth);
          pathElements.style('stroke-opacity', strokeOpacity);
        }
      }

      if (valueChecker.isNotNull(layer.display) &&
        valueChecker.isNotNull(layer.display.fill)) {

        if (valueChecker.isNotNull(layer.display.fill.categorical) &&
            valueChecker.isNotNull(layer.display.fill.categorical.value) &&
            valueChecker.isNotNull(layer.display.fill.categorical.name)) {
          var value = expressionService.parseExpression(
            layer.display.fill.categorical.value);
          // Experimental - random fill color
          // See http://bl.ocks.org/jczaplew/4444770
          // See https://github.com/mbostock/topojson/wiki/API-Reference

          // Supported values are: 10, 20, 20b, 20c
          var color = d3Service.scale.category20();
          var colorRangeSize = 20;
          if (valueChecker.isNotNull(layer.display.fill.categorical.name)) {
            if (layer.display.fill.categorical.name === 'category10') {
              color = d3Service.scale.category10();
              colorRangeSize = 10;
            } else if (layer.display.fill.categorical.name === 'category20') {
              color = d3Service.scale.category20();
              colorRangeSize = 20;
            } else if (layer.display.fill.categorical.name === 'category20b') {
              color = d3Service.scale.category20b();
              colorRangeSize = 20;
            } else if (layer.display.fill.categorical.name === 'category20c') {
              color = d3Service.scale.category20c();
              colorRangeSize = 20;
            }
          }
          /*var countries = topojson.feature(data, data.objects[layer.data.rootObject]).features;
          console.log('countries = '+countries.length);
          var neighbors = topojson.neighbors(data.objects[layer.data.rootObject].geometries);
          console.log('neighbors = '+neighbors.length);*/

          pathElements.style('fill', function(d, i) {
            return color(expressionService.evaluateExpression(
              value, d, i, additionalContext) % colorRangeSize);
          });
        } else if (valueChecker.isNotNull(layer.display.fill.value)) {
          var value = expressionService.parseExpression(
            layer.display.fill.value);

          pathElements.style('fill', function(d, i) {
            return expressionService.evaluateExpression(
              value, d, i, additionalContext);
          });
        }
      }
    },

    /**
     * @ngdoc method
     * @name configureZoomBoundingBehavior
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Configure behavior for a layer:
     *
     * * Zooming to bounding - see the method
     * * Displaying sub map - see the method
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path
     * @param {Object} layer the layer
     * @param {Object} pathElements the path elements to apply on
    */
    configureBehaviors: function(svg, path, layer, layers, pathElements) {
      var eventsZoomBoundingBox = propertiesHelper.getDomainEvents(
        layer, 'zoomBoundingBox');
      var eventsSubMap = propertiesHelper.getDomainEvents(layer, 'subMap');

      if (valueChecker.isNotNull(layer.behavior) &&
          valueChecker.isNotNull(layer.behavior.zoomBoundingBox)) {
        this.configureZoomBoundingBehavior(svg, path,
          layer, pathElements, eventsZoomBoundingBox);
      } else if (valueChecker.isNotNull(layer.display) &&
          valueChecker.isNotNull(layer.display.subMap) &&
          valueChecker.isNotNull(eventsSubMap)) {
        this.configureSubMapBehavior(svg, path, layer, layers,
          pathElements, eventsSubMap);
      }

      // TODO: animation
      // See http://pnavarrc.github.io/earthquake/
    },

    /**
     * @ngdoc method
     * @name configureZoomBoundingBehavior
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Configure the behavior `zooming to bounds` for a layer:
     *
     * This method is called if the layer has the following
     * configuration:
     *
     * behavior: {
     *   subMap: {
     *     display: 'dblclick'
     *   }
     * }
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path
     * @param {Object} layer the layer
     * @param {Object} pathElements the path elements to apply on
    */
    configureZoomBoundingBehavior: function(svg, path, layer, pathElements) {
      // See http://bl.ocks.org/mbostock/4699541
      // See http://bl.ocks.org/mbostock/4183330
      // See https://www.jasondavies.com/maps/zoom/
      // See http://bl.ocks.org/mbostock/2206590
      // See http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
      // See http://bl.ocks.org/mbostock/5126418
      // See http://bl.ocks.org/mbostock/4707858
      // See http://bl.ocks.org/jasondavies/4183701
      pathElements.on('click', function(d) {
        var currentMapContext = currentMapService.getCurrentMapContext();
        var projection = currentMapContext.projection;

        if (valueChecker.isNotNull(projection)/* &&
            projection === 'orthographic'*/) {
          d3Service.transition().delay(100).duration(750).tween('rotate', function() {
            var p = d3Service.geo.centroid(d);
            var r = d3Service.interpolate(projection.rotate(), [-p[0], -p[1]]);
            return function(t) {
              projection.rotate(r(t));
            };
          })/*.tween('scale', function() {
            var s = d3Service.interpolate(projection.scale(), 1000);
            return function(t) {
              projection.scale(s(t));
            };
          })*/;
        }
      });
    },

    getBounds: function(path, d, width, height) {
      var bounds = d3.geo.bounds(d);
      var dx = bounds[1][0] - bounds[0][0];
      var dy = bounds[1][1] - bounds[0][1];
      var x = (bounds[0][0] + bounds[1][0]) / 2;
      var y = (bounds[0][1] + bounds[1][1]) / 2;
      var scale = 0.9 / Math.max(dx / width, dy / height);
      var translate = [width / 2 - scale * x, height / 2 - scale * y];

      return {
        bounds: bounds,
        translate: translate,
        scale: scale
      };
    },

    /**
     * @ngdoc method
     * @name applyLayersOnSubMap
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Apply layers on sub map.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path
     * @param {Object} layer the layer
     * @param {Object} layerElement the layer element
     * @param {Object} additionalContext the additional context for expressions
    */
    applyLayersOnSubMap: function(svg, path,
        layer, layers, layerElement, additionalContext) {
      var self = this;

      _.forEach(layer.display.subMap.layers, function(layer) {
        var subLayer = _.find(layers, 'id', layer);
        self.createLayer(svg, path, subLayer, layers, additionalContext);
      });

      self.configureSubMapLegend(svg, path, layer,
        layerElement, additionalContext);
    },

    /**
     * @ngdoc method
     * @name unapplyLayersOnSubMap
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Unapply layers on sub map.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} layer the layer
    */
    unapplyLayersOnSubMap: function(svg, layer) {
      _.forEach(layer.display.subMap.layers, function(layer) {
        d3Service.select('#map2-' + layer).remove();
      });
    },

    /**
     * @ngdoc method
     * @name executeShowSubMapTransition
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Execute the transition to show the sub map
     *
     * @param {Object} d the current selected element
     * @param {Object} projection the current projection
     * @param {Object} path the current path
     * @param {Object} layerElements the different path elements that define the shape
     * @param {Function} onEndFct the function to execute when transition ends
    */
    executeShowSubMapTransition: function(d, projection,
        path, layerElements, onEndFct) {
      d3Service.select('#map2-layers').transition()
        .delay(100).duration(750)
        .tween('rotate', function() {
          var p = d3Service.geo.centroid(d);
          var r = d3Service.interpolate(projection.rotate(), [-p[0], -p[1]]);
          return function(t) {
            projection.rotate(r(t));
            path = path.projection(projection);
            layerElements.attr('d', path);

          };
        })
        .tween('scale', function() {
          //TODO: determine the right scale ratio
          //1000 for meteorites
          //3000 for unemployment
          var r = d3Service.interpolate(projection.scale(), 1000);
          return function(t) {
            projection.scale(r(t));
            path = path.projection(projection);
            layerElements.attr('d', path);

          };
        })
        .each('end', onEndFct);
    },

    /**
     * @ngdoc method
     * @name executeShowSubMapTransition
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Create processing for the transition to hide the sub map
     *
     * @param {Object} svg the global SVG element
     * @param {Object} layer the layer
     * @param {Object} projection the current projection
     * @param {Object} gMap the element corresponding to the map
     * @param {Object} path the current path
     * @param {Object} layerElements the different path elements that define the shape
    */
    createHideSubMapTransition: function(svg, layer,
        projection, gMap, path, layerElements) {
      var self = this;
      return function() {
        var selfElement = gMap;

        currentMapService.setCurrentMapId('map1');

        self.unapplyLayersOnSubMap(svg, layer);

        d3Service.select('#map2-layers').transition()
          .delay(100).duration(750)
          .tween('rotate', function() {
            var r = d3Service.interpolate(projection.rotate(), [
              currentMapService.getCurrentMapContext()
                               .properties.center.lon,
              currentMapService.getCurrentMapContext()
                               .properties.center.lat
            ]);
            return function(t) {
              projection.rotate(r(t));
              path = path.projection(projection);
              layerElements.attr('d', path);
            };
          })
          .tween('scale', function() {
            var r = d3Service.interpolate(projection.scale(),
              currentMapService.getCurrentMapContext().properties.scale);
            return function(t) {
              projection.scale(r(t));
              path = path.projection(projection);
              layerElements.attr('d', path);
            };
          })
          .each('end', function() {
            selfElement.remove();
          });

        d3Service.select('#map1').transition()
          .delay(100).duration(750)
          .attr('transform', 'translate(0,0)scale(1,1)');
      };
    },

    /**
     * @ngdoc method
     * @name configureSubMapBehavior
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Configure the behavior `sub map` for a layer:
     *
     * This method is called if the layer has the following
     * configuration:
     *
     * behavior: {
     *   subMap: {
     *     display: 'dblclick'
     *   }
     * }
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path
     * @param {Object} layer the layer
    */
    configureSubMapBehavior: function(svg, path, layer, layers, pathElements, events) {
      var self = this;
      if (events.display === 'click') {
        pathElements.on('click', function(d) {
          console.log('>> configureSubMapBehavior - click');
          var currentMapContext = currentMapService.getCurrentMapContext();
          var width = currentMapContext.dimensions.width;
          var height = currentMapContext.dimensions.height;
          var moveType = 'mouseMove';
          var zoomType = 'mouseWheel';

          var mapElements = mapHelper.createSubMapStructure(svg, 2,
            { width: width, height: height },
            { fill: 'white', opacity: '0.75' });

          // Create root layer
          var rootLayer = mapElements.gLayers.append('g').attr('id', 'root');

          var projection2 = d3Service.geo.orthographic()
              .scale(currentMapService.getCurrentMapContext().properties.scale)
              .clipAngle(90)
              .rotate([
                currentMapService.getCurrentMapContext()
                                 .properties.center.lon,
                currentMapService.getCurrentMapContext()
                                 .properties.center.lat
              ]);
          var path2 = d3Service.geo.path().projection(projection2);

          currentMapService.setCurrentMapId('map2');
          currentMapService.registerCurrentMapContext(svg, path2,
            projection2, mapElements.gMap, mapElements.gLayers,
            {width: width, height: height});

          mapInteractionService.configureMoving(/*$scope*/null, svg, moveType, {
            type: currentMapService.getCurrentMap().projection, raw: projection2
          }, mapHelper.getMapElements());
          /*mapInteractionService.configureZooming(null, svg, zoomType, {
            type: currentMapService.getCurrentMap().projection, raw: projection2
          }, mapHelper.getMapElements());*/

          var layerElements = rootLayer.selectAll('path')
                 .data([ d ])
                 .enter()
                 .append('path')
                 .attr('id', function(d) {
                   return 'cloned' + d.id;
                 })
                 .attr('d', path2)
                 .style('fill', 'grey')
                 .style('stroke', '#fff')
                 .style('strokeWidth', '1px')
                 .style('strokeOpacity', '1');

          var bds = self.getBounds(path2, d, width, height);

          self.executeShowSubMapTransition(d, projection2, path2, layerElements, function() {
            self.applyLayersOnSubMap(svg, path2, layer, layers, rootLayer,
              { shape: d, bounds: bds.bounds });
            self.configureSubMapLegend(svg, path2, layer, mapElements.gMap,
              { shape: d, bounds: bds.bounds },
              self.createHideSubMapTransition(svg, layer, projection2,
                mapElements.gMap, path2, layerElements));
          });

          d3Service.select('#map1').transition()
            .delay(100).duration(750)
            .attr('transform', 'translate(750,40)scale(0.2083333283662796,0.2083333283662796)');
        });
      }
    },

    /**
     * @ngdoc method
     * @name configureSubMapLegend
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Configure the legend associated for the sub map
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path
     * @param {Object} layer the layer
     * @param {Object} layerElement the layer element
     * @param {Object} additionalContext the additional context for expressions
    */
    configureSubMapLegend: function(svg, path, layer,
        gMap, additionalContext, closeFct) {
      if (valueChecker.isNotNull(layer.display.subMap.legend)) {
        var legendLabel = expressionService.parseExpression(
          layer.display.subMap.legend.label);

        // TODO: Configure the rect ize according the number of values
        var legend = gMap.append('g')
          .attr('class', 'legend');

        legend.append('rect')
          .attr('x', 10)
          .attr('y', 10)
          .attr('width', 150)
          .attr('height', 60)
          .style('fill', 'grey')
          .style('opacity', '0.7');

        legend.append('text')
          .attr('x', 75)
          .attr('y', 35)
          .text(function() {
            return expressionService.evaluateExpression(
              legendLabel, null, null, additionalContext);
          })
          .style('text-anchor', 'middle');

        legend.append('text')
          .attr('x', 75)
          .attr('y', 55)
          .text('close')
          .style('text-anchor', 'middle')
          .on('click', closeFct);

        //if (valueChecker.isNotNull(layer.behavior.animation)) {
          var legendAnimation = gMap.append('g')
            .attr('class', 'legend');

          legendAnimation.append('rect')
            .attr('x', 10)
            .attr('y', 75)
            .attr('width', 150)
            .attr('height', 60)
            .style('fill', 'grey')
            .style('opacity', '0.7');

          legendAnimation.append('text')
            .attr('x', 75)
            .attr('y', 100)
            .attr('id', 'map2-animation')
            .style('text-anchor', 'middle');
        //}
      }
    },

    configureShapeBounds: function(layer, layerElement, path, features) {
      console.log('>> configureShapeBounds');
      // See http://stackoverflow.com/questions/25310390/how-does-path-bounds-work
      // See http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object/17067379#17067379
      // See http://bl.ocks.org/hugolpz/6391065

function parallel(φ, λ0, λ1) {
  if (λ0 > λ1) λ1 += 360;
  var dλ = λ1 - λ0,
      step = dλ / Math.ceil(dλ);
  return d3.range(λ0, λ1 + .5 * step, step).map(function(λ) { return [normalise(λ), φ]; });
}

function normalise(x) {
  return (x + 180) % 360 - 180;
}

      var elements = layerElement.selectAll('path')
          /*.data(features)
          .enter()*/
          .append('path')
          .datum(function(feature) {
            //console.log('d.id = '+d.id);
            //console.log('feature = '+JSON.stringify(feature));
            //var bounds = path.bounds(d);
            //console.log('>> bounds = '+bounds);
            var bb = d3Service.geo.bounds(feature);
            /*var orig = origin(expressionService.getExpressionContext(d, i));
            orig[0] = parseFloat(orig[0]);
            orig[1] = parseFloat(orig[1]);
            var rad = radius({d: d});
            rad = parseFloat(rad);
            var c = circle
               .origin(orig)
               .angle(rad)({d: d});
            c.d = d;*/

            return {
              type: 'Polygon',
              coordinates: [
                [bb[0]]
                .concat(parallel(bb[1][1], bb[0][0], bb[1][0]))
                .concat(parallel(bb[0][1], bb[0][0], bb[1][0]).reverse())
              ]/*,
              d: d*/
            };
          })
          /*.attr('id', function(d) {
            return d.d.name + ' (bound)';
          })*/
          .attr('class', 'point')
          .attr('d', function(d) { return path(d); })
          /*.style('fill', '#f00')
          .style('fill-opacity', '.25')
          .style('stroke', '#000')
          .style('stroke-width', '1px')
          .style('pointer-events', 'none')*/
          .style({
            fill: '#94BF8B',
            'fill-opacity': 0.25})
          .style({
            stroke: '#94BF8B',
            'stroke-width': 1,
            'stroke-linejoin': 'round'
          });
    },

    /**
     * @ngdoc method
     * @name applyLayersOnSubMap
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Apply layers on sub map.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path
     * @param {Object} layer the layer
     * @param {Object} layerElement the layer element
     * @param {Object} additionalContext the additional context for expressions
    */
    applyDependentLayersOnLayer: function(svg, path,
        layer, layers, layerElement, additionalContext) {
      var self = this;

      var dependentLayers = _.filter(layers, function(l) {
        return (valueChecker.isNotNull(l.applyOn) && l.applyOn === layer.id);
      });

      _.forEach(dependentLayers, function(dependentLayer) {
        self.createLayer(svg, path, dependentLayer, layers, additionalContext);
      });
    },

    /**
     * @ngdoc method
     * @name createGeoDataLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Create a layer of type `geodata`.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path
     * @param {Object} layer the layer
     * @param {Object} additionalContext the additional context
    */
    createGeoDataLayer: function(svg, path,
        layer, layers, additionalContext) {
      var self = this;
      var layerElement = this.getLayerElement(svg, layer);

      function handleData(data) {
        var pathElements = null;
        if (layer.data.mesh) {
          pathElements = layerElement.append('path')
            .datum(topojson.mesh(data,
              data.objects[layer.data.rootObject],
              function(a, b) { return a.id !== b.id; }));

          self.applyStylesForGeoDataLayer(
            layer, pathElements, additionalContext);

          pathElements
            .attr('d', path);
        } else {
          var features = topojson.feature(data,
              data.objects[layer.data.rootObject]).features;

          pathElements = layerElement.selectAll('path')
            .data(features)
          .enter()
          .append('path')
          .attr('id', function(d) { return d.id; })
          .attr('d', path);

          self.applyStylesForGeoDataLayer(
            layer, pathElements, additionalContext);
          self.configureTooltip(
            layer, pathElements, additionalContext);
          /* self.configureShapeBounds(layer,
            layerElement, path, features, additionalContext); */
        }

        self.configureBehaviors(svg, path, layer, layers, pathElements);

        // Create layers that depend on
        self.applyDependentLayersOnLayer(svg, path,
          layer, layers, layerElement, additionalContext);
      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, additionalContext, handleData);
    },

    // End geo data layer

    // Fill layer

    /**
     * @ngdoc method
     * @name clearFillDataLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Clear a fill data layer by resfreshing the layer it
     * applies on.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} layer the layer
    */
    clearFillDataLayer: function(svg, layer) {
      var currentMapId = currentMapService.getCurrentMapId();

      // Reset fill for applied on layer
      var sel = d3Service.select('#' + currentMapId + '-' + layer.applyOn);
      sel.selectAll('path')
         .style('fill', function(d) {
        return '#000';
      });

      // Remove legend and tooltip if any
      var allLayersElement = d3Service.select('#' + currentMapId + '-layers');
      allLayersElement.selectAll('g.legend').remove();
      d3Service.select(document.getElementById(
        'tooltip-' + layer.id)).remove();
      // TODO: the layer applied on should be reloaded
      // refreshLayerApplying
    },

    applyStylesForFillLayer: function(layer, layerElement, values) {
      var styleHints = {};

      if (valueChecker.isNotNull(layer.display.fill.threshold)) {
        var tColor = d3Service.scale.threshold()
          .domain(layer.display.fill.threshold.values)
          .range(layer.display.fill.threshold.colors);
        styleHints.color = tColor;

        var tElements = layerElement.selectAll('path')
            .style('fill', function(d) {
          return tColor(values[d.id]);
        });
        styleHints.elements = tElements;
      } else if (valueChecker.isNotNull(layer.display.fill.choropleth)) {
        var cColor = d3Service.scale.quantize()
          .domain(layer.display.fill.choropleth.values)
          .range(layer.display.fill.choropleth.colors);
        styleHints.color = cColor;

        var cElements = layerElement.selectAll('path')
            .style('fill', function(d) {
          return cColor(values[d.id]);
        });
        styleHints.elements = cElements;
      }

      return styleHints;
    },

    /**
     * @ngdoc method
     * @name createFillDataLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Create a fill layer.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} layer the layer
     * @param {Object} additionalContext the additional context
    */
    createFillDataLayer: function(svg, layer, layers, additionalContext) {
      var self = this;
      var value = expressionService.parseExpression(layer.display.fill.value);

      function handleData(data) {
        var values = {};
        _.forEach(data, function(d, i) {
          values[d.id] = +expressionService.evaluateExpression(
            value, d, i, additionalContext);
        });

        var currentMapId = currentMapService.getCurrentMapId();
        var sel = d3Service.select('#'+ currentMapId +'-' + layer.applyOn);

        var styleHints = self.applyStylesForFillLayer(
          layer, sel, values);

        self.configureTooltip(layer, styleHints.elements,
          values, additionalContext);
        self.configureLegend(layer, sel, styleHints, additionalContext);
      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, additionalContext, handleData);
    },

    // End fill layer

    // Objects layer

    /**
     * @ngdoc method
     * @name applyStylesForShapeLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Apply styles on the geo data according to the configuration
     * of the layer:
     *
     * * layer.styles.background for the background
     * * layer.styles.lines for lines
     *
     * Regarding the background color, random colors can be applied
     * based on the element `layer.display.fill`.
     *
     * @param {Object} layer the layer
     * @param {Object} pathElements the path elements to apply styles on
     * @param {Object} additionalContext the additional context
    */
    applyStylesForShapeLayer: function(layer, pathElements, additionalContext) {
      var styleHints = {};

      if (valueChecker.isNotNull(layer.styles) &&
          valueChecker.isNotNull(layer.styles.lines)) {
        if (valueChecker.isNotNull(layer.styles.lines.stroke)) {
          pathElements.style('stroke', layer.styles.lines.stroke);
        }
        if (valueChecker.isNotNull(layer.styles.lines.strokeWidth)) {
          pathElements.style('stroke-width', layer.styles.lines.strokeWidth);
        }
      }

      if (valueChecker.isNotNull(layer.display) &&
          valueChecker.isNotNull(layer.display.shape)) {
        if (valueChecker.isNotNull(layer.display.shape.opacity)) {
          pathElements.style('opacity', layer.display.shape.opacity);
        }

        if (valueChecker.isNotNull(layer.display.shape.color)) {
          pathElements.style('fill', layer.display.shape.color);
        } else if (valueChecker.isNotNull(layer.display.shape.threshold)) {
          var tColor = d3Service.scale.threshold()
              .domain(layer.display.shape.threshold.values)
              .range(layer.display.shape.threshold.colors);
          styleHints.color = tColor;

          var tValue = expressionService.parseExpression(
            layer.display.shape.value);

          pathElements.style('fill', function(d, i) {
              var val = expressionService.evaluateExpression(tValue,
                d.d, i, additionalContext);
              return tColor(parseFloat(val));
            });
        } else if (valueChecker.isNotNull(layer.display.shape.choropleth)) {
          var cColor = d3Service.scale.choropleth()
              .domain(layer.display.shape.choropleth.values)
              .range(layer.display.shape.choropleth.colors);
          styleHints.color = cColor;

          var cValue = expressionService.parseExpression(
            layer.display.shape.value);

          pathElements.style('fill', function(d, i) {
            var val = expressionService.evaluateExpression(
              cValue, d.d, i, additionalContext);
            return cColor(parseFloat(val));
          });
        }
      }

      // raster images
      // See http://bl.ocks.org/mbostock/4150951

      return styleHints;
    },

    configureLegend: function(layer, layerElement, styleHints, additionalContext) {
      if (valueChecker.isNotNull(layer.display) &&
          valueChecker.isNotNull(layer.display.legend) &&
          layer.display.legend.enabled) {
        var legendLabel = expressionService.parseExpression(
          layer.display.legend.label);

        // TODO: Configure the rect ize according the number of values
        layerElement.append('rect')
          .attr('x', 10)
          .attr('y', 350)
          .attr('width', 100)
          .attr('height', 150)
          .style('fill', '#fff')
          .style('opacity', '0.7');

        var height = 500;

        var values = null;
        if (valueChecker.isNotNull(layer.display)) {
          // In the case of shape
          if (valueChecker.isNotNull(layer.display.shape)) {
            // In the case of threshold
            if (valueChecker.isNotNull(layer.display.shape.threshold) &&
                valueChecker.isNotNull(layer.display.shape.threshold.values)) {
              values = layer.display.shape.threshold.values;
            // In the case of choropleth
            } else if (valueChecker.isNotNull(layer.display.shape.choropleth) &&
                valueChecker.isNotNull(layer.display.shape.choropleth.values)) {
              values = layer.display.shape.choropleth.values;
            }
          // In the case of fill
          } else if (valueChecker.isNotNull(layer.display.fill)) {
            // In the case of threshold
            if (valueChecker.isNotNull(layer.display.fill.threshold) &&
                valueChecker.isNotNull(layer.display.fill.threshold.values)) {
              values = layer.display.fill.threshold.values;
            // In the case of choropleth
            } else if (valueChecker.isNotNull(layer.display.fill.choropleth) &&
                valueChecker.isNotNull(layer.display.fill.choropleth.values)) {
              values = layer.display.fill.choropleth.values;
            }
          }
        }

        if (valueChecker.isNull(values)) {
          values = [];
        }

        var legend = layerElement.selectAll('g.legend')
          .data(values)
          .enter()
          .append('g')
          .attr('class', 'legend');

        var ls_w = 20, ls_h = 20;

        legend.append('rect')
          .attr('x', 20)
          .attr('y', function(d, i) {
            return height - (i * ls_h) - 2 * ls_h;
          })
          .attr('width', ls_w)
          .attr('height', ls_h)
          .style('fill', function(d) {
            return styleHints.color(d);
          })
          .style('opacity', 0.8);

        legend.append('text')
          .attr('x', 50)
          .attr('y', function(d, i) {
            return height - (i * ls_h) - ls_h - 4;
          })
          .text(function(d, i) {
            return expressionService.evaluateExpression(
              legendLabel, d, i, additionalContext);
          });
      }
    },

    configureTooltip: function(layer, layerElements, values, additionalContext) {
      if (propertiesHelper.hasPropertyConfigured(layer, 'display', 'tooltip') &&
          layer.display.tooltip.enabled) {
        var tooltipText = expressionService.parseExpression(
          layer.display.tooltip.text);

        var tooltipDiv = d3Service.select('body').append('div')
          .attr('id', 'tooltip-' + layer.id)
          .attr('class', 'tooltip')
          .style('opacity', 0);

        // Events
        var tooltipEvents = propertiesHelper.getDomainEvents(layer, 'tooltip');
        if (valueChecker.isNotNull(tooltipEvents)) {
          this.createTooltipEvents(layerElements, values, tooltipDiv,
                tooltipText, tooltipEvents.display,
                tooltipEvents.hide, additionalContext);
        }
      }
    },

    configureShapeLabel: function(layer, layerElement, data, origin, additionalContext) {
      if (valueChecker.isNotNull(layer.display.shape.label)) {
        // See this link https://dillieodigital.wordpress.com/2013/01/09/quick-tip-preserve-svg-text-size-after-scale-transform/
        // regarding scaling
        var projection = currentMapService.getCurrentMapContext().projection;
        var labelText = expressionService.parseExpression(
          layer.display.shape.label.text);

        var dx = 0;
        var dy = 0;
        if (valueChecker.isNotNull(layer.display.shape.label.position)) {
          if (valueChecker.isNotNull(layer.display.shape.label.position.x)) {
            dx = layer.display.shape.label.position.x;
          }
          if (valueChecker.isNotNull(layer.display.shape.label.position.y)) {
            dy = layer.display.shape.label.position.y;
          }
        }

        layerElement.selectAll('text').data(data).enter().append('text')
          .attr('x', function(d, i) {
            var orig = expressionService.evaluateExpression(
              origin, d, i, additionalContext);
            return projection(orig)[0];
          })
          .attr('dx', dx)
          .attr('y', function(d, i) {
            var orig = expressionService.evaluateExpression(
              origin, d, i, additionalContext);
            return projection(orig)[1];
          })
          .attr('dy', dy)
          .text(function(d, i) {
            return expressionService.evaluateExpression(
              labelText, d, i, additionalContext);
          })
          //TODO: to be generalized via configuration
          .style('fill', 'gray')
          .style('font-size', '10px');
      }
    },

    /**
     * @ngdoc method
     * @name createCircleObjectsDataLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Create a circle layer.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path element for the projection
     * @param {Object} layer the layer
     * @param {Object} additionalContext the additional context
    */
    createCircleObjectsDataLayer: function(
        svg, path, layer, layers, additionalContext) {
      function filterData(data, value, additionalContext, startValue) {
        return _.filter(data, function(d, i) {
          var val = expressionService.evaluateExpression(
            value, d, i, additionalContext);
          if (valueChecker.isNotNaN(val)) {
            if (valueChecker.isNotNull(startValue)) {
              return (val > startValue);
            } else {
              return true;
            }
          }
          return false;
        });
      }

      function getRange(data, value, additionalContext) {
        var min = _.min(data, function(d, i) {
          return expressionService.evaluateExpression(value,
            d, i, additionalContext);
        });
        var max = _.max(data, function(d, i) {
          return expressionService.evaluateExpression(value,
            d, i, additionalContext);
        });

        return {
          min: expressionService.evaluateExpression(value,
            min, 0, additionalContext),
          max: expressionService.evaluateExpression(value,
            max, 0, additionalContext)
        };
      }

      var self = this;
      var origin = expressionService.parseExpression(
        layer.display.shape.origin);
      var radius = expressionService.parseExpression(
        layer.display.shape.radius);

      consoleService.logMessage('info',
        'Creating data layer with identifier "' + layer.id + '"');
      var circle = d3Service.geo.circle();

      var layerElement = this.getLayerElement(svg, layer);

      function handleData(data) {
        var idName = layer.data.id ? layer.data.id : 'id';

        var values = {};
        _.forEach(data, function(d) { values[d[idName]] = d; });

        if (propertiesHelper.hasPropertyConfigured(
            layer, 'behavior', 'animation')) {
          var animationValue = expressionService.parseExpression(
            layer.behavior.animation.value);

          var startValue = null;
          if (valueChecker.isNotNull(layer.behavior.animation.startValue)) {
            startValue = layer.behavior.animation.startValue;
          }
          var filteredData = filterData(data, animationValue,
            additionalContext, startValue);

          var elements = layerElement.selectAll('circle')
              .data(filteredData)
              .enter()
              .append('path');

          elements
            .datum(function(d, i) {
              //console.log('datum - d = '+JSON.stringify(d));
              var orig = expressionService.evaluateExpression(origin,
                d, i, additionalContext);
              orig[0] = parseFloat(orig[0]);
              orig[1] = parseFloat(orig[1]);
              var rad = expressionService.evaluateExpression(radius,
                d, i, additionalContext);
              rad = parseFloat(rad);
              var c = circle
                 .origin(orig)
                 .angle(rad)(expressionService.getExpressionContext(
                   d, i, additionalContext));
              c.d = d;
              return c;
            })
            .attr('id', function(d) {
              return d.d.name;
            })
            .attr('class', 'point')
            .attr('d', function(d) {
              return path(d);
            })
            .style('fill-opacity', 0.0);

          var styleHints = self.applyStylesForShapeLayer(
            layer, elements, additionalContext);

          self.configureTooltip(layer, elements, values, additionalContext);
          self.configureLegend(layer, layerElement,
            styleHints, additionalContext);

          var count = filteredData.length;
          var range = getRange(filteredData, animationValue, additionalContext);
          var currentValue = range.min;

          var duration = 500;
          if (valueChecker.isNotNull(layer.behavior.animation.interval)) {
            duration = layer.behavior.animation.interval;
          }

          var animationLabel = null;
          if (valueChecker.isNotNull(layer.behavior.animation.label)) {
            animationLabel = expressionService.parseExpression(
              layer.behavior.animation.label);
          }

          var intrv = $interval(function() {
            if (valueChecker.isNotNull(animationLabel)) {
              d3Service.select('#map2-animation').text(
                animationLabel(expressionService.getExpressionContext(
                  currentValue, 0, additionalContext)));
            } else {
              d3Service.select('#map2-animation').text(currentValue);
            }
            currentValue++;
            if (currentValue > range.max) {
              d3Service.select('#map2-animation').text('');
              $interval.cancel(intrv);
            }
          }, duration);

          var showAllAtEnd = false;
          if (valueChecker.isNotNull(layer.behavior.animation.showAllAtEnd)) {
            showAllAtEnd = layer.behavior.animation.showAllAtEnd;
          }

          elements
            .transition()
            .delay(function(d, i) {
              return (expressionService.evaluateExpression(animationValue,
                   d.d, i, additionalContext) - range.min) * duration;
            })
            .duration(function() {
              return duration;
            })
            .each('start', function() {
              d3Service.select(this)
                  .style('fill-opacity', 1.0);

            })
            .each('end', function() {
              d3Service.select(this)
                .style('fill-opacity', 0.0);
              count--;
              if (count === 0 && showAllAtEnd) {
                elements.style('fill-opacity', 1.0);
              }
            });
        } else {
          var elements = layerElement.selectAll('circle')
              .data(data)
              .enter()
              .append('path');

          elements
            .datum(function(d, i) {
              var orig = expressionService.evaluateExpression(origin,
                d, i, additionalContext);
              orig[0] = parseFloat(orig[0]);
              orig[1] = parseFloat(orig[1]);
              var rad = expressionService.evaluateExpression(radius,
                d, i, additionalContext);
              rad = parseFloat(rad);
              var c = circle
                 .origin(orig)
                 .angle(rad)(expressionService.getExpressionContext(
                   d, i, additionalContext));
              c.d = d;
              return c;
            })
            .attr('id', function(d) {
              return d.d.name;
            })
            .attr('class', 'point')
            .attr('d', function(d) { return path(d); });

          self.configureShapeLabel(layer, layerElement,
            data, origin, additionalContext);

          var styleHints = self.applyStylesForShapeLayer(
            layer, elements, additionalContext);

          self.configureTooltip(layer, elements, values, additionalContext);
          self.configureLegend(layer, layerElement,
            styleHints, additionalContext);
        }
      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, additionalContext, handleData);
    },

    /**
     * @ngdoc method
     * @name createCircleObjectsDataLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Create a circle layer.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path element for the projection
     * @param {Object} layer the layer
     * @param {Object} additionalContext the additional context
    */
    createImageObjectsDataLayer: function(svg, path,
        layer, layers, additionalContext) {
      // Experimental - Display image - Not working at the moment
      var origin = expressionService.parseExpression(layer.display.shape.origin);
      // var radius = expressionService.parseExpression(layer.display.shape.radius);

      consoleService.logMessage('info',
        'Creating data layer with identifier "' + layer.id + '"');
      var circle = d3Service.geo.circle();

      var layerElement = this.getLayerElement(svg, layer);

      function handleData(data) {
        layerElement.selectAll('circle')
          .data(data)
          .enter()
          .append('path')
          .datum(function(d, i) {
            return circle.origin(expressionService.evaluateExpression(
              origin, d, i, additionalContext));
          })
          .attr('class', 'point')
          .attr('d', path)
          .append('image')
          //.append('image')
          .attr('xlink:href',function(d){
            console.log('xlink:href');
            //console.log(d.properties.name);
            /*if (d.properties.name =='Rio de Janeiro'){return 'icon_51440.svg'}
            else{
            return ('icon_10684.svg')*/
            return 'http://localhost:9000/scripts/json/icon_51440.svg';
          }/*}*/)
          .attr('height', function(d){
            return '19'
          })
          .attr('width', '29')

          // while adding an image to an svg these are the coordinates i think of the top left
          /*.attr('x', '-14.5')
           .attr('y', '-9.5')*/
          /*.style('opacity', layer.display.shape.opacity)*/;
      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, additionalContext, handleData);
    },

    /**
     * @ngdoc method
     * @name createLineObjectsDataLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Create a line based on an array of coordinates.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path element for the projection
     * @param {Object} layer the layer
     * @param {Object} additionalContext the additional context
    */
    createLineObjectsDataLayer: function(svg, path,
        layer, layers, additionalContext) {
      var layerElement = this.getLayerElement(svg, layer);
      var value = expressionService.parseExpression(layer.display.shape.value);
      var pointValue = expressionService.parseExpression(
        layer.display.shape.pointValue);

      function handleData(data) {
        if (_.isArray(data)) {
          layerElement.selectAll('path')
            .data(data)
            .enter()
            .append('path')
            .datum(function(d, i) {
              var points = expressionService.evaluateExpression(
                value, d, i, additionalContext);
              var coordinates = [];
              _.forEach(points, function(point, i) {
                coordinates.push(expressionService.evaluateExpression(
                  pointValue, point, i, additionalContext));
              });
              return {
                type: 'LineString',
                coordinates: coordinates,
                d: d
              };
            })
            .attr('d', path)
            .style('fill', 'none')
            .style('stroke', layer.styles.lines.stroke)
            .style('stroke-width', layer.styles.lines.strokeWidth);
        } else {
          layerElement.selectAll('path')
            .data(data)
            .enter()
            .append('path')
            .datum(function(d, i) {
              var points = expressionService.evaluateExpression(
                value, d, i, additionalContext);
              var coordinates = [];
              _.forEach(points, function(point, i) {
                coordinates.push(expressionService.evaluateExpression(
                  pointValue, point, i, additionalContext));
              });
              return {
                type: 'LineString',
                coordinates: coordinates,
                d: d
              };
            })
            .attr('d', path)
            .style('fill', 'none')
            .style('stroke', layer.styles.lines.stroke)
            .style('stroke-width', layer.styles.lines.strokeWidth);
        }
      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, additionalContext, handleData);
    },

    /**
     * @ngdoc method
     * @name createPolygonObjectsDataLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Create a polygon based on an array of coordinates.
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path element for the projection
     * @param {Object} layer the layer
     * @param {Object} additionalContext the additional context
    */
    createPolygonObjectsDataLayer: function(svg, path,
        layer, layers, additionalContext) {
      var layerElement = this.getLayerElement(svg, layer);
      var value = expressionService.parseExpression(layer.display.shape.value);
      var pointValue = expressionService.parseExpression(layer.display.shape.pointValue);

      function handleData(data) {
        // TODO: add support for conditional background (threshold, ...)

        layerElement.selectAll('path')
          .data(data)
          .enter()
          .append('path')
          .datum(function(d) {
            var points = value({d: d});
            var coordinates = [];
            _.forEach(points, function(point, i) {
              coordinates.push(expressionService.evaluateExpression(
                pointValue, point, i, additionalContext));
            });

            // Check if the polygon is closed
            if (coordinates.length > 2) {
              if (coordinates[0][0] !== coordinates[1][0] &&
                  coordinates[0][1] !== coordinates[1][1]) {
                // Add a point to close the polygon
                coordinates.push([ coordinates[0][0],
                  coordinates[0][1] ]);
              }
            }
            return {
              type: 'LineString',
              coordinates: coordinates,
              d: d
            };
          })
          .attr('d', path)
          .style('fill', layer.styles.background.fill)
          .style('stroke', layer.styles.lines.stroke)
          .style('stroke-width', layer.styles.lines.strokeWidth);
      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, additionalContext, handleData);
    },

    /**
     * @ngdoc method
     * @name createObjectsDataLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Create a specific layer of type `objects`.
     *
     * The following layer sub kinds are supported:
     *
     * * `circle` - see {@link mapManager.d3.services:layerService.createGraticuleLayer createCircleObjectsDataLayer}
     * * `image` - see {@link mapManager.d3.services:layerService.createImageObjectsDataLayer createImageObjectsDataLayer}
     * * `line` - see {@link mapManager.d3.services:layerService.createLineObjectsDataLayer createLineObjectsDataLayer}
     * * `polygon` - see {@link mapManager.d3.services:layerService.createPolygonObjectsDataLayer createPolygonObjectsDataLayer}
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path element for the projection
     * @param {Object} layer the layer
     * @param {Object} additionalContext the additional context
    */
    createObjectsDataLayer: function(svg, path,
        layer, layers, additionalContext) {
      if (layer.display.shape) {
        if (layer.display.shape.type === 'circle') {
          this.createCircleObjectsDataLayer(svg, path,
            layer, layers, additionalContext);
        } else if (layer.display.shape.type === 'image') {
          this.createImageObjectsDataLayer(svg, path,
            layer, layers, additionalContext);
        } else if (layer.display.shape.type === 'line') {
          this.createLineObjectsDataLayer(svg, path,
            layer, layers, additionalContext);
        } else if (layer.display.shape.type === 'polygon') {
          this.createPolygonObjectsDataLayer(svg, path,
            layer, layers, additionalContext);
        }
      }
    },

    /**
     * @ngdoc method
     * @name createLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Create a specific layer.
     *
     * The following layer kinds are supported:
     *
     * * `graticule` - see {@link mapManager.d3.services:layerService.createGraticuleLayer createGraticuleLayer}
     * * `geodata` - see {@link mapManager.d3.services:layerService.createGeoDataLayer createGeoDataLayer}
     * * `fill` - see {@link mapManager.d3.services:layerService.createFillDataLayer createFillDataLayer}
     * * `objects` - see {@link mapManager.d3.services:layerService.createObjectsDataLayer createObjectsDataLayer}
     *
     * @param {Object} svg the global SVG element
     * @param {Object} path the path element for the projection
     * @param {Object} layer the layer
     * @param {Object} additionalContext the additional context
    */
    createLayer: function(svg, path, layer, layers, additionalContext) {
      consoleService.logMessage('info', 'Creating layer of type "' +
        layer.type + '" with identifier "' + layer.id + '"');

      if (layer.type === 'graticule') {
        console.log('>> create graticule layer');
        this.createGraticuleLayer(svg, path, layer, layers, additionalContext);
      } else if (layer.type === 'data' && layer.mode === 'objects') {
        console.log('>> create data objects layer');
        this.createObjectsDataLayer(svg, path, layer, layers, additionalContext);
      } else if (layer.type === 'data' && layer.mode === 'fill') {
        console.log('>> create data fill layer');
        this.createFillDataLayer(svg, layer, layers, additionalContext);
      } else if (layer.type === 'geodata') {
        console.log('>> create geodata layer');
        this.createGeoDataLayer(svg, path, layer, layers, additionalContext);
      }
    },

    // End objects layer

    /**
     * @ngdoc method
     * @name isLayerWithFillMode
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Check if a layer is of kind `fill`.
     *
     * @param {Object} layer the layer
    */
    isLayerWithFillMode: function(layer) {
      return (layer.type === 'data' && layer.mode === 'fill');
    },

    /**
     * @ngdoc method
     * @name deleteLayer
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Delete a layer. This corresponds to remove the layer elements
     * under the root layer element. This element still remains because
     * of layer ordering issue.
     *
     * In the case of a layer of kind `fill`, the layer it's applied on
     * is simply reinitialize / reloaded using the method
     * {@link mapManager.d3.services:layerService.clearFillDataLayer clearFillDataLayer}
     *
     * @param {Object} svg the global SVG eletoggleLayerApplyingment
     * @param {Object} path the path element for the projection
     * @param {Object} layer the layer
    */
    deleteLayer: function(svg, path, layer) {
      consoleService.logMessage('info', 'Deleting layer of type "' +
        layer.type + '" with identifier "' + layer.id + '"');

      // Remove layer
      var currentMapId = currentMapService.getCurrentMapId();
      var layerElement = d3Service.select('#' +
        currentMapId + '-' + layer.id);
      if (this.isLayerWithFillMode(layer)) {
        this.clearFillDataLayer(svg, layer);
      } else {
        layerElement.selectAll('*').remove();
      }

      // Remove legend and tooltip if any
      var allLayersElement = d3Service.select('#map1-layers');
      allLayersElement.selectAll('g.legend').remove();
      d3Service.select(document.getElementById(
        'tooltip-' + layer.id)).remove();
    },

    /**
     * @ngdoc method
     * @name sortLayers
     * @methodOf mapManager.d3.services:layerService
     * @description
     * Sort layer elements within the SVG content using the D3 method `sort`.
     *
     * @param {Object} layers the layers
    */
    sortLayers: function(layers) {
      var layerElts = d3Service.select(document.getElementById('layers'));
      layerElts.selectAll('g').sort(function(layerElt1, layerElt2) {
        var layer1 = _.find(layers, { id: layerElt1.attr('id')});
        var layer2 = _.find(layers, { id: layerElt2.attr('id')});
        return layer1.rank - layer2.rank;
      });
    }
  };
});