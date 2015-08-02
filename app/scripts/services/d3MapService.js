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

/**
 * @ngdoc service
 * @name mapManager.d3.services:mapCreatorService
 * @description
 * Provide functions to create and refresh map rendering.
 */
.service('mapCreatorService', [ 'currentMapService', 'mapInteractionService',
    'layerService', 'projectionService', function(currentMapService,
      mapInteractionService, layerService, projectionService) {
  return {
    /**
     * @ngdoc method
     * @name refreshMap
     * @methodOf mapManager.d3.services:mapCreatorService
     * @description
     * Refresh the map by recreating it. If a map is present, this removes
     * the whole SVG content.
     *
     * The actual map creation is delegated to the method
     * {@link mapManager.d3.services:mapCreatorService.createMap createMap}
     *
     * To drop the existing map, the attribute `svg` of
     * `currentMapService.currentMapContext` is used.
     *
     * @param {Object} $scope the scope of the controller that creates the map
     * @param {Object} element the DOM element to create the map on
    */
    refreshMap: function($scope, element) {
      if (!_.isNull(currentMapService.currentMapContext.svg)) {
        currentMapService.currentMapContext.svg.remove();
      }

      this.createMap($scope, element);
    },

    /**
     * @ngdoc method
     * @name createMap
     * @methodOf mapManager.d3.services:mapCreatorService
     * @description
     * Create the map using the provided map structure (see
     * currentMapService.currentMap).
     *
     * Here are the different steps:
     * The actual map creation is delegated to the method
     * {@link mapManager.d3.services:mapCreatorService.createMap createMap}
     *
     * * {@link mapManager.d3.services:projectionService.createProjection createProjection}
     * * configure scale
     * * rotate to center (if projection orthographic)
     * * {@link mapManager.d3.services:projectionService.configurePathWithProjection configurePathWithProjection}
     * * set elements in currentMapService.currentMapContext
     * * for each layer: layerService.createLayer
     * * {@link mapManager.d3.services:mapInteractionService.configureMoving configureMoving}
     * * {@link mapManager.d3.services:mapInteractionService.configureZooming configureZooming}
     *
     * @param {Object} $scope the scope of the controller that creates the map
     * @param {Object} element the DOM element to create the map on
    */
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
          currentMapService.currentMap.projection === 'orthographic' &&
          !_.isNull(currentMapService.currentMap.center)) {
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

    /**
     * @ngdoc method
     * @name updateProjection
     * @methodOf mapManager.d3.services:mapCreatorService
     * @description
     * Apply the new projection to the map.
     *
     * Actually the new projection is set within the current map
     * object as string and the map is refreshed / recreated?
     *
     * @param {Object} $scope the scope of the controller that creates the map
     * @param {Object} newProjection the new projection as string
    */
    updateProjection: function($scope, newProjection) {
      currentMapService.currentMap.projection = newProjection;
      this.refreshMap($scope, currentMapService.currentMap.element);
    },

    /**
     * @ngdoc method
     * @name updateProjection
     * @methodOf mapManager.d3.services:mapCreatorService
     * @description
     * Apply the new projection to the map.
     *
     * Actually the new scale is set within the current map
     * object as string and the map is refreshed / recreated?
     *
     * @param {Object} $scope the scope of the controller that creates the map
     * @param {Object} newScale the new scale
    */
    updateScale: function($scope, newScale) {
      currentMapService.currentMap.scale = newScale;
      // TODO : to rather the following
      // projection.scale(currentMapService.currentMap.scale);
      // updateMapElements(projection, mapElements);

      this.refreshMap($scope, currentMapService.currentMap.element);
    }
  };
}])

// Projection service

/**
 * @ngdoc service
 * @name mapManager.d3.services:projectionService
 * @description
 * Provide functions to create and configure projections for a map.
 */
