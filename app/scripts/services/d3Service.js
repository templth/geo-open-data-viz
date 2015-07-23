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

function updateMapElements(projection, mapElements) {
  function cxFct(d) {
    if (d != null) {
      return projection([d.lon, d.lat])[0];
    } else {
      return projection([0, 0])[0];
    }
  }

  function cyFct(d) {
    if (d != null) {
      return projection([d.lon, d.lat])[1];
    } else {
      return projection([0, 0])[1];
    }
  }

  for (var i = 0; i < mapElements.length; i++) {
    var mapElement = mapElements[i];
    if (mapElement.type === 'path') {
      var path = d3.geo.path().projection(projection);
      d3.selectAll('path').attr('d', path);
    } else if (mapElement.type === 'circle') {
      d3.selectAll('circle').attr('cx', cxFct)
      .attr('cy', cyFct);
    }
  }
}

function getLoadFunction(type) {
  var loadFct = null;
  if (type === 'json') {
    loadFct = d3.json;
  } else if (type === 'csv') {
    loadFct = d3.csv;
  } else if (type === 'tsv') {
    loadFct = d3.tsv;
  }
  return loadFct;
}

// Service

angular.module('mapManager.d3.services', [
  'mapManager.map', 'mapManager.console' ])

// Map creator service

.service('mapCreatorService', [ 'currentMapService', 'mapInteractionService',
    'layerService', 'projectionService', function(currentMapService,
      mapInteractionService, layerService, projectionService) {
  return {
    refreshMap: function(element) {
      console.log('refreshmap');
      if (currentMapService.currentMapContext.svg != null) {
        console.log('remove svg');
        currentMapService.currentMapContext.svg.remove();
      }

      this.createMap(element);
    },

    createMap: function(element) {
      var mWidth = element.width();
      var width = 938;
      var height = 500;

      var projection = projectionService.createProjection(
        currentMapService.currentMap.projection,
          {width: width, height: height});
      if (projection != null && currentMapService.currentMap.scale != null) {
        projection.scale(currentMapService.currentMap.scale);
      }
      var path = projectionService.configurePathWithProjection(projection);

      var svg = d3.select(element[0]).append('svg')
          .attr('preserveAspectRatio', 'xMidYMid')
          .attr('viewBox', '0 0 ' + width + ' ' + height)
          .attr('width', mWidth)
          .attr('height', mWidth * height / width);

      svg.append('rect')
          .attr('class', 'background')
          .attr('width', width)
          .attr('height', height);

      var g = svg.append('g').attr('id', 'layers');

      // Save current map context
      currentMapService.currentMapContext.svg = svg;
      currentMapService.currentMapContext.path = path;
      currentMapService.currentMapContext.projection = projection;
      currentMapService.currentMapContext.layers = g;

      // Preload data
      // TODO

      // Create layers
      var layers = currentMapService.currentMap.layers;
      _.forEach(layers, function(layer) {
        if (layer.applied) {
          layerService.createLayer(svg, path, layer);
        }
      });

      // Sort layers by rank
      //layerService.sortLayers(layers);

      // Clear preloaded data
      // TODO

      mapInteractionService.configureMoving(svg, 'mouseMove', {
        type: currentMapService.currentMap.projection, raw: projection
      }, [ {type: 'path'}, {type: 'circle'}]);
      // this.configureMapResize(scope, element);
      mapInteractionService.configureZooming(svg, 'mouseWheel', {
        type: currentMapService.currentMap.projection, raw: projection}, {
        width: '', height: ''
      }, [{type: 'path'}, {type: 'circle'}]);

    },

    updateProjection: function(newProjection) {
      currentMapService.currentMap.projection = newProjection;
      this.refreshMap(currentMapService.currentMap.element);
    },

    updateScale: function(newScale) {
      console.log('>> updateScale = '+newScale);
      currentMapService.currentMap.scale = newScale;
      this.refreshMap(currentMapService.currentMap.element);
    }
  };
}])

// Projection service

.service('projectionService', [ function() {
  return {
    createMercatorProjection: function(configuration) {
      var projection = d3.geo.mercator()
          //.scale(150)
          .translate([configuration.width / 2, configuration.height / 1.5]);
      return projection;
    },

    createOrthographicProjection: function(/*configuration*/) {
        var projection = d3.geo.orthographic()
          .scale(248)
          .clipAngle(90);

        return projection;
      },

    createProjection: function(projectionType, configuration) {
      var projection = null;
      // Create projection
      if (projectionType === 'orthographic') {
        projection = this.createOrthographicProjection(configuration);
      } else if (projectionType === 'mercator') {
        projection = this.createMercatorProjection(configuration);
      }
      return projection;
    },

    configurePathWithProjection: function(projection, path) {
      // Return path
      if (path == null) {
        path = d3.geo.path();
      }

      if (projection != null) {
        return path.projection(projection);
      }
      return path;
    }
  };
}])

