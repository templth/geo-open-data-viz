import {Injectable, KeyValueDiffers} from '@angular/core';
import {Subject} from 'rxjs/Rx';

export class LayerConfigurationUpdate {
  layerId: string;
}

@Injectable()
export class LayersData {
  /*private layerDataConfigurationUpdated$: Subject<any> = new Subject();
  private layersUpdates: {
     string?: KeyValueDiffers
  } = {};

  constructor(private differs:KeyValueDiffers) {
  }

  loadMapData(map) {

  }

  registerOnDataLoaded(layer, callback) {
    
  }

  initializeMapConfiguration(map) {
    //TODO: add / remove layers

    if (map.layers) {
      map.layers.forEach(layer => {
        
      });
    }
  }

  registerOnLayerConfigurationUpdated(layer) {
	  return this.layerDataConfigurationUpdated$
	    .filter(update => update.layerId === layer.id);
  }

  getLayerDiffers() {
    this.differ = differs.find([]).create(null);

  }

  triggerLayerConfigurationUpdates(layer, newConfiguration) {
    var differs = 
	  return this.layerDataConfigurationUpdated$
		  .next(updates);
  }*/
}