import { Component, OnInit, ViewChild, NgZone, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { filter, map, switchMap, startWith, takeUntil, take } from 'rxjs/operators';
import { Observable, combineLatest, Subject } from 'rxjs';

import { CardService, Card } from '@mtg-devs/api';
import { CardFilterService } from '@mtg-devs/core';
import { CardDisplayComponent } from '@mtg-devs/components';

import { LIMITED_AVAILABLE_SETS } from '../../limited/limited-model';
import { CombatStat, FightOutcome } from './combat-model';


@Component({
  selector: 'app-combat',
  templateUrl: './combat.component.html',
  styleUrls: ['./combat.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-combat'
  }
})
export class CombatComponent implements OnInit {

  @ViewChild('sort', { static: false }) sort: MatSort;

  setFormControl = new FormControl(null, Validators.required);
  cmcFormControl = new FormControl();

  combatStats$: Observable<CombatStat[]>;

  dataSource = new MatTableDataSource();
  availableSets = LIMITED_AVAILABLE_SETS;
  displayedColumns = [
    'name',
    'numberOfWins',
    'numberOfDraws',
    'numberOfLosses',
    'winPercentage',
    'drawPercentage',
    'lossPercentage'
  ];

  private cards$: Observable<Card[]>;
  private fightCards$: Observable<Card[]>;

  private destroySub = new Subject<void>();

  constructor(
    private cardService: CardService,
    private cardFilterService: CardFilterService,
    private zone: NgZone,
    private dialogService: MatDialog) {
  }

  onCardClick(card: Card): void {
    const dialogRef = this.dialogService.open(CardDisplayComponent, { panelClass: 'app-card-display-dialog' });
    dialogRef.componentInstance.asImage = true;
    dialogRef.componentInstance.size = 1;
    dialogRef.componentInstance.card = card;
    dialogRef.componentInstance.changeDetectorRef.detectChanges();
  }

  private buildSelectionObservables(): void {
    this.cards$ = this.setFormControl.valueChanges.pipe(
      filter(set => !!set),
      switchMap(set => this.cardService.getSet(set)),
      map(set => set.cards)
    );

    const cmc$ = this.cmcFormControl.valueChanges.pipe(startWith(null as number));

    const filteredCards$ = combineLatest([this.cards$, cmc$]).pipe(
      map(([cards, cmc]) => cmc ? this.cardFilterService.byConvertedManacost(cards, cmc) : cards)
    );

    this.fightCards$ = filteredCards$.pipe(
      map(cards => {
        return cards.filter(card => {
          const power = parseInt(card.power);
          const toughness = parseInt(card.toughness);
          return [power, toughness].every(parsed => !isNaN(parsed) && typeof parsed === 'number') && toughness > 0;
        });
      })
    );
  }

  private buildCombatObservables(): void {
    this.combatStats$ = this.fightCards$.pipe(
      map(cards => cards.map(card => this.getCombatStat(card, cards)))
    );

    this.combatStats$
      .pipe(takeUntil(this.destroySub))
      .subscribe(stats => {
        this.dataSource.data = stats;
        this.zone.onStable.pipe(take(1)).subscribe(() => this.dataSource.sort = this.sort);
      });
  }

  private getCombatStat(card: Card, compareTo: Card[]): CombatStat {
    const initialCombatStats: { wins: Card[], draws: Card[], losses: Card[] } = {
      wins: [],
      draws: [],
      losses: []
    };

    const matchupResults = compareTo.reduce((acc, curr) => {
      if (curr === card) {
        return acc;
      }

      switch (this.fightCards(card, curr)) {
        case (FightOutcome.Win):
          return { ...acc, wins: [...acc.wins, curr] };
        case (FightOutcome.Draw):
          return { ...acc, draws: [...acc.draws, curr] };
        case (FightOutcome.Loss):
          return { ...acc, losses: [...acc.losses, curr] };
      }
    }, initialCombatStats);

    const numberOfWins = matchupResults.wins.length;
    const numberOfDraws = matchupResults.draws.length;
    const numberOfLosses = matchupResults.losses.length;
    const totalMatchups = numberOfWins + numberOfDraws + numberOfLosses;

    return {
      card,
      ...matchupResults,
      numberOfWins,
      numberOfDraws,
      numberOfLosses,
      winPercentage: 100 * numberOfWins / totalMatchups,
      drawPercentage: 100 * numberOfDraws / totalMatchups,
      lossPercentage: 100 * numberOfLosses / totalMatchups
    };
  }

  private fightCards(card: Card, opponent: Card): FightOutcome {
    const firstRemainingToughness = this.damage(opponent, card, 0, true);
    const firstOpponentRemainingToughness = this.damage(card, opponent, 0, true);
    const firstStrikeOutcome = this.checkDamageOutcome(firstRemainingToughness, firstOpponentRemainingToughness);

    if (firstStrikeOutcome) {
      return firstStrikeOutcome;
    }

    const damage = parseInt(card.toughness) - firstRemainingToughness;
    const opponentDamage = parseInt(opponent.toughness) - firstOpponentRemainingToughness;

    const remainingToughness = this.damage(opponent, card, damage, false);
    const opponentRemainingToughness = this.damage(card, opponent, opponentDamage, false);
    const outcome = this.checkDamageOutcome(remainingToughness, opponentRemainingToughness);

    return outcome || FightOutcome.Draw;
  }

  private damage(card: Card, opponent: Card, withDamage: number, firstStrikeDamage: boolean): number {
    const cardPower = parseInt(card.power) || 0;
    const opponentToughness = parseInt(opponent.toughness) || 0;

    if (opponent.hasIndestructible) {
      return opponentToughness;
    }

    if (firstStrikeDamage && !card.hasFirstStrike && !card.hasDoubleStrike) {
      return opponentToughness;
    }

    if (cardPower > 0 && card.hasDeathtouch) {
      return 0;
    }

    if (card.hasFirstStrike && !firstStrikeDamage) {
      return opponentToughness - withDamage;
    }

    return opponentToughness - cardPower - withDamage;
  }

  private checkDamageOutcome(remainingToughness: number, remainingOpponentToughness: number): FightOutcome | null {
    if (remainingToughness <= 0 && remainingOpponentToughness <= 0) {
      return FightOutcome.Draw;
    } else if (remainingToughness <= 0 && remainingOpponentToughness > 0) {
      return FightOutcome.Loss;
    } else if (remainingToughness > 0 && remainingOpponentToughness <= 0) {
      return FightOutcome.Win;
    } else {
      return null;
    }
  }

  ngOnInit() {
    this.buildSelectionObservables();
    this.buildCombatObservables();
  }
}
