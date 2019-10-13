import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-page-not-found',
    '(click)': 'navigateToStart()'
  }
})
export class PageNotFoundComponent {

  constructor(private router: Router) { }

  navigateToStart(): void {
    this.router.navigateByUrl('');
  }
}