.service('projectionService', [ function() {
  return {
    /**
     * @ngdoc method
     * @name createMercatorProjection
     * @methodOf mapManager.d3.services:projectionService
     * @description
     * Create a mercator projection based on a configuration object.
     *
     * @param {Object} configuration the map configuration object
    */
    createMercatorProjection: function(configuration) {
      var projection = d3.geo.mercator()
          //.scale(150)
          .translate([configuration.width / 2, configuration.height / 1.5]);
      return projection;
    },

    /**
     * @ngdoc method
     * @name createOrthographicProjection
     * @methodOf mapManager.d3.services:projectionService
     * @description
     * Create a orthographic projection based on a configuration object.
     *
     * @param {Object} configuration the map configuration object
    */
    createOrthographicProjection: function(/*configuration*/) {
        var projection = d3.geo.orthographic()
          .scale(248)
          .clipAngle(90);

        return projection;
      },

    /**
     * @ngdoc method
     * @name createProjection
     * @methodOf mapManager.d3.services:projectionService
     * @description
     * Create a projection based on a projection type and a configuration
     * object.
     *
     * The following projections are supported:
     *
     * * Orthographic. See {@link mapManager.d3.services:projectionService.createOrthographicProjection createOrthographicProjection}
     * * Mercator. See {@link mapManager.d3.services:projectionService.createMercatorProjection createMercatorProjection}
     *
     * @param {String} projectionType the projection type
     * @param {Object} configuration the map configuration object
    */
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

    /**
     * @ngdoc method
     * @name configurePathWithProjection
     * @methodOf mapManager.d3.services:projectionService
     * @description
     * Configure paths of the map with a specified projection. The projection is
     * creation using the method {@link mapManager.d3.services:projectionService.createProjection createProjection}
     *
     * @param {String} projectionType the projection type
     * @param {Object} configuration the map configuration object
    */
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

/**
 * @ngdoc service
 * @name mapManager.d3.services:mapInteractionService
 * @description
 * Provide functions to configure the interactions like map moving and zooming.
 */
.service('mapInteractionService', [ 'consoleService', 'currentMapService',
	function(consoleService, currentMapService) {
  return {
    // Moving

    /**
     * @ngdoc method
     * @name configureMovingWithMouseDragForOrthographicProjection
     * @methodOf mapManager.d3.services:mapInteractionService
     * @description
     * Configure map moving for an orthographic projection using drag'n drop.
     *
     * @param {Object} $scope the scope of the controller that creates the map
     * @param {Object} svg the global SVG element
     * @param {Object} projection the current projection of the map
     * @param {Object} mapElements the element kinds to update after moving
    */
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

    /**
     * @ngdoc method
     * @name configureMovingWithMouseMoveForOrthographicProjection
     * @methodOf mapManager.d3.services:mapInteractionService
     * @description
     * Configure map moving for an orthographic projection using the mouse
     * move event.
     *
     * @param {Object} $scope the scope of the controller that creates the map
     * @param {Object} svg the global SVG element
     * @param {Object} projection the current projection of the map
     * @param {Object} mapElements the element kinds to update after moving
    */
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

    /**
     * @ngdoc method
     * @name configureMovingForMercatorProjection
     * @methodOf mapManager.d3.services:mapInteractionService
     * @description
     * Configure map moving for an mercator projection using the mouse
     * move event.
     *
     * @param {Object} $scope the scope of the controller that creates the map
     * @param {Object} svg the global SVG element
     * @param {Object} projection the current projection of the map
     * @param {Object} mapElements the element kinds to update after moving
    */
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

    /**
     * @ngdoc method
     * @name configureMoving
     * @methodOf mapManager.d3.services:mapInteractionService
     * @description
     * Configure map moving for a specific  projection using a specified mouse
     * move event.
     *
     * @param {Object} $scope the scope of the controller that creates the map
     * @param {Object} svg the global SVG element
     * @param {String} moveType the kind of moving
     * @param {Object} projection the current projection of the map
     * @param {Object} mapElements the element kinds to update after moving
    */
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