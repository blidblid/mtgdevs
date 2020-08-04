import { NgModule, Inject } from '@angular/core';
import { RouterModule, Router, Route } from '@angular/router';

import { PageNotFoundComponent } from '@mtg-devs/core';

import { MainComponent } from './main/main.component';
import { SIDE_NAV_ITEM, SideNavItem } from './main/main-model';


const routes: Route[] = [
  {
    path: '',
    component: MainComponent,
    children: []
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

  constructor(
    @Inject(SIDE_NAV_ITEM) private components: SideNavItem[],
    private router: Router
  ) {
    this.buildRouterConfig();
  }

  private buildRouterConfig(): void {
    const childRoutes = this.components.map(c => {
      return {
        path: `${c.link}`,
        component: c.component
      };
    });

    const childRoutesWithParam = this.components.map(c => {
      return {
        path: `${c.link}/:param`,
        component: c.component
      };
    });

    routes[0].children = [...childRoutes, ...childRoutesWithParam];
    this.router.resetConfig(routes);
  }
}
