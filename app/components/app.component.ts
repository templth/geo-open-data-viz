import {Component} from '@angular/core';
import {MapComponent} from './map/map';

  @Component({
    selector: 'my-app',
    template: `

        <!--button md-button>title1</button-->

    <!--md-content class="md-padding" layout="row" layout-wrap layout-align="center start">
      <div flex="50" layout="column" flex-xs="100">
        <md-card>
          <img src="public/images/grass.jpg" class="md-card-image" alt="Grass">
          <md-card-title>
            <md-card-title-text>
              <span class="md-headline">Action buttons</span>
            </md-card-title-text>
          </md-card-title>
          <md-card-content-->
            <map></map>
          <!--/md-card-content>
        </md-card>
      </div>
    </md-content-->

  `,
    directives: [MapComponent/*, MATERIAL_DIRECTIVES*/]
  })
  export class AppComponent {
  }