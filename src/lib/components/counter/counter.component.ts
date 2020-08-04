import { Component, Input, ViewEncapsulation, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-counter'
  }
})
export class CounterComponent {

  @ViewChild(MatButton, { static: true }) button: MatButton;

  @Input() color: ThemePalette = 'primary';
  @Input() icon: string;
  @Input() counter: number;

  @Output() counterChanged = new EventEmitter<number>();

  emitChange(event: MouseEvent, increase: boolean): void {
    const multiplier = event.ctrlKey ? 5 : 1;
    const step = increase ? 1 : -1;
    this.button.ripple.launch({ centered: true });
    this.counterChanged.emit(multiplier * step);
    event.stopPropagation();
  }
}
