import { bootstrap }    from '@angular/platform-browser-dynamic'; 
import {HTTP_PROVIDERS} from '@angular/http';
import {AppComponent} from './components/app.component';
import {MapService} from './services/map/map.service';
import {MapUpdateService} from './services/map/map.update.service';
import {ExpressionsService} from './services/expressions/expressions.service';

bootstrap(AppComponent, [HTTP_PROVIDERS, MapService, MapUpdateService, ExpressionsService]);