// Layer service

.service('layerService', [ '$parse', 'currentMapService', 'consoleService',
    function($parse, currentMapService, consoleService) {
  return {
    toggleLayerVisibility: function(layer) {
      if (layer.mode === 'fill') {
        if (layer.visible) {
          var sel = d3.select(document.getElementById(layer.applyOn));
          sel.selectAll('path')
            .style('fill', '#000');
        } else {
          this.createFillDataLayer(layer);
        }
      } else {
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
      }
    },

    toggleLayerApplying: function(svg, path, layer) {
      if (layer.applied) {
        var layerElement = d3.select(document.getElementById(layer.id));
        layerElement.selectAll('*').remove();
      } else {
        this.createLayer(svg, path, layer);
      }
    },

    refreshLayerApplying: function(svg, path, layer) {
      if (layer.applied) {
        var layerElement = d3.select(document.getElementById(layer.id));
        layerElement.selectAll('*').remove();
        this.createLayer(svg, path, layer);
      }
    },

    getLayerElement: function(svg, layer) {
      var layerElement = d3.select(document.getElementById(layer.id));
      if (layerElement.empty()) {
        var sel = d3.select(document.getElementById(layer.applyOn));
        if (sel === null) {
          sel = svg;
        }

        layerElement = sel.append('g')
            .attr('id', layer.id);
      }

      return layerElement;
    },

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

    createGeoDataLayer: function(svg, path, layer) {
      var layerElement = this.getLayerElement(svg, layer);

      function handleData(data) {
        if (layer.data.mesh) {
          var pathElements = layerElement.append('path')
            .datum(topojson.mesh(data,
              data.objects[layer.data.rootObject],
              function(a, b) { return a.id !== b.id; }));

          if (layer.styles.lines != null) {
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
            var strokeWidth = '1.5px';
            if (layer.styles.d.strokeWidth != null) {
              strokeWidth = layer.styles.d.strokeWidth;
            }
            pathElements.style('stroke-width', strokeWidth);
          }
        } else {
          layerElement.selectAll('path')
            .data(topojson.feature(data,
              data.objects[layer.data.rootObject]).features)
          .enter()
          .append('path')
          .attr('id', function(d) { return d.id; })
          .attr('d', path);
        }
      }

      if (layer.data.loaded) {
        handleData(layer.data.content);
      } else {
        d3.json(layer.data.url, handleData);
      }
    },

    createFillDataLayer: function(layer) {
      var value = $parse(layer.display.fill.value);

      function handleData(data) {
        //console.log('>> data = '+JSON.stringify(data));
        var values = {};
        data.forEach(function(d) { values[d.id] = +value({d: d}); });

        var color = d3.scale.threshold()
          .domain(layer.display.fill.threshold.values)
          .range(layer.display.fill.threshold.colors);

        var sel = d3.select(document.getElementById(layer.applyOn));
        sel.selectAll('path')
            .style('fill', function(d) {
          return color(values[d.id]);
        });

        // Experimental: display axis

        // A position encoding for the key only.
        /*var x = d3.scale.linear()
                  .domain([0, 1])
                  .range([0, 240]);

        var xAxis = d3.svg.axis()
              .scale(x)
              .orient('bottom')
              .tickSize(13)
              .tickValues(color.domain())
              .tickFormat(function(d) {
          return d;
          // === .5 ? formatPercent(d) : formatNumber(100 * d);
        });

        var svg = mapService.currentMapContext.svg;

        var width = 938;
        var height = 500;

        var g = svg.append('g')
                   .attr('class', 'key')
                  .attr('transform', 'translate(' +
                    (width - 240) / 2 + ',' + height / 2 + ')');

        g.selectAll('rect')
            .data(color.range().map(function(color) {
          var d = color.invertExtent(color);
          if (d[0] === null) {
            d[0] = x.domain()[0];
          }
          if (d[1] === null) {
            d[1] = x.domain()[1];
          }
          return d;
        }))
        .enter().append('rect')
        .attr('height', 8)
        .attr('x', function(d) { return x(d[0]); })
        .attr('width', function(d) { return x(d[1]) - x(d[0]); })
        .style('fill', function(d) { return color(d[0]); });

        g.call(xAxis).append('text')
        .attr('class', 'caption')
        .attr('y', -6)
        .text('Percentage');*/

        // End Experimental: display axis
      }

      if (layer.data.loaded) {
        handleData(layer.data.content);
      } else {
        var loadFct = getLoadFunction(layer.data.type);
        loadFct(layer.data.url, handleData);
      }
    },

    createCircleObjectsDataLayer: function(svg, path, layer) {
      var origin = $parse(layer.display.shape.origin);
      var radius = $parse(layer.display.shape.radius);

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
            return circle
               .origin(origin({d: d}))
               .angle(radius({d: d}))();
          })
          .attr('class', 'point')
          .attr('d', path)
          .style('fill', layer.display.shape.color)
          .style('opacity', layer.display.shape.opacity);
      }

      if (layer.data.loaded) {
        handleData(layer.data.content);
      } else {
        var loadFct = getLoadFunction(layer.data.type);
        loadFct(layer.data.url, handleData);
      }
    },

    createObjectsDataLayer: function(svg, path, layer) {
      if (layer.display.shape) {
        if (layer.display.shape.type === 'circle') {
          this.createCircleObjectsDataLayer(svg, path, layer);
        }
      }
    },

    createLayer: function(svg, path, layer) {
      console.log('createLayer');
      consoleService.logMessage('info', 'Creating layer of type "' +
        layer.type + '" with identifier "' + layer.id + '"');

      if (layer.type === 'graticule') {
        this.createGraticuleLayer(svg, path, layer);
      } else if (layer.type === 'data' && layer.mode === 'objects') {
        this.createObjectsDataLayer(svg, path, layer);
      } else if (layer.type === 'data' && layer.mode === 'fill') {
        this.createFillDataLayer(layer);
      } else if (layer.type === 'geodata') {
        this.createGeoDataLayer(svg, path, layer);
      }
    },

    sortLayers: function(layers) {
      var layerElts = d3.select(document.getElementById('layers'));
      console.log('>> layerElts = '+layerElts.length);
      console.log('>> layerElts = '+layerElts.attr('id'));
      console.log('>> layerElts = '+layerElts.selectAll('g').length);
      console.log('>> layerElts = '+layerElts.selectAll('g').attr('id'));
      layerElts.selectAll('g').sort(function(layerElt1, layerElt2) {
        console.log('layerElt1 = '+layerElt1);
        console.log('layerElt2 = '+layerElt2);
        var layer1 = _.find(layers, { id: layerElt1.attr('id')});
        var layer2 = _.find(layers, { id: layerElt2.attr('id')});
        console.log('layer1 = '+layer1);
        console.log('layer2 = '+layer2);
        return layer1.rank - layer2.rank;
      });
    }
  };
}])

