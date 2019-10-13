import { Component } from '@angular/core';


@Component({
  selector: 'app-top-actions',
  template: '<ng-content></ng-content>',
  host: {
    'class': 'app-top-actions',
  }
})
export class TopActionsComponent  { }
