import { Component, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-limited-explanation',
  templateUrl: './limited-explanation.component.html',
  styleUrls: ['./limited-explanation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-limited-explanation'
  }
})
export class LimitedExplanationComponent { }
