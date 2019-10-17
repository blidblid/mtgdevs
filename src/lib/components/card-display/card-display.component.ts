import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { Card } from '@mtg-devs/api';

import { CARD_WIDTH_IN_PX, CARD_HEIGHT_IN_PX } from './card-display-model';


@Component({
  selector: 'app-card-display',
  templateUrl: './card-display.component.html',
  styleUrls: ['./card-display.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'app-card-display',
    '[class.app-card-display-as-image]': 'asImage',
    '[class.app-card-display-nameless]': '!withName',
    '[class.app-card-display-tapped]': 'card && card.tapped',
    '[style.min-width.px]': 'sizedWidth',
    '[style.min-height.px]': 'sizedHeight'
  }
})
export class CardDisplayComponent implements OnInit {

  @Input()
  get card() {
    return this._card;
  }
  set card(value: Card) {
    this._card = value;
    this.updateImageUrl();
  }
  private _card: Card;

  @Input()
  get removable() {
    return this._removable;
  }
  set removable(value: boolean) {
    this._removable = coerceBooleanProperty(value);
  }
  private _removable: boolean;

  @Input()
  get size() {
    return this._size;
  }
  set size(value: number) {
    this._size = value;
    this.updateSize();
  }
  private _size: number;

  @Input()
  get asImage() {
    return this._asImage;
  }
  set asImage(value: boolean) {
    this._asImage = coerceBooleanProperty(value);
  }
  private _asImage: boolean;

  @Input() numberOf: number;
  @Input() counter: number;
  @Input() withSprites = true;
  @Input() withName = true;
  @Input() nameTooltip: string;
  @Input() spritesTooltip: string;

  @Output() cardSelected = new EventEmitter<Card>();
  @Output() cardRemoved = new EventEmitter<Card>();
  @Output() cardAdded = new EventEmitter<Card>();
  @Output() counterChanged = new EventEmitter<number>();

  sprites: string[];
  imageUrl: string;
  sizedHeight: number;
  sizedWidth: number;

  constructor(private dialogService: MatDialog, public changeDetectorRef: ChangeDetectorRef) { }

  onClick(): void {
    this.cardSelected.emit(this.card);
  }

  remove(): void {
    if (this.removable) {
      this.cardRemoved.emit(this.card);
    }
  }

  openImage(event: MouseEvent): void {
    event.stopPropagation();
    const dialogRef = this.dialogService.open(CardDisplayComponent, { panelClass: 'app-card-display-dialog' });
    dialogRef.componentInstance.asImage = true;
    dialogRef.componentInstance.size = 1;
    dialogRef.componentInstance.card = this.card;
    dialogRef.componentInstance.changeDetectorRef.detectChanges();
  }

  onCounterChanged(counter: number): void {
    this.counterChanged.emit(this.counter + counter);
  }

  private setSprites(): void {
    if (!this.card || !this.card.manaCost) {
      return;
    }

    const symbols = this.card.manaCost.match(/.(?=\})/g);
    if (symbols) {
      this.sprites = symbols.map(symbol => `sprite sprite-${symbol}`);
    }
  }

  private updateSize(): void {
    this.sizedWidth = CARD_WIDTH_IN_PX * this.size;
    this.sizedHeight = CARD_HEIGHT_IN_PX * this.size;
  }

  private updateImageUrl(): void {
    if (!this.card || (!this.card.multiverseId && !this.card.scryfallImage)) {
      this.imageUrl = '';
      return;
    }

    this.imageUrl = this.card.scryfallImage
      ? `url(${this.card.scryfallImage})`
      : `url(https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${this.card.multiverseId}&type=card)`;
  }

  ngOnInit() {
    this.setSprites();
  }
}
