import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MainComponent } from './main.component';
import { MaterialSharedModule } from 'lib/core/shared-modules';
import { ArenaEventsModule } from '../views/arena/arena-event/arena-event.module';
import { CombatModule } from '../views/math/combat/combat.module';
import { DeckBuilderModule } from '../views/deck/deck-builder/deck-builder.module';
import { HypergeometricCalculatorModule } from '../views/math/hypergeometric-calculator/hypergeometric-calculator.module';
import { DraftModule } from '../views/limited/draft/draft.module';
import { SealedModule } from '../views/limited/sealed/sealed.module';
import { TopEightModule } from '../views/math/top-eight/top-eight.module';
import { PlayTestModule } from '../views/deck/play-test/play-test.module';

const views = [
  ArenaEventsModule,
  CombatModule,
  DeckBuilderModule,
  // DraftModule,
  HypergeometricCalculatorModule,
  PlayTestModule,
  SealedModule,
  TopEightModule
];

@NgModule({
  imports: [
    CommonModule,
    MaterialSharedModule,
    RouterModule,
    ...views
  ],
  declarations: [
    MainComponent,
  ],
  exports: [
    MainComponent
  ]
})
export class MainModule { }
