import { Directive } from '@angular/core';


@Directive({
  selector: 'app-bottom-toggle-right',
  host: {
    'class': 'app-bottom-toggle-right',
    '[class.mat-h2]': 'true'
  }
})
export class BottomToggleRightDirective { }
