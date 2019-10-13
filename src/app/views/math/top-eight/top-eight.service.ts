import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class TopEightService {

  /** Observable of the result at the current round. */
  get positionResultUpdate(): Observable<Position[]> {
    return this.positionResultUpdateSub.asObservable();
  }
  private positionResultUpdateSub: Subject<Position[]> = new Subject();

  private resultTree: number[][];

  private positionTree: Position[][];

  calculate(numberOfPlayers: number, numberOfRounds: number): void {
    this.createResultTree(numberOfPlayers, numberOfRounds);
    this.resultTreeToPositionTree();
    this.emitPositionTreeAfterRound(numberOfRounds);
  }

  emitPositionTreeAfterRound(round: number): void {
    if (round <= 0 || (round - 1) >= this.positionTree.length) {
      return;
    }

    this.positionResultUpdateSub.next(this.positionTree[round - 1]);
  }

  private createResultTree(numberOfPlayers: number, numberOfRounds: number): void {
    this.resultTree = [];
    let result = [Math.ceil(numberOfPlayers / 2), Math.floor(numberOfPlayers / 2)];
    let newResult: number[];
    let fromLeft: number;
    let fromRight: number;
    let sum: number;
    this.resultTree.push(result);

    for (let i = 1; i < numberOfRounds; i++) {
      newResult = [];
      sum = 0;

      for (let j = 0; j < result.length + 1; j++) {

        if (sum % 2) {
          fromLeft = result[j - 1] ? (Math.floor(result[j - 1] / 2)) : 0;
          fromRight = result[j] ? (Math.floor(result[j] / 2)) : 0;
        } else {
          fromLeft = result[j - 1] ? (Math.ceil(result[j - 1] / 2)) : 0;
          fromRight = result[j] ? (Math.ceil(result[j] / 2)) : 0;
        }

        sum += result[j] ? result[j] : 0;

        newResult.push(fromLeft + fromRight);
      }

      result = newResult;
      this.resultTree.push(result);
    }
  }

  private resultTreeToPositionTree() {
    this.positionTree = [];

    for (let results of this.resultTree) {
      const positions: Position[] = [];
      let position = 0;

      for (let j = 0; j < results.length; j++) {
        for (let k = 0; k < results[j]; k++) {
          position++;
          positions.push({
            position: position,
            wins: results.length - j - 1,
            draws: 0,
            losses: j
          });
        }
      }

      this.positionTree.push(positions);
    }
  }
}

export interface Position {
  position: number;
  wins: number;
  draws: number;
  losses: number;
}
