import { Directive } from '@angular/core';


@Directive({
  selector: 'app-bottom-toggle-left',
  host: {
    'class': 'app-bottom-toggle-left',
    '[class.mat-h2]': 'true'
  }
})
export class BottomToggleLeftDirective { }
