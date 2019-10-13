import { Component, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-right',
  templateUrl: 'right.component.html',
  styleUrls: ['right.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-right',
    '[class.mat-elevation-z4]': 'true'
  }
})
export class RightComponent { }
