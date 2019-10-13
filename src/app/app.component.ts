import { Component } from '@angular/core';

import { CacheValidatorService } from '@mtg-devs/api';


@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  // Injected here to eagerly create services
  constructor(private cacheValidatorService: CacheValidatorService) { }
}
