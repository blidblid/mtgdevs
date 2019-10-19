import { Injectable } from '@angular/core';

import * as Fuse from 'fuse.js';


@Injectable({ providedIn: 'root' })
export class FuseJsService<T> {

  private fuseOptions = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1
  };

  private fuse: Fuse<T>;
  private previousDictionaryLength: number;

  search(searchFor: string, list: T[], keys: (keyof T)[]): T[] {
    const fuse = this.getFuse(list, keys);
    this.updateCollection(list);

    return fuse.search(searchFor);
  }

  private getFuse(list: T[], keys: (keyof T)[]): Fuse<T> {
    if (this.fuse) {
      return this.fuse;
    }

    const options: Fuse.FuseOptions<T> = {
      ...this.fuseOptions,
      keys
    };

    this.fuse = new Fuse(list, options);
    return this.fuse;
  }

  private updateCollection(list: T[]): void {
    if (this.previousDictionaryLength !== list.length) {
      this.fuse.setCollection(list);
      this.previousDictionaryLength = list.length;
    }
  }
}
