import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  AfterContentInit,
  OnDestroy
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable, Subject } from 'rxjs';
import { map, filter, startWith, withLatestFrom, shareReplay } from 'rxjs/operators';

import { IconRegistryService, BreakpointService } from '@mtg-devs/core';

import {
  PLAY_MATS,
  SideNavItem,
  Subcategory,
  SideNavItemSubcategory,
  SIDE_NAV_ITEM
} from './main-model';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.app-sidenav-closed]': '!sidenav || !sidenav.opened'
  }
})
export class MainComponent implements AfterContentInit, OnInit, OnDestroy {

  backgroundUrl: string;

  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav;

  subcategories: Subcategory[];
  breakpointMatches$: Observable<boolean>;
  sidenavMode$: Observable<string>;

  private destroySub = new Subject<void>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private iconRegistry: IconRegistryService,
    private breakpoint: BreakpointService,
    @Inject(SIDE_NAV_ITEM) private sideNavItems: SideNavItem[]
  ) {
    this.iconRegistry.registerDefaults();
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  private setupNav(): void {
    this.subcategories = [{
      name: 'Limited',
      components: this.sideNavItems.filter(c => c.subcategory === SideNavItemSubcategory.Limited)
    }, {
      name: 'Constructed',
      components: this.sideNavItems.filter(c => c.subcategory === SideNavItemSubcategory.Constructed)
    }, {
      name: 'Math',
      components: this.sideNavItems.filter(c => c.subcategory === SideNavItemSubcategory.Math)
    }];
  }

  private buildObservables(): void {
    this.breakpointMatches$ = this.breakpoint.getMatches();

    this.sidenavMode$ = this.breakpointMatches$.pipe(
      map(matches => matches ? 'over' : 'side')
    );
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    this.setupNav();
    this.buildObservables();
    this.backgroundUrl = `url(${PLAY_MATS[Math.round(Math.random() * (PLAY_MATS.length)) - 1]})`;
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
