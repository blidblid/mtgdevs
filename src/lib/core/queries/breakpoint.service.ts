import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BreakpointService {

  private matches$: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.buildObservables();
  }

  getMatches(): Observable<boolean> {
    return this.matches$;
  }

  private buildObservables(): void {
    this.matches$ = this.breakpointObserver.observe('(max-width: 790px)').pipe(
      map(breakpoint => breakpoint.matches)
    );
  }
}
