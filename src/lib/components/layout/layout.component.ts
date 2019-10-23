import { Component, ViewEncapsulation, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { BreakpointService } from '@mtg-devs/core';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'app-layout',
    '[class.app-layout-dense]': 'matches'
  }
})
export class LayoutComponent implements OnDestroy, OnInit {

  matches: boolean;

  private destroySub = new Subject<void>();

  constructor(
    private breakpoint: BreakpointService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  private subscribeToBreakpoint(): void {
    this.breakpoint.getMatches()
      .pipe(takeUntil(this.destroySub))
      .subscribe(matches => {
        this.matches = matches;
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.subscribeToBreakpoint();
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
