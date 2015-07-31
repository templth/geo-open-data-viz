'use strict';

/*function interpolatedProjection(a, b) {
  function raw(λ, φ) {
    var pa = a([λ *= 180 / Math.PI, φ *= 180 / Math.PI]);
    var pb = b([λ, φ]);
    return [(1 - α) * pa[0] + α * pb[0], (α - 1) * pa[1] - α * pb[1]];
  }

  var projection = d3.geo.projection(raw).scale(1);
  var center = projection.center;
  var translate = projection.translate;
  var α;

  projection.alpha = function(_) {
    if (!arguments.length) {
      return α;
    }

    α = +_;
    var ca = a.center();
    var cb = b.center();
    var ta = a.translate();
    var tb = b.translate();
    center([(1 - α) * ca[0] + α * cb[0], (1 - α) * ca[1] + α * cb[1]]);
    translate([(1 - α) * ta[0] + α * tb[0], (1 - α) * ta[1] + α * tb[1]]);
    return projection;
  };

  delete projection.scale;
  delete projection.translate;
  delete projection.center;
  return projection.alpha(0);
}*/

// Utility function for moving (from http://bl.ocks.org/patricksurry/5721459)

function trackballAngles(projection, pt) {
  var r = projection.scale();
  var c = projection.translate();
  var x = pt[0] - c[0];
  var y = -(pt[1] - c[1]);
  var ss = x * x + y * y;

  var z = r * r > 2 * ss ? Math.sqrt(r * r - ss) : r * r / 2 / Math.sqrt(ss);

  var lambda = Math.atan2(x, z) * 180 / Math.PI;
  var phi = Math.atan2(y, z) * 180 / Math.PI;
  return [lambda, phi];
}

function composedRotation(λ, ϕ, γ, δλ, δϕ) {
  var γ_, ϕ_, λ_;
  λ = Math.PI / 180 * λ;
  ϕ = Math.PI / 180 * ϕ;
  γ = Math.PI / 180 * γ;
  δλ = Math.PI / 180 * δλ;
  δϕ = Math.PI / 180 * δϕ;

  var sλ = Math.sin(λ);
  var sϕ = Math.sin(ϕ);
  var sγ = Math.sin(γ);
  var sδλ = Math.sin(δλ);
  var sδϕ = Math.sin(δϕ);
  var cλ = Math.cos(λ);
  var cϕ = Math.cos(ϕ);
  var cγ = Math.cos(γ);
  var cδλ = Math.cos(δλ);
  var cδϕ = Math.cos(δϕ);

  var m00 = -sδλ * sλ * cϕ + (sγ * sλ * sϕ + cγ * cλ) * cδλ;
  var m01 = -sγ * cδλ * cϕ - sδλ * sϕ;
  // var m02 = sδλ * cλ * cϕ - (sγ * sϕ * cλ - sλ * cγ) * cδλ;
  var m10 = -sδϕ * sλ * cδλ * cϕ - (sγ * sλ * sϕ + cγ * cλ) * sδλ * sδϕ -
    (sλ * sϕ * cγ - sγ * cλ) * cδϕ;
  var m11 = sδλ * sδϕ * sγ * cϕ - sδϕ * sϕ * cδλ + cδϕ * cγ * cϕ;
  // var m12 = sδϕ * cδλ * cλ * cϕ + (sγ * sϕ * cλ - sλ * cγ) * sδλ * sδϕ +
  //  (sϕ * cγ * cλ + sγ * sλ) * cδϕ;
  var m20 = -sλ * cδλ * cδϕ * cϕ - (sγ * sλ * sϕ + cγ * cλ) * sδλ * cδϕ +
    (sλ * sϕ * cγ - sγ * cλ) * sδϕ;
  var m21 = sδλ * sγ * cδϕ * cϕ - sδϕ * cγ * cϕ - sϕ * cδλ * cδϕ;
  var m22 = cδλ * cδϕ * cλ * cϕ + (sγ * sϕ * cλ - sλ * cγ) * sδλ * cδϕ -
    (sϕ * cγ * cλ + sγ * sλ) * sδϕ;

  if (m01 !== 0 || m11 !== 0) {
    γ_ = Math.atan2(-m01, m11);
    ϕ_ = Math.atan2(-m21, Math.sin(γ_) === 0 ?
      m11 / Math.cos(γ_) : -m01 / Math.sin(γ_));
    λ_ = Math.atan2(-m20, m22);
  } else {
    γ_ = Math.atan2(m10, m00) - m21 * λ;
    ϕ_ = -m21 * Math.PI / 2;
    λ_ = λ;
  }

  return ([λ_ * 180 / Math.PI, ϕ_ * 180 / Math.PI, γ_ * 180 / Math.PI]);
}

