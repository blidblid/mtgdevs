import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-data-grid'
  }
})
export class DataGridComponent implements OnInit {

  @Input()
  xAxisCategories: string[];

  @Input()
  yAxisCategories: string[];

  @Input()
  get data() {
    return this._data;
  }
  set data(value: number[][]) {
    this._data = value;
    this.buildGrid();
  }
  private _data: number[][];

  @Input()
  decimals: number = 1;

  /** Grid of data and categories displayed in the template. */
  grid: string[][];

  gridStyle: { [key: string]: string; };

  private buildGrid(): void {
    if (!this.data) {
      return;
    }

    let grid = this.data.map(row => {
      return row.map(val => val === 0 ? '-' : (Math.round(val * 100) / 100).toString());
    });

    // Add y-axis categories to grid.
    if (this.yAxisCategories) {
      grid.forEach((row, index) => {
        const yAxisCategories = this.yAxisCategories.slice();
        if (yAxisCategories[index]) {
          row.unshift(yAxisCategories[index]);
        }
      })
    }

    // Add x-axis categories to grid.
    if (this.xAxisCategories) {
      const xCategories = this.xAxisCategories.slice();
      xCategories.unshift('');
      grid.unshift(xCategories);
    }

    this.grid = grid;
  }

  private buildCssGrid(): void {
    this.gridStyle = {
      'grid-template-columns': `2fr repeat(${this.xAxisCategories.length}, 1fr)`
    };
  }

  ngOnInit() {
    this.buildGrid();
    this.buildCssGrid();
  }
}
