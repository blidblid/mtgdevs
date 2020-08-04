import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';

import { Card } from '@mtg-devs/api';

import { TableCardClicked, TableCardMoved, TableZone, TableZoneContext, TableCardCounterChanged } from './table-model';
import { CardCountService } from 'lib/core/card';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'app-table'
  }
})
export class TableComponent implements OnInit {

  @Input() battlefield: Card[];
  @Input() land: Card[];
  @Input() hand: Card[];

  @Input()
  set exile(value: Card[]) {
    this.patchContext(value, this.exileContext);
  }
  exileContext: TableZoneContext = { title: 'Exile' };

  @Input()
  set graveyard(value: Card[]) {
    this.patchContext(value, this.graveyardContext);
  }
  graveyardContext: TableZoneContext = { title: 'Graveyard' };

  @Input()
  set library(value: Card[]) {
    this.patchContext(value, this.libraryContext);
  }
  libraryContext: TableZoneContext = { title: 'Library' };

  @Output() cardClicked = new EventEmitter<TableCardClicked>();
  @Output() cardCounterChanged = new EventEmitter<TableCardCounterChanged>();
  @Output() cardMoved = new EventEmitter<TableCardMoved>();

  @ViewChild('battlefieldList', { static: true }) battlefieldList: CdkDropList;
  @ViewChild('landList', { static: true }) landList: CdkDropList;
  @ViewChild('handList', { static: true }) handList: CdkDropList;
  @ViewChild('exileList', { static: true }) exileList: CdkDropList;
  @ViewChild('graveyardList', { static: true }) graveyardList: CdkDropList;
  @ViewChild('libraryList', { static: true }) libraryList: CdkDropList;

  @ViewChild('exileExpansion', { static: true }) exileExpansion: MatExpansionPanel;
  @ViewChild('graveyardExpansion', { static: true }) graveyardExpansion: MatExpansionPanel;
  @ViewChild('libraryExpansion', { static: true }) libraryExpansion: MatExpansionPanel;

  previewAsImage = false;

  // For AoT typechecks in templates
  exileZone = TableZone.Exile;
  graveyardZone = TableZone.Graveyard;
  libraryZone = TableZone.Library;
  battlefieldZone = TableZone.Battlefield;
  landZone = TableZone.Land;

  get allLists() {
    return [this.battlefieldList, this.landList, this.handList, this.exileList, this.graveyardList, this.libraryList];
  }

  constructor(private cardCounter: CardCountService, private changeDetectorRef: ChangeDetectorRef) { }

  onClick(card: Card, zone: TableZone): void {
    this.cardClicked.emit({ card, zone });
  }

  drop(event: CdkDragDrop<Card>): void {
    const card = event.item.data;
    const source = event.previousContainer.id as TableZone;
    const target = event.container.id as TableZone;
    this.cardMoved.emit({ card, source, target });
  }

  updatePreview(asImage: boolean): void {
    this.previewAsImage = asImage;
    this.changeDetectorRef.markForCheck();
  }

  onExpansionMouseenter(target: TableZone, event: MouseEvent): void {
    if (event.buttons !== 1) {
      return;
    }

    if (target === TableZone.Exile) {
      this.exileExpansion.open();
    } else if (target === TableZone.Graveyard) {
      this.graveyardExpansion.open();
    } else if (target === TableZone.Library) {
      this.libraryExpansion.open();
    }
  }

  onCounterChanged(change: number, card: Card, zone: TableZone): void {
    this.cardCounterChanged.emit({ change, card, zone });
  }

  private patchContext(cards: Card[], context: TableZoneContext): void {
    context.cards = this.cardCounter.countAllCards(cards);
    context.count = context.cards.reduce((acc, curr) => acc + curr.numberOf, 0);
  }

  ngOnInit() { }
}
