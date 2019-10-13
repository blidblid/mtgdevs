import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TopEightService, Position } from './top-eight.service';


@Component({
  selector: 'app-top-eight',
  templateUrl: './top-eight.component.html',
  styleUrls: ['./top-eight.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'app-top-eight'
  }
})
export class TopEightComponent implements AfterViewInit, OnDestroy, OnInit {

  readonly maxRounds = 20;
  readonly maxPlayers = 10000;
  readonly hintText = 'Fill in your W/D/L to check your chances.';

  input: FormGroup = new FormGroup({
    numberOfPlayers: new FormControl('',
      [Validators.required, Validators.min(1), Validators.max(this.maxPlayers), Validators.pattern(/^[0-9]+$/)]),
    numberOfRounds: new FormControl('',
      [Validators.required, Validators.min(1), Validators.max(this.maxRounds), Validators.pattern(/^[0-9]+$/)])
  });

  filter: FormGroup = new FormGroup({
    resultAfterRound: new FormControl('', [Validators.required])
  });

  displayedColumns = ['position', 'wins', 'losses'];
  dataSource: MatTableDataSource<Position>;

  private destroySub: Subject<void> = new Subject();

  constructor(private topEightService: TopEightService) {
    this.dataSource = new MatTableDataSource();
  }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  private subscribeToForm(): void {
    const input$ = this.input.valueChanges.pipe(
      takeUntil(this.destroySub)
    );

    const numberOfPlayers$ = this.input.get('numberOfPlayers').valueChanges.pipe(
      takeUntil(this.destroySub)
    );

    const filter$ = this.filter.valueChanges.pipe(
      takeUntil(this.destroySub)
    );

    input$.subscribe(value => {
      if (this.input.valid) {
        this.topEightService.calculate(value.numberOfPlayers, value.numberOfRounds);
        this.filter.patchValue({ resultAfterRound: value.numberOfRounds });
      }
    });

    numberOfPlayers$.subscribe(value => {
      let counter = 0;
      while (value > 1) {
        value = Math.ceil(value / 2);
        counter++;
      }

      this.input.get('numberOfRounds').setValue(counter, { emitEvent: false });
    });

    filter$.subscribe(filter => {
      this.topEightService.emitPositionTreeAfterRound(filter.resultAfterRound);
    });
  }

  private subscribeToResults(): void {
    this.topEightService.positionResultUpdate.pipe(takeUntil(this.destroySub)).subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.destroySub.next();
  }

  ngOnInit() {
    this.subscribeToForm();
    this.subscribeToResults();
  }
}
