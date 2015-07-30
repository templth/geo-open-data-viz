'use strict';

function updateMapElements(projection, mapElements) {
  function cxFct(d) {
    if (!_.isNull(d)) {
      return projection([d.lon, d.lat])[0];
    } else {
      return projection([0, 0])[0];
    }
  }

  function cyFct(d) {
    if (!_.isNull(d)) {
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

angular.module('mapManager.d3.services', [
  'mapManager.map', 'mapManager.console' ])

// Map creator service

.service('mapCreatorService', [ 'currentMapService', 'mapInteractionService',
    'layerService', 'projectionService', function(currentMapService,
      mapInteractionService, layerService, projectionService) {
  return {
    refreshMap: function($scope, element) {
      console.log('refreshmap');
      if (!_.isNull(currentMapService.currentMapContext.svg)) {
        console.log('remove svg');
        currentMapService.currentMapContext.svg.remove();
      }

      this.createMap($scope, element);
    },

    createMap: function($scope, element) {
      var mWidth = element.width();
      var width = 938;
      var height = 500;

      var projection = projectionService.createProjection(
        currentMapService.currentMap.projection,
          {width: width, height: height});

      // Configure scale
      if (!_.isNull(projection) &&
          !_.isNull(currentMapService.currentMap.scale)) {
        projection.scale(currentMapService.currentMap.scale);
      }

      // Configure rotation
      if (!_.isNull(projection) &&
          !_.isNull(currentMapService.currentMap.scale)) {
        projection.rotate([ currentMapService.currentMap.center.lon,
          currentMapService.currentMap.center.lat ]);
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

      var layers = currentMapService.currentMap.layers;

      // Preload data
      // TODO

      // Create layers
      _.forEach(layers, function(layer) {
        if (layer.applied) {
          layerService.createLayer(svg, path, layer);
        }
      });

      // Clear preloaded data
      // TODO

      // Configure moving
      var interactions = currentMapService.currentMap.interactions;
      if (!_.isNull(interactions) && !_.isNull(interactions.moving)) {
        mapInteractionService.configureMoving($scope, svg, interactions.moving, {
          type: currentMapService.currentMap.projection, raw: projection
        }, [ {type: 'path'}, {type: 'circle'}, {type: 'LineString'}]);
      }

      // Configure zooming
      if (!_.isNull(interactions) && !_.isNull(interactions.zooming)) {
        mapInteractionService.configureZooming($scope, svg, interactions.zooming, {
          type: currentMapService.currentMap.projection, raw: projection}, {
          width: '', height: ''
        }, [{type: 'path'}, {type: 'circle'}, {type: 'LineString'}]);
      }
    },

    updateProjection: function($scope, newProjection) {
      currentMapService.currentMap.projection = newProjection;
      this.refreshMap($scope, currentMapService.currentMap.element);
    },

    updateScale: function($scope, newScale) {
      currentMapService.currentMap.scale = newScale;
      this.refreshMap($scope, currentMapService.currentMap.element);
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
      if (_.isNull(path) || _.isUndefined(path)) {
        path = d3.geo.path();
      }

      if (!_.isNull(projection)) {
        return path.projection(projection);
      }
      return path;
    }
  };
}])

.service('mapInteractionService', [ 'consoleService', 'currentMapService',
	function(consoleService, currentMapService) {
  return {
    // Moving

    configureMovingWithMouseDragForOrthographicProjection: function(
        $scope, svg, projection, mapElements) {
      var m0, o0;
      var drag = d3.behavior.drag()
      .on('dragstart', function() {
        // Adapted from http://mbostock.github.io/d3/talk/20111018/azimuthal.html
        // and updated for d3 v3
        var proj = projection.rotate();
        m0 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY];
        o0 = [-proj[0], -proj[1]];
      })
      .on('drag', function() {
        if (m0) {
          var m1 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY];
          var o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
          projection.rotate([-o1[0], -o1[1]]);

          // Update the map
          updateMapElements(projection, mapElements);

          // Update current map context
          $scope.$apply(function() {
            currentMapService.currentMapContext.properties.center.lon = o1[0];
            currentMapService.currentMapContext.properties.center.lat = o1[1];
          });

          consoleService.logMessage('debug', 'Rotated to ' +
            JSON.stringify(o1));
        }
      });

      svg.call(drag);
    },

    configureMovingWithMouseMoveForOrthographicProjection: function(
        $scope, svg, projection, mapElements) {
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

          // Update current map context
          $scope.$apply(function() {
            currentMapService.currentMapContext.properties.center.lon = o1[0];
            currentMapService.currentMapContext.properties.center.lat = o1[1];
          });
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

    configureMovingForMercatorProjection: function(/*$scope, svg, projection, mapElements*/) {
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

    configureMoving: function($scope, svg, moveType, projection, mapElements) {
      if (projection.type === 'orthographic') {
        consoleService.logMessage('info',
          'Configuring moving for projection orthographic');
        // Using mouseDown, mouseUp and mouveMove events
        if (moveType === 'mouseMove') {
          consoleService.logMessage('info', 'Selected moving "mouse move"');
          this.configureMovingWithMouseMoveForOrthographicProjection(
            $scope, svg, projection.raw, mapElements);
        // Using drag events
        } else if (moveType === 'mouseDrag') {
          consoleService.logMessage('info', 'Selected moving "mouse drag"');
          this.configureMovingWithMouseDragForOrthographicProjection(
            $scope, svg, projection.raw, mapElements);
        }
      } else if (projection.type === 'mercator') {
        this.configureMovingForMercatorProjection(
          $scope, svg, projection.raw, mapElements);
      }
    },

    // Zooming

    configureZoomingWithMouseWheelForOrthographicProjection: function($scope, svg, projection, dimension, mapElements) {
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

        // Update current map context
        $scope.$apply(function() {
          currentMapService.currentMapContext.properties.scale = zoom.scale();
        });
      });

      // Apply zoom behavior
      svg.call(zoom);
    },

    configureZoomingWithMouseWheelForMercatorProjection: function($scope, svg/*, projection, dimension, mapElements*/) {
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

        // Update current map context
        $scope.$apply(function() {
          currentMapService.currentMapContext.properties.scale = zoom.scale();
        });
      });

      // Apply zoom behavior
      svg.call(zoom);
      svg.call(zoom.event);
    },

    configureDefaultZoomingWithMouseWheel: function($scope, svg) {
      // Configure zooming
      var zoom = d3.behavior.zoom()
           /*.translate(projection.translate())
           .scale(projection.scale())*/
           .translate([0, 0])
           .scale(1)
           .scaleExtent([1, 8])

           //.scaleExtent([dimension.height, 8 * dimension.height])
           .on('zoom', function() {
        //projection.translate(d3.event.translate).scale(d3.event.scale);
        svg.attr('transform', 'translate(' +
            d3.event.translate.join(',') + ')scale(' + d3.event.scale + ')');

        // Update the map
        //updateMapElements(projection, mapElements);

        // Update current map context
        $scope.$apply(function() {
          currentMapService.currentMapContext.properties.scale = zoom.scale();
        });
      });

      // Apply zoom behavior
      svg.call(zoom);
      svg.call(zoom.event);
    },

    configureZooming: function($scope, svg, moveType, projection, dimension, mapElements) {
      if (projection.type === 'orthographic') {
        consoleService.logMessage('info', 'Configuring zooming for projection orthographic');
        // Using mouseDown, mouseUp and mouveMove events
        if (moveType === 'mouseWheel') {
          consoleService.logMessage('info', 'Selected zooming "mouse wheel"');
          this.configureZoomingWithMouseWheelForOrthographicProjection(
            $scope, svg, projection.raw, dimension, mapElements);
        }
      } else if (projection.type === 'mercator') {
        consoleService.logMessage('info', 'Configuring zooming for projection mercator');
        // Using mouseDown, mouseUp and mouveMove events
        if (moveType === 'mouseWheel') {
          consoleService.logMessage('info', 'Selected zooming "mouse wheel"');
          this.configureZoomingWithMouseWheelForMercatorProjection(
            $scope, svg, projection.raw, dimension, mapElements);
        }
      } else {
        this.configureDefaultZoomingWithMouseWheel($scope, svg);
      }
    }
  };
}]);