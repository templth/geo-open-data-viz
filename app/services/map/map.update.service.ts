import {Subject} from 'rxjs/Rx';
import {Layer} from '../../model/map.model';

export interface MapUpdate {
  layerId: string;
  layer: Layer;
  diffs: { string: any }[];
}

export class MapUpdateService {
  private layerDataConfigurationUpdated$: Subject<any> = new Subject();
  private layerDataLoaded$: Subject<any> = new Subject();

  registerOnLayerConfigurationUpdated(layer: Layer) {
    return this.layerDataConfigurationUpdated$
      .filter(update => update.layerId === layer.id);
  }
  
  triggerLayerConfigurationUpdates(layer: Layer, diffs) {
    this.layerDataConfigurationUpdated$
      .next({ layerId: layer.id, layer, diffs });
  }

  registerOnLayerDataLoaded(layer: Layer) {
	  return this.layerDataLoaded$
	    .filter(update => update.layerId === layer.id);
  }

  triggerLayerDataLoaded(layer: Layer, data: any) {
    this.layerDataLoaded$
      .next({ layerId: layer.id, data });
  }
}