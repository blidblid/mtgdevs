import { Component, ViewEncapsulation } from '@angular/core';
import { EXPAND_ANIMATION } from './right-animations';


@Component({
  selector: 'app-right-info',
  templateUrl: 'right-info.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [EXPAND_ANIMATION],
  host: {
    'class': 'app-right-info'
  }
})
export class RightInfoComponent {
  infoOpen = false;
}