// Map interaction service

.service('mapInteractionService', [ 'consoleService', function(consoleService) {
  return {
    // Moving

    configureMovingWithMouseDragForOrthographicProjection: function(
      svg, projection, mapElements) {
      var m0, o0;
      var drag = d3.behavior.drag()
      .on('dragstart', function() {
        console.log('>> dragstart');
        // Adapted from http://mbostock.github.io/d3/talk/20111018/azimuthal.html
        // and updated for d3 v3
        var proj = projection.rotate();
        m0 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY];
        o0 = [-proj[0], -proj[1]];
      })
      .on('drag', function() {
        console.log('>> dragend');
        if (m0) {
          var m1 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY];
          var o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
          projection.rotate([-o1[0], -o1[1]]);
        }

        // Update the map
        updateMapElements(projection, mapElements);

        console.log('>> drag');
        var scale = projection.scale();
        var clipAngle = projection.clipAngle();

        consoleService.logMessage('debug', 'Updated scale to ' + scale);
        consoleService.logMessage('debug', 'Updated clipAngle to ' + clipAngle);
      });

      svg.call(drag);
    },

    configureMovingWithMouseMoveForOrthographicProjection: function(
      svg, projection, mapElements) {
      var m0 = null;
      var o0;
      var o1;

      function mousedown() {
        // Remember where the mouse was pressed, in canvas coords
        m0 = trackballAngles(projection, d3.mouse(svg[0][0]));
        o0 = projection.rotate();
        d3.event.preventDefault();
      }

      function mousemove() {
        if (m0) {
          var m1 = trackballAngles(projection, d3.mouse(svg[0][0]));
          o1 = composedRotation(o0[0], o0[1], o0[2],
            m1[0] - m0[0], m1[1] - m0[1]);

          projection.rotate(o1);

          // Update the map
          updateMapElements(projection, mapElements);
        }
      }

      function mouseup() {
        if (m0) {
          mousemove();
          m0 = null;
        }
      }

      svg.on('mousedown', mousedown)
         .on('mousemove', mousemove)
         .on('mouseup', mouseup);
    },

    configureMovingForMercatorProjection: function(/*svg, projection, mapElements*/) {
      /*var m0, o0;
      var drag = d3.behavior.drag()
      .on('dragstart', function() {
        console.log('>> dragstart');
        // Adapted from http://mbostock.github.io/d3/talk/20111018/azimuthal.html and updated for d3 v3
        //m0 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY];
        m0 = projection.translate();
      })
      .on('drag', function() {
        console.log('>> dragend');
        if (m0) {
          //var m1 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY];
          var m1 = d3.event.translate;
          projection.translate([m1[0] - m0[0], m1[1] - m0[1]]);
        }
      });

      svg.call(drag);*/
      //svg.attr("transform", "translate(" + d3.event.translate + ")");
    },

    configureMoving: function(svg, moveType, projection, mapElements) {
      if (projection.type === 'orthographic') {
        consoleService.logMessage('info', 'Configuring moving for projection orthographic');
        // Using mouseDown, mouseUp and mouveMove events
        if (moveType === 'mouseMove') {
          consoleService.logMessage('info', 'Selected moving "mouse move"');
          this.configureMovingWithMouseMoveForOrthographicProjection(svg, projection.raw, mapElements);
        // Using drag events
        } else if (moveType === 'mouseDrag') {
          consoleService.logMessage('info', 'Selected moving "mouse drag"');
          this.configureMovingWithMouseDragForOrthographicProjection(svg, projection.raw, mapElements);
	  	}
      } else if (projection.type === 'mercator') {
      	this.configureMovingForMercatorProjection(svg, projection.raw, mapElements);
      }
    },

    // Zooming

    configureZoomingWithMouseWheelForOrthographicProjection: function(svg, projection, dimension, mapElements) {
      // Configure zooming
      var zoom = d3.behavior.zoom()
           //.translate(projection.translate())
           .scale(projection.scale())
           //.saleExtent([dimension.height, 8 * dimension.height])
           .on('zoom', function() {
        consoleService.logMessage('debug', 'Updated scale to ' + zoom.scale());
        projection/*.translate(d3.event.translate)*/.scale(d3.event.scale);
        // Update the map
        updateMapElements(projection, mapElements);
      });

      // Apply zoom behavior
      svg.call(zoom);
    },

    configureZoomingWithMouseWheelForMercatorProjection: function(svg/*, projection, dimension, mapElements*/) {
      // Configure zooming
      var zoom = d3.behavior.zoom()
           /*.translate(projection.translate())
           .scale(projection.scale())*/
           //.scaleExtent([dimension.height, 8 * dimension.height])
           .on('zoom', function() {
        consoleService.logMessage('debug', 'Updated scale to ' + zoom.scale());
        //projection.translate(d3.event.translate).scale(d3.event.scale);
        svg.attr('transform', 'translate(' + 
            d3.event.translate.join(',') + ')scale(' + d3.event.scale + ')');
        // Update the map
        //updateMapElements(projection, mapElements);
      });

      // Apply zoom behavior
      svg.call(zoom);
      svg.call(zoom.event);
    },

    configureDefaultZoomingWithMouseWheel: function(svg) {
      // Configure zooming
      var zoom = d3.behavior.zoom()
           /*.translate(projection.translate())
           .scale(projection.scale())*/
           .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])

           //.scaleExtent([dimension.height, 8 * dimension.height])
           .on('zoom', function() {
        consoleService.logMessage('debug', 'Updated scale to ' + zoom.scale());
        //projection.translate(d3.event.translate).scale(d3.event.scale);
        svg.attr('transform', 'translate(' +
            d3.event.translate.join(',') + ')scale(' + d3.event.scale + ')');
        // Update the map
        //updateMapElements(projection, mapElements);
      });

      // Apply zoom behavior
      svg.call(zoom);
      svg.call(zoom.event);
    },

    configureZooming: function(svg, moveType, projection, dimension, mapElements) {
      if (projection.type === 'orthographic') {
        consoleService.logMessage('info', 'Configuring zooming for projection orthographic');
        // Using mouseDown, mouseUp and mouveMove events
        if (moveType === 'mouseWheel') {
          consoleService.logMessage('info', 'Selected zooming "mouse wheel"');
          this.configureZoomingWithMouseWheelForOrthographicProjection(svg, projection.raw, dimension, mapElements);
	  	}
      } else if (projection.type === 'mercator') {
        consoleService.logMessage('info', 'Configuring zooming for projection mercator');
        // Using mouseDown, mouseUp and mouveMove events
        if (moveType === 'mouseWheel') {
          consoleService.logMessage('info', 'Selected zooming "mouse wheel"');
          this.configureZoomingWithMouseWheelForMercatorProjection(svg, projection.raw, dimension, mapElements);
	  	}
      } else {
        this.configureDefaultZoomingWithMouseWheel(svg);
      }
    }
  };
}]);