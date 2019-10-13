import { Component, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-top',
    '[class.mat-elevation-z4]': 'true'
  }
})
export class TopComponent { }
