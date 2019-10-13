import { Component, ViewEncapsulation, Input } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';


@Component({
  selector: 'app-middle',
  templateUrl: './middle.component.html',
  styleUrls: ['./middle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-middle',
    '[class.app-middle-flex]': 'flex'
  }
})
export class MiddleComponent {

  @Input()
  get flex() {
    return this._flex;
  }
  set flex(value: boolean) {
    this._flex = coerceBooleanProperty(value);
  }
  private _flex: boolean;
}
