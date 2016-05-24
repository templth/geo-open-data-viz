import {Injectable, KeyValueDiffers} from '@angular/core';
import {trackballAngles, composedRotation} from './d3.service';

declare var d3: any;

@Injectable()
export class MapService {
  current: any;

  createProjection(map) {
  	if (map.projection.type === 'orthographic') {
      return this.createOrthographicProjection(map.projection);
    } else if(map.projection.type === 'mercator') {
      return this.createMercatorProjection(map.projection);
    } else if(map.projection.type === 'satellite') {
      return this.createSatelliteProjection(map.projection);
    }
  }

  createOrthographicProjection(projectionConfig) {
    return d3.geo.orthographic()
		  .scale(248)
		  .clipAngle(90);
  }

  createMercatorProjection(projectionConfig) {
    return d3.geo.mercator();
  }

  createSatelliteProjection(projectionConfig) {
    return d3.geo.satellite()
      .distance(1.1)
      .scale(5500)
      .rotate([76.00, -34.50, 32.12])
      .center([-2, 5])
      .tilt(25)
      .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI - 1e-6)
      .precision(.1);
  }

  isSphericalProjection(projectionConfig) {
	  return (projectionConfig.type === 'orthographic' ||
		  projectionConfig.type === 'satellite');
  }

  configureMapBehaviors(component, element, projection, map) {
    var projectionConfig = map.projection;
    var svg = d3.select(element);
    if (this.isSphericalProjection(projectionConfig)) {
      this.configureSphericalMapBehaviors(component,
        svg, projection, projectionConfig);
    } else {
      this.configureConformalMapBehaviors(component,
        svg, projection, projectionConfig);
    }
  }

  configureConformalMapBehaviors(component, svg, projection, projectionConfig) {
    var zoom = d3.behavior.zoom()
      .scale(projection.scale())
      .on('zoom', () => {
        if (d3.event.scale != projection.scale()) {
          projection.scale(d3.event.scale);
          this.current.scale = projection.scale();
          component.path = d3.geo.path().projection(projection);
        } else {
          projection.translate(d3.event.translate);
          this.current.center = projection.center();
          component.path = d3.geo.path().projection(projection);
        }
      });

    svg.call(zoom);
  }

  configureSphericalMapBehaviors(component, svg, projection, projectionConfig) {
  	// Zoom
    var zoom = d3.behavior.zoom()
      .scale(projection.scale())
      .on('zoom', () => {
		    if (d3.event.scale != projection.scale()) {
        this.current.previousScale = projection.scale();
        projection.scale(d3.event.scale);
          this.current.scale = projection.scale();
          component.path = d3.geo.path().projection(projection);
		    }
      });

    svg.call(zoom);

    // Move
    let m0 = null;
    let o0;
    let o1;

    var drag = d3.behavior.drag()
      .on('dragstart', () => {
        m0 = trackballAngles(projection, d3.mouse(svg[0][0]));
        o0 = projection.rotate();
      })
      .on('drag', () => {
        var m1 = trackballAngles(projection, d3.mouse(svg[0][0]));
        o1 = composedRotation(o0[0], o0[1], o0[2],
          m1[0] - m0[0], m1[1] - m0[1]);

        projection.rotate(o1);
        this.current.center = projection.rotate();

        component.path = d3.geo.path().projection(projection);
      });

    svg.call(drag);
  }
}