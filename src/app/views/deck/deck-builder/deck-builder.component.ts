import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BACKSPACE, ENTER, DELETE } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, Subject, fromEvent, merge } from 'rxjs';
import {
  switchMap,
  map,
  startWith,
  takeUntil,
  withLatestFrom,
  distinctUntilChanged,
  auditTime,
  debounceTime,
  filter
} from 'rxjs/operators';

import {
  Card,
  AVAILABLE_DICTIONARIES,
  DictionaryEntry,
  StoredDeck,
  DictionaryService,
  DeckService
} from '@mtg-devs/api';
import { CardCountService, FuseJsService } from '@mtg-devs/core';

import { DeckStoreService } from './deck-store.service';
import { StoredDeckStoreService } from '../../limited/sealed/stored-deck-store.service';
import { BottomComponent } from '../../../../lib/components/layout/bottom/bottom.component';


@Component({
  selector: 'app-deck-builder',
  templateUrl: './deck-builder.component.html',
  styleUrls: ['./deck-builder.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'app-deck-builder'
  }
})
export class DeckBuilderComponent implements OnInit {

  filter: FormControl = new FormControl('');
  deckNameFormControl: FormControl = new FormControl('', Validators.required);

  autocompleteValues$: Observable<DictionaryEntry[]>;
  forkDisabled$: Observable<boolean>;
  storedDecks$: Observable<StoredDeck[]>;
  cards$: Observable<Card[]>;

  @ViewChild('filterInput', { static: true, read: ElementRef }) filterInput: ElementRef;
  @ViewChild(BottomComponent, { static: false }) bottom: BottomComponent;

  dictionaries: string[] = AVAILABLE_DICTIONARIES;
  dictionaryFormControl = new FormControl('standard');

  private lastCardName: string;
  private cardCounter: number;

  private disableForkSub: Subject<boolean> = new Subject();
  private forkSub: Subject<void> = new Subject();
  private destroySub: Subject<void> = new Subject();

  constructor(private deckStore: DeckStoreService,
    private deckService: DeckService,
    private dicitonary: DictionaryService,
    private cardCountService: CardCountService,
    private fuse: FuseJsService<DictionaryEntry>,
    private activatedRoute: ActivatedRoute,
    private storedDeckStoreService: StoredDeckStoreService,
    private router: Router) {
  }

  onOptionSelected(selection: MatAutocompleteSelectedEvent): void {
    this.deckStore.add(selection.option.value, this.cardCounter);
    this.lastCardName = selection.option.value;
    Promise.resolve().then(() => this.filter.setValue('', { emitEvent: false }));
  }

  onCardRemoved(card: Card): void {
    this.deckStore.remove(card);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.filter.value !== '' || this.lastCardName === null) {
      return;
    }

    if ([BACKSPACE, DELETE].includes(event.keyCode)) {
      this.deckStore.remove(this.lastCardName);
    } else if ([ENTER].includes(event.keyCode)) {
      this.deckStore.add(this.lastCardName);
    }
  }

  clear(): void {
    this.deckStore.clear();
  }

  fork(): void {
    this.disableForkSub.next(true);
    this.forkSub.next();
  }

  load(storedDeck: StoredDeck): void {
    this.navigateToDeck(storedDeck.deckKey);
    this.bottom.close();
  }

  remove(storedDeck: StoredDeck): void {
    this.storedDeckStoreService.remove(storedDeck, 1, ['deckKey']);
  }

  onCardAdded(card: Card): void {
    this.deckStore.add(card);
  }

  private buildDictionaryObservable(): void {
    const dictionary$ = this.dictionaryFormControl.valueChanges.pipe(
      startWith(this.dictionaryFormControl.value),
      switchMap(dictionary => this.dicitonary.getDictionary(dictionary)),
      map(dictionary => dictionary.cards)
    );

    const filter$ = this.filter.valueChanges.pipe(startWith(''), map(filterBy => filterBy + ''));

    this.autocompleteValues$ = combineLatest(filter$, dictionary$).pipe(
      debounceTime(250),
      map(([filterBy, dictionary]) => {
        if (!filterBy.match(/[a-zA-Z]/g)) {
          return [];
        }

        if (filterBy.length === 0) {
          return dictionary;
        }

        return this.fuse.search(filterBy, dictionary, ['name', 'type']);
      }),
      map(cards => cards.slice(0, 5))
    );
  }

  private buildCardCounterObservable(): void {
    // Have to do this with the native input element since the autocomplete sets filter value on OptionSelected.
    const cardCounter$ = fromEvent<Event>(this.filterInput.nativeElement, 'keypress').pipe(
      map(input => (input.target as HTMLInputElement).value),
      map(filterBy => {
        if (!filterBy) {
          return 1;
        }
        const num = filterBy.trim().match(/\d+/);
        return num ? parseInt(num[0], 10) : 1;
      })
    );

    cardCounter$
      .pipe(takeUntil(this.destroySub))
      .subscribe(counter => this.cardCounter = counter);
  }

  private buildObservables(): void {
    const loadDeck$ = this.activatedRoute.paramMap.pipe(
      map(paramMap => paramMap.get('param')),
      filter(param => param !== 'new'),
      switchMap(deckKey => this.deckService.getDeck(deckKey))
    );

    const deckName$ = this.deckNameFormControl.valueChanges.pipe(
      startWith(this.deckNameFormControl.value)
    );

    loadDeck$
      .pipe(takeUntil(this.destroySub))
      .subscribe(userDeck => {
        this.deckStore.clear();
        this.deckNameFormControl.setValue(userDeck.name);
        userDeck.cards.forEach(card => this.deckStore.add(card));
      });

    this.cards$ = this.deckStore.get();
    this.storedDecks$ = this.storedDeckStoreService.get();

    this.forkDisabled$ = merge(
      this.disableForkSub,
      this.cards$.pipe(auditTime(0), distinctUntilChanged((a, b) => a.length === b.length)),
      deckName$.pipe(distinctUntilChanged())
    ).pipe(map(change => change === true || this.deckNameFormControl.invalid));

    const fork$ = this.forkSub.pipe(
      withLatestFrom(this.cards$),
      withLatestFrom(deckName$),
      switchMap(([[, cards], name]) => this.deckService.saveDeck(this.cardCountService.countCardNames(cards), name)),
      takeUntil(this.destroySub)
    );

    fork$.subscribe(storedDeck => {
      this.storedDeckStoreService.add(storedDeck, 1, true);
      this.navigateToDeck(storedDeck.deckKey);
    }
    );
  }

  private navigateToDeck(deckKey: string): void {
    this.router.navigateByUrl(`main/deck-builder/${deckKey}`);
  }

  private navigateToStart(): void {
    // This is ugly, but Angular will reload the URL when going from no URL-param to a URL-param.
    // Set a dummy one to prevent reloading of component on initial deck-forks.
    if (!this.activatedRoute.snapshot.paramMap.get('param')) {
      this.navigateToDeck('new');
    }
  }

  ngOnInit() {
    this.navigateToStart();
    this.buildDictionaryObservable();
    this.buildCardCounterObservable();
    this.buildObservables();
  }

  ngOnDestroy() {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
