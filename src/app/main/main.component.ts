import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  AfterContentInit
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material';
import { Observable, Subject } from 'rxjs';
import { map, filter, startWith, share, takeUntil } from 'rxjs/operators';

import {
  PLAY_MATS,
  SideNavItem,
  Subcategory,
  SideNavItemSubcategory,
  SIDE_NAV_ITEM
} from './main-model';
import { IconRegistryService } from '@mtg-devs/core';


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
export class MainComponent implements AfterContentInit, OnInit {

  backgroundUrl: string;

  mobileQuery: MediaQueryList;
  mobileQueryListener: () => void;
  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav;

  subcategories: Subcategory[];
  activatedView$: Observable<string>;

  private destroySub = new Subject<void>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private router: Router,
    private iconRegistry: IconRegistryService,
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
      name: 'Arena',
      components: this.sideNavItems.filter(c => c.subcategory === SideNavItemSubcategory.Arena)
    }, {
      name: 'Deck',
      components: this.sideNavItems.filter(c => c.subcategory === SideNavItemSubcategory.Deck)
    }, {
      name: 'Math',
      components: this.sideNavItems.filter(c => c.subcategory === SideNavItemSubcategory.Math)
    }];
  }

  private buildObservables(): void {
    this.activatedView$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(this.router.url),
      map(() => {
        const segments = this.router.url.split('/');
        return segments.find(segment => this.sideNavItems.some(component => component.link === segment));
      }),
      share()
    );

    this.activatedView$
      .subscribe(() => {
        if (this.mobileQuery.matches && this.sidenav) {
          this.sidenav.close();
        }
      });
  }

  private setupMobileQueries(): void {
    this.mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery = this.media.matchMedia('(max-width: 790px)');
    this.mobileQuery.addListener(this.mobileQueryListener);
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    this.setupMobileQueries();
    this.setupNav();
    this.buildObservables();
    this.backgroundUrl = `url(${PLAY_MATS[Math.round(Math.random() * (PLAY_MATS.length)) - 1]})`;
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }
}
