import {Subject} from 'rxjs/Subject';

export class AbstractLayer {
  initialized: boolean = false;
  layerLoaded: Subject<boolean> = new Subject<boolean>();
}