// Utility function to update map

function getLoadFunction(type) {
  var loadFct = null;
  if (type === 'json' || type === 'topojson') {
    loadFct = d3.json;
  } else if (type === 'csv') {
    loadFct = d3.csv;
  } else if (type === 'tsv') {
    loadFct = d3.tsv;
  }
  return loadFct;
}

// Service

angular.module('mapManager.d3.services')

// Layer service

/**
 * @ngdoc service
 * @name mapManager.d3.services:layerService
 * @description
 * Provide functions to create and manipulate layers of maps.
 */
.service('layerService', [ '$parse', 'currentMapService',
    'consoleService', 'valueChecker',
    function($parse, currentMapService, consoleService, valueChecker) {
  return {
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
      var layerElement = d3.select(document.getElementById(layer.id));
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
      var layerElement = d3.select(document.getElementById(layer.id));
      if (layerElement.empty()) {
        var sel = d3.select(document.getElementById(layer.applyOn));
        if (valueChecker.isNull(sel)) {
          sel = svg;
        }

        layerElement = sel.append('g')
            .attr('id', layer.id);
      }

      return layerElement;
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
    loadDataForLayer: function(layerData, handleData) {
      if (layerData.loaded) {
        handleData(layerData.content);
      } else if (valueChecker.isNotNullAndNotEmpty(layerData.inline)) {
        var data = $parse(layerData.inline);
        handleData(data());
      } else {
        var loadFct = getLoadFunction(layerData.type);
        loadFct(layerData.url, handleData);
      }
    },

    // Tooltips

    createTooltipEvents: function(elements, values, tooltipDiv,
        tooltipText, showEvent, hideEvent) {
      // Show tooltip
      if (showEvent === 'click') {
        elements.on('click', function(d) {
          //d3.select(this).transition().duration(300).style('opacity', 1);
          // TODO: enlighten borders rather
          tooltipDiv.transition().duration(300)
             .style('opacity', 1);
          tooltipDiv.html(function() {
            // Workaround for circle shape where the data object is embedded
            // within the generated geo path. See method createCircleObjectsDataLayer
            // for more details
            if (valueChecker.isNotNull(d.d)) {
              return tooltipText({d: d.d, value: values[d.d.id]});
            } else {
              return tooltipText({d: d, value: values[d.id]});
            }
          })
             .style('left', (d3.event.pageX) + 'px')
             .style('top', (d3.event.pageY - 30) + 'px');
        });
      } else if (showEvent === 'mouseOver') {
        elements.on('mouseover', function(d) {
          console.log('mouseover');
          // TODO: enlighten borders rather
          //d3.select(this).transition().duration(300).style('opacity', 1);
          tooltipDiv.transition().duration(300)
             .style('opacity', 1);
          tooltipDiv.text(function() {
            return tooltipText({d: d, value: values[d.id]});
          })
             .style('left', (d3.event.pageX) + 'px')
             .style('top', (d3.event.pageY - 30) + 'px');
        });
      }

      // Hide tooltip
      if (hideEvent === 'mouseOut') {
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
     * @param {Object} layer the layer
    */
    createGraticuleLayer: function(svg, path, layer) {
      consoleService.logMessage('info',
        'Creating graticule layer with identifier "' + layer.id + '"');
      if (layer.id === null) {
        layer.id = 'graticuleLayer';
      }

      var layerElement = this.getLayerElement(svg, layer);

      var graticule = d3.geo.graticule();

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

    createGeoDataLayer: function(svg, path, layer) {
      var layerElement = this.getLayerElement(svg, layer);

      function handleData(data) {
        var pathElements = null;
        if (layer.data.mesh) {
          pathElements = layerElement.append('path')
            .datum(topojson.mesh(data,
              data.objects[layer.data.rootObject],
              function(a, b) { return a.id !== b.id; }));

          if (valueChecker.isNotNull(layer.styles.lines)) {
            var stroke = '#fff';
            var strokeWidth = '0.5px';
            var strokeOpacity = '0.5';
            if (layer.styles.lines.stroke != null) {
              stroke = layer.styles.lines.stroke;
            }
            if (layer.styles.lines.strokeWidth != null) {
              strokeWidth = layer.styles.lines.strokeWidth;
            }
            if (layer.styles.lines.strokeOpacity != null) {
              strokeOpacity = layer.styles.lines.strokeOpacity;
            }

            pathElements.style('fill', 'none');
            pathElements.style('stroke', stroke);
            pathElements.style('stroke-width', strokeWidth);
            pathElements.style('stroke-opacity', strokeOpacity);
          }

          pathElements
            .attr('d', path);
          if (layer.styles.d != null) {
            var dStrokeWidth = '1.5px';
            if (layer.styles.d.strokeWidth != null) {
              dStrokeWidth = layer.styles.d.strokeWidth;
            }
            pathElements.style('stroke-width', dStrokeWidth);
          }
        } else {
          pathElements = layerElement.selectAll('path')
            .data(topojson.feature(data,
              data.objects[layer.data.rootObject]).features)
          .enter()
          .append('path')
          .attr('id', function(d) { return d.id; })
          .attr('d', path);
        }

        if (!_.isUndefined(layer.behavior) &&
            !_.isNull(layer.behavior) &&
            !_.isUndefined(layer.behavior.zoomBoundingBox) &&
            !_.isNull(layer.behavior.zoomBoundingBox)) {
          // See http://bl.ocks.org/mbostock/4699541
          pathElements.on('click', function(d) {
            // TODO: make things generic
            var width = 938;
            var height = 500;

            var bounds = path.bounds(d);
            var dx = bounds[1][0] - bounds[0][0];
            var dy = bounds[1][1] - bounds[0][1];
            var x = (bounds[0][0] + bounds[1][0]) / 2;
            var y = (bounds[0][1] + bounds[1][1]) / 2;
            var scale = 0.9 / Math.max(dx / width, dy / height);
            var translate = [width / 2 - scale * x, height / 2 - scale * y];

            g.transition()
             .duration(750)
             //.style("stroke-width", 1.5 / scale + "px")
             .attr('transform', 'translate(' + translate +
               ')scale(' + scale + ')');
          });
        }
      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, handleData);
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
      var sel = d3.select(document.getElementById(layer.applyOn));
      sel.selectAll('path')
         .style('fill', function(d) {
        return '#000';
      });
      // TODO: the layer applied on should be reloaded
      // refreshLayerApplying
    },

    createFillDataLayer: function(svg, layer) {
      var self = this;
      var value = $parse(layer.display.fill.value);

      function handleData(data) {
        //console.log('>> data = '+JSON.stringify(data));
        var values = {};
        _.forEach(data, function(d) { values[d.id] = +value({d: d}); });

        var sel = d3.select(document.getElementById(layer.applyOn));

        if (layer.display.fill.threshold != null) {
          var color = d3.scale.threshold()
            .domain(layer.display.fill.threshold.values)
            .range(layer.display.fill.threshold.colors);

          var elements = sel.selectAll('path')
              .style('fill', function(d) {
            return color(values[d.id]);
          });
        } else if (layer.display.fill.choropleth != null) {
          var color = d3.scale.quantize()
            .domain(layer.display.fill.choropleth.values)
            .range(layer.display.fill.choropleth.colors);

          var elements = sel.selectAll('path')
              .style('fill', function(d) {
            return color(values[d.id]);
          });
        } else if (layer.display.fill.categorical != null) {
          // See https://github.com/mbostock/d3/wiki/Ordinal-Scales#category10
          console.log('>> categorical');
          var color = d3.scale.category20();
          var sel = d3.select(document.getElementById(layer.applyOn));
          var elements = sel.selectAll('path')
              .style('fill', function(d) {
            //return color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0);
            console.log('>> d.id = '+values[d.id].color);
            return color(values[d.id].color);
          });
        }

        // Experimental: display tooltip

        if (layer.display.tooltip && layer.display.tooltip.enabled) {
          var tooltipText = $parse(layer.display.tooltip.text);

          var tooltipDiv = d3.select('body').append('div')
            .attr('id', 'tooltip-' + layer.id)
            .attr('class', 'tooltip')
            .style('opacity', 0);

          // Events
          if (layer.behavior.tooltip.display != null) {
            var showTooltipEvent = layer.behavior.tooltip.display;
            var hideTooltipEvent = layer.behavior.tooltip.hide;

            self.createTooltipEvents(elements, values, tooltipDiv,
                    tooltipText, showTooltipEvent, hideTooltipEvent);
          }
        }

        // Experimental: display axis

        if (layer.display.legend && layer.display.legend.enabled) {
          var legendLabel = $parse(layer.display.legend.label);

          var height = 500;
          var legend = sel.selectAll('g.legend')
            .data(layer.display.fill.threshold.values)
            .enter()
            .append('g')
            .attr('class', 'legend');

          var ls_w = 20, ls_h = 20;

          legend.append('rect')
            .attr('x', 20)
            .attr('y', function(d, i){ return height - (i*ls_h) - 2*ls_h;})
            .attr('width', ls_w)
            .attr('height', ls_h)
            .style('fill', function(d, i) { return color(d); })
            .style('opacity', 0.8);

          legend.append('text')
            .attr('x', 50)
            .attr('y', function(d, i){ return height - (i*ls_h) - ls_h - 4;})
            .text(function(d, i) {
              return legendLabel({d: d, i: i});
            });
            /*function(d, i) {
              console.log('d = '+JSON.stringify(d));
              if (d < 0.1) {
                return '' + (d * 100) + ' %';
              } else {
                return (d * 100) + ' %';
              }
            });*/
        }

        // End Experimental: display axis
      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, handleData);
    },

    // End fill layer

    // Objects layer

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
    */
    createCircleObjectsDataLayer: function(svg, path, layer) {
      var self = this;
      var origin = $parse(layer.display.shape.origin);
      var radius = $parse(layer.display.shape.radius);

      consoleService.logMessage('info',
        'Creating data layer with identifier "' + layer.id + '"');
      var circle = d3.geo.circle();

      var layerElement = this.getLayerElement(svg, layer);

      function handleData(data) {
        if (layer.data.where != null) {
          var dataWhere = $parse(layer.data.where);
          data = _.filter(data, function(d) {
            return dataWhere({d: d});
          });
        }

        if (layer.data.order != null && layer.data.order.field) {
          var field = layer.data.order.field;
          var order = layer.data.order ? layer.data.order : true;
          data = data.sort(function(a, b) {
            if (order.ascending) {
              return a[field] - b[field];
            } else {
              return b[field] - a[field];
            }
          });
        }

        var idName = layer.data.id ? layer.data.id : 'id';

        var values = {};
        _.forEach(data, function(d) { values[d[idName]] = d; });

        var sel = d3.select(document.getElementById(layer.applyOn));

        var elements = layerElement.selectAll('circle')
          .data(data)
          .enter()
          .append('path')
          .datum(function(d) {
            var orig = origin({d: d});
            orig[0] = parseFloat(orig[0]);
            orig[1] = parseFloat(orig[1]);
            var rad = radius({d: d});
            rad = parseFloat(rad);
            var c = circle
               .origin(orig)
               .angle(rad)({d: d});
            // console.log('circle = '+JSON.stringify(c));
            c.d = d;
            return c;
          })
          .attr('id', function(d) {
            return d.d.name;
          })
          .attr('class', 'point')
          .attr('d', function(d) { return path(d); })
          .style('opacity', layer.display.shape.opacity);

        if (layer.display.shape.color != null) {
          elements.style('fill', layer.display.shape.color)
        } else if (layer.display.shape.threshold != null) {
          var color = d3.scale.threshold()
            .domain(layer.display.shape.threshold.values)
            .range(layer.display.shape.threshold.colors);

          var value = $parse(layer.display.shape.value);

          elements.style('fill', function(d) {
            var val = value({
              d: d.d,
              parseDate: function(val) {
                return new Date(val);
              }
            });
            return color(parseFloat(val));
          });
        }

        if (layer.display.tooltip && layer.display.tooltip.enabled) {
          var tooltipText = $parse(layer.display.tooltip.text);

          var tooltipDiv = d3.select('body').append('div')
            .attr('id', 'tooltip-' + layer.id)
            .attr('class', 'tooltip')
            .style('opacity', 0);

          // Events
          if (layer.behavior.tooltip.display != null) {
            if (layer.behavior.tooltip.display === 'always') {
            } else {
              var showTooltipEvent = layer.behavior.tooltip.display;
              var hideTooltipEvent = layer.behavior.tooltip.hide;

              self.createTooltipEvents(elements, values, tooltipDiv,
                    tooltipText, showTooltipEvent, hideTooltipEvent);
            }
          }
        }

        if (layer.display.legend && layer.display.legend.enabled) {
          var legendLabel = $parse(layer.display.legend.label);

          var height = 500;
          var legend = sel.selectAll('g.legend')
            .data(layer.display.shape.threshold.values)
            .enter()
            .append('g')
            .attr('class', 'legend');

          var ls_w = 20, ls_h = 20;

          legend.append('rect')
            .attr('x', 20)
            .attr('y', function(d, i){ return height - (i*ls_h) - 2*ls_h;})
            .attr('width', ls_w)
            .attr('height', ls_h)
            .style('fill', function(d, i) { return color(d); })
            .style('opacity', 0.8);

          legend.append('text')
            .attr('x', 50)
            .attr('y', function(d, i){ return height - (i*ls_h) - ls_h - 4;})
            .text(function(d, i) {
              return legendLabel({d: d, i: i});
            });
            /*function(d, i) {
              console.log('d = '+JSON.stringify(d));
              if (d < 0.1) {
                return '' + (d * 100) + ' %';
              } else {
                return (d * 100) + ' %';
              }
            });*/
        }

      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, handleData);
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
    */
    createImageObjectsDataLayer: function(svg, path, layer) {
      // Experimental - Display image - Not working at the moment
      var origin = $parse(layer.display.shape.origin);
      // var radius = $parse(layer.display.shape.radius);

      consoleService.logMessage('info',
        'Creating data layer with identifier "' + layer.id + '"');
      var circle = d3.geo.circle();

      var layerElement = this.getLayerElement(svg, layer);

      function handleData(data) {
        layerElement.selectAll('circle')
          .data(data)
          .enter()
          .append('path')
          .datum(function(d) {
            console.log('layer.display.shape.origin = '+layer.display.shape.origin);
            return circle.origin(origin({d: d}));
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
            return 'http://bl.ocks.org/mpmckenna8/raw/b87df1c44243aa1575cb/icon_51440.svg';
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
      this.loadDataForLayer(layer.data, handleData);
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
    */
    createLineObjectsDataLayer: function(svg, path, layer) {
      var layerElement = this.getLayerElement(svg, layer);
      var value = $parse(layer.display.shape.value);
      var pointValue = $parse(layer.display.shape.pointValue);

      function handleData(data) {
        layerElement.selectAll('path')
          .data(data)
          .enter()
          .append('path')
          .datum(function(d) {
            var points = value({d: d});
            var coordinates = [];
            _.forEach(points, function(point) {
              coordinates.push(pointValue({d: point}));
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

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, handleData);
    },

    createPolygonObjectsDataLayer: function(svg, path, layer) {
      var layerElement = this.getLayerElement(svg, layer);

      function handleData(data) {
        //The data for our line
        var lineData = [ {lon: 40.71455, lat: -74.007124}, 
                    {lon: 34.05349, lat: -118.245323}, 
                    {lon: 45.37399, lat: -92.888759}, 
                    {lon: 41.337462, lat: -75.733627}
                ];
                 /*[ { x: 1, y: 5},  { x: 20, y: 20},
                 { x: 40, y: 10}, { x: 60, y: 40},
                 { x: 80, y: 5},  { x: 100, y: 60} ];*/

        //This is the accessor function we talked about above
        var projection = currentMapService.currentMapContext.projection;
        var lineFunction = d3.svg.line()
                         .x(function(d) { console.log('d = '+JSON.stringify(d)); return projection([d.lon, d.lat])[0]/*d.lon*/; })
                         .y(function(d) { console.log('d = '+JSON.stringify(d)); return projection([d.lon, d.lat])[1]/*d.lat*/; })
                         .interpolate('linear');

var places = {
  HNL: [-157,9225, 21,318611111],
  HKG: [113,914722222, 22,308888889],
  SVO: [37,414722222, 55,972777778],
  HAV: [-82,409166667, 22,989166667],
  CCS: [-66,990555556, 10,603055556],
  UIO: [-78,358611111, 0,113333333],
  NY: [ -74.007124, 40.71455 ],
  LA: [ -118.245323, 34.05349 ],
  CO: [ -92.888759, 45.37399 ]
  /*HNL: projection([40.71455, -74.007124]),
  HKG: projection([34.05349,  -118.245323]),
  SVO: projection([45.37399, -92.888759]),
  HAV: projection([41.337462, -75.733627])/*,
  CCS: [-66 - 59 / 60 - 26 / 3600, 10 + 36 / 60 + 11 / 3600],
  UIO: [-78 - 21 / 60 - 31 / 3600, 0 + 06 / 60 + 48 / 3600]*/
};

// #1
var route = {
  // type: "MultiLineString",
  type: "LineString",
  coordinates: [
    places.NY,
    places.LA,
    places.CO,
    places.SVO/*,
    places.NY*/
  ]
};

var line = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; });

layerElement.append("path")
    .datum(route)
    .attr("class", "route")
    .attr("d", path)
    .style('fill', 'none')
    //.style('fill', 'red')
    .style('opacity', '0.5')
    .style('stroke', 'red')
    .style('stroke-width', '1px');

// #2
/*var line = d3.svg.line()
            .x(function(d) { console.log('>> line.x = '+d[0]); return projection(d)[0]; })
            .y(function(d) { console.log('>> line.x = '+d[1]); return projection(d)[1]; });
layerElement.append("path").datum([places.NY,
    places.LA]).attr("d", line)
    .style('fill', 'red')
    .style('opacity', '0.5')
    .style('stroke', 'red')
    .style('stroke-width', '3px');*/

// #3
/*layerElement.append("polygon")
    .attr("points", function() {
      return [ places.NY,
      places.LA, places.CO ].map(function(d) { return d.join(","); }).join(" ");
    })
    .style('fill', 'none')
    .style('opacity', '0.5')
    .style('stroke', 'red')
    .style('stroke-width', '3px');*/


        /*console.log('data = '+JSON.stringify(data));
        layerElement.selectAll('path')
          .data(data)
          .enter()
          .append('d') //, lineFunction(lineData))*/
          /*                  .datum(function(d) {
            console.log('1');
            var orig = [ d.lon, d.lat ]; //origin({d: d});
            orig[0] = parseFloat(orig[0]);
            orig[1] = parseFloat(orig[1]);
            //var rad = radius({d: d});
            //rad = parseFloat(rad);
            //var c = circle
            //   .origin(orig)
            //   .angle(rad)({d: d});
            var c = { type: 'Polyline', coordinates: [ _.map(lineData, function(ld) { return [ld.lon, ld.lat]; })] };
            c.d = d;
            console.log('c = '+JSON.stringify(c));
            return c;
          })*/
          //                  .attr('d', function(d) { console.log('d = '+JSON.stringify(d)); return path(d); })
          /*.attr('d', lineFunction(lineData))
                            .attr("stroke", "red")
                            .attr("stroke-width", 200)
                            .attr("fill", "none");*/

      }

      // Actually create the layer based on provided data
      this.loadDataForLayer(layer.data, handleData);
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
    */
    createObjectsDataLayer: function(svg, path, layer) {
      if (layer.display.shape) {
        if (layer.display.shape.type === 'circle') {
          this.createCircleObjectsDataLayer(svg, path, layer);
        } else if (layer.display.shape.type === 'image') {
          this.createImageObjectsDataLayer(svg, path, layer);
        } else if (layer.display.shape.type === 'line') {
          this.createLineObjectsDataLayer(svg, path, layer);
        } else if (layer.display.shape.type === 'polygon') {
          this.createPolygonObjectsDataLayer(svg, path, layer);
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
    */
    createLayer: function(svg, path, layer) {
      consoleService.logMessage('info', 'Creating layer of type "' +
        layer.type + '" with identifier "' + layer.id + '"');

      if (layer.type === 'graticule') {
        this.createGraticuleLayer(svg, path, layer);
      } else if (layer.type === 'data' && layer.mode === 'objects') {
        this.createObjectsDataLayer(svg, path, layer);
      } else if (layer.type === 'data' && layer.mode === 'fill') {
        this.createFillDataLayer(svg, layer);
      } else if (layer.type === 'geodata') {
        this.createGeoDataLayer(svg, path, layer);
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
     * @param {Object} svg the global SVG element
     * @param {Object} path the path element for the projection
     * @param {Object} layer the layer
    */
    deleteLayer: function(svg, path, layer) {
      consoleService.logMessage('info', 'Deleting layer of type "' +
        layer.type + '" with identifier "' + layer.id + '"');

      // Remove layer
      var layerElement = d3.select(document.getElementById(layer.id));
      if (this.isLayerWithFillMode(layer)) {
        this.clearFillDataLayer(svg, layer);
      } else {
        layerElement.selectAll('*').remove();
      }

      // Remove legend and tooltip if any
      var allLayersElement = d3.select(document.getElementById('layers'));
      allLayersElement.selectAll('g.legend').remove();
      d3.select(document.getElementById(
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
      var layerElts = d3.select(document.getElementById('layers'));
      layerElts.selectAll('g').sort(function(layerElt1, layerElt2) {
        var layer1 = _.find(layers, { id: layerElt1.attr('id')});
        var layer2 = _.find(layers, { id: layerElt2.attr('id')});
        return layer1.rank - layer2.rank;
      });
    }
  };
}]);