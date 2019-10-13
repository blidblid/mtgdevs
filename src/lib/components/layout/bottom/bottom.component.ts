import { Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';

import { slideUp } from './bottom-animation';


@Component({
  selector: 'app-bottom',
  templateUrl: './bottom.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['bottom.component.scss'],
  animations: [
    slideUp
  ],
  host: {
    'class': 'app-bottom',
    '[class.app-bottom-closed]': '!open'
  }
})
export class BottomComponent {
  open = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  close(): void {
    this.open = false;
    this.changeDetectorRef.detectChanges();
  }
}
