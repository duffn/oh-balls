/**
 * Adapted from the original source code by Emanuele Feronato
 * https://www.emanueleferonato.com/2023/08/25/pure-typescript-class-with-no-depencencies-to-handle-draw-and-match-games-in-just-a-few-lines-full-phaser-example/
 */

interface DrawAndMatchConfig {
  rows?: number;
  columns?: number;
  items?: number;
  tileSize?: number;
  startX?: number;
  startY?: number;
  insideEnough?: number;
  minChain?: number;
}

interface GameConfig {
  rows: number;
  columns: number;
  items: number;
  tileSize: number;
  startX: number;
  startY: number;
  insideEnough: number;
  minChain: number;
}

interface DrawAndMatchTile {
  empty: boolean;
  value: number;
  item: DrawAndMatchItem;
}

interface DrawAndMatchCoordinate {
  row: number;
  column: number;
}

export enum DrawAndMatchDirection {
  NONE = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 4,
  UP = 8
}

export class DrawAndMatch {
  static readonly DEFALUT_VALUES: GameConfig = {
    rows: 6,
    columns: 8,
    items: 6,
    tileSize: 100,
    startX: 0,
    startY: 0,
    insideEnough: 0.4,
    minChain: 3
  };

  config: GameConfig;
  gameArray: DrawAndMatchTile[][];
  chain: DrawAndMatchCoordinate[];
  itemPool: DrawAndMatchItem[];
  chainValue: number;
  previousChainLength: number;

  constructor(options?: DrawAndMatchConfig) {
    this.config = {
      rows:
        options === undefined || options.rows === undefined
          ? DrawAndMatch.DEFALUT_VALUES.rows
          : options.rows,
      columns:
        options === undefined || options.columns === undefined
          ? DrawAndMatch.DEFALUT_VALUES.columns
          : options.columns,
      items:
        options === undefined || options.items === undefined
          ? DrawAndMatch.DEFALUT_VALUES.items
          : options.items,
      tileSize:
        options === undefined || options.tileSize === undefined
          ? DrawAndMatch.DEFALUT_VALUES.tileSize
          : options.tileSize,
      startX:
        options === undefined || options.startX === undefined
          ? DrawAndMatch.DEFALUT_VALUES.startX
          : options.startX,
      startY:
        options === undefined || options.startY === undefined
          ? DrawAndMatch.DEFALUT_VALUES.startY
          : options.startY,
      insideEnough:
        options === undefined || options.insideEnough === undefined
          ? DrawAndMatch.DEFALUT_VALUES.insideEnough
          : options.insideEnough,
      minChain:
        options === undefined || options.minChain === undefined
          ? DrawAndMatch.DEFALUT_VALUES.minChain
          : options.minChain
    };
    this.gameArray = [];
    for (let i: number = 0; i < this.config.rows; i++) {
      this.gameArray[i] = [];
      for (let j: number = 0; j < this.config.columns; j++) {
        let randomValue: number = Math.floor(Math.random() * this.config.items);
        this.gameArray[i][j] = {
          empty: false,
          value: randomValue,
          item: new DrawAndMatchItem(
            i,
            j,
            randomValue,
            this.config.startX + j * this.config.tileSize,
            this.config.startY + i * this.config.tileSize,
            this.config.tileSize
          )
        };
      }
    }
    this.chain = [];
    this.previousChainLength = 0;
  }

  /* get all game items */
  get items(): DrawAndMatchItem[] {
    let items: DrawAndMatchItem[] = [];
    for (let i: number = 0; i < this.config.rows; i++) {
      for (let j: number = 0; j < this.config.columns; j++) {
        items.push(this.gameArray[i][j].item);
      }
    }
    return items;
  }

  /* output the chain in the console */
  logChain(): void {
    let output: string = '';
    this.chain.forEach((coordinate: DrawAndMatchCoordinate, index: number) => {
      output += '[' + coordinate.row + ', ' + coordinate.column + ']';
      if (index < this.chain.length - 1) {
        output += ' -> ';
      }
    });
    console.log(output);
  }

  /* output board values in console */
  logBoard(): void {
    let output: string = '';
    for (let i: number = 0; i < this.config.rows; i++) {
      for (let j: number = 0; j < this.config.columns; j++) {
        output +=
          (this.gameArray[i][j].empty ? '.' : this.gameArray[i][j].value) + ' ';
      }
      output += '\n';
    }
    console.log(output);
  }

  /* check a pick is in a valid row and column */
  private validPick(row: number, column: number): boolean {
    return (
      row >= 0 &&
      row < this.config.rows &&
      column >= 0 &&
      column < this.config.columns &&
      this.gameArray[row] != undefined &&
      this.gameArray[row][column] != undefined
    );
  }

  /* check if input is inside game board */
  private isInputInsideBoard(x: number, y: number): boolean {
    let column: number = Math.floor(
      (x - this.config.startX) / this.config.tileSize
    );
    let row: number = Math.floor(
      (y - this.config.startY) / this.config.tileSize
    );
    return this.validPick(row, column);
  }

  /* handle input movement */
  handleInputMovement(x: number, y: number): DrawAndMatchItem[] {
    let items: DrawAndMatchItem[] = [];
    if (this.isInputInsideBoard(x, y)) {
      if (this.isInsideEnough(x, y)) {
        if (this.isCoordinateInChain(x, y)) {
          if (this.isBacktrack(x, y)) {
            let removedTile: DrawAndMatchCoordinate =
              this.chain.pop() as DrawAndMatchCoordinate;
            let removedItem: DrawAndMatchItem =
              this.gameArray[removedTile.row][removedTile.column].item;
            removedItem.selected = false;
            removedItem.arrowVisible = false;
            items.push(removedItem);
            let lastTile: DrawAndMatchCoordinate =
              this.chain[this.chain.length - 1];
            let lastItem: DrawAndMatchItem =
              this.gameArray[lastTile.row][lastTile.column].item;
            lastItem.selected = true;
            lastItem.arrowVisible = false;
            items.push(lastItem);
          }
        } else {
          if (this.canContinueChain(x, y) && this.isChainValue(x, y)) {
            this.chain.push(this.getCoordinateAt(x, y));
            let addedTile: DrawAndMatchCoordinate =
              this.chain[this.chain.length - 1];
            let addedItem: DrawAndMatchItem =
              this.gameArray[addedTile.row][addedTile.column].item;
            addedItem.selected = true;
            addedItem.arrowVisible = false;
            items.push(addedItem);
            let formerLastTile: DrawAndMatchCoordinate =
              this.chain[this.chain.length - 2];
            let formerLastItem: DrawAndMatchItem =
              this.gameArray[formerLastTile.row][formerLastTile.column].item;
            formerLastItem.selected = false;
            formerLastItem.arrowVisible = true;
            formerLastItem.arrowDirection = this.getArrowDirection(
              this.chain.length - 2
            );
            items.push(formerLastItem);
          }
        }
      }
    }
    return items;
  }

  /* get arrow direction */
  private getArrowDirection(index: number): number {
    let coordinate1: DrawAndMatchCoordinate = this.chain[index + 1];
    let coordinate2: DrawAndMatchCoordinate = this.chain[index];
    let deltaRow: number = coordinate1.row - coordinate2.row;
    let deltaColumn: number = coordinate1.column - coordinate2.column;
    let direction: number = 0;
    direction +=
      deltaColumn < 0
        ? DrawAndMatchDirection.LEFT
        : deltaColumn > 0
          ? DrawAndMatchDirection.RIGHT
          : 0;
    direction +=
      deltaRow < 0
        ? DrawAndMatchDirection.UP
        : deltaRow > 0
          ? DrawAndMatchDirection.DOWN
          : 0;
    return direction;
  }

  /* check if a movement coordinate is a backtrack */
  private isBacktrack(x: number, y: number): boolean {
    if (this.chain.length > 1) {
      let currentCoordinate: DrawAndMatchCoordinate = this.getCoordinateAt(
        x,
        y
      );
      let backtrackCoordinate: DrawAndMatchCoordinate =
        this.getChainBacktrack();
      return (
        currentCoordinate.row == backtrackCoordinate.row &&
        currentCoordinate.column == backtrackCoordinate.column
      );
    }
    return false;
  }

  /* get the chain head */
  private getChainHead(): DrawAndMatchCoordinate {
    return this.chain[this.chain.length - 1];
  }

  /* get chain backtrack item */
  private getChainBacktrack(): DrawAndMatchCoordinate {
    return this.chain[this.chain.length - 2];
  }

  /* check if a coordinate can continue the chain */
  private canContinueChain(x: number, y: number): boolean {
    let currentCoordinate: DrawAndMatchCoordinate = this.getCoordinateAt(x, y);
    let previousCoordinate: DrawAndMatchCoordinate = this.getChainHead();

    if (!previousCoordinate) {
      return false;
    }

    let rowDifference: number = Math.abs(
      currentCoordinate.row - previousCoordinate.row
    );
    let columnDifference: number = Math.abs(
      currentCoordinate.column - previousCoordinate.column
    );
    return (
      rowDifference + columnDifference == 1 ||
      (rowDifference == 1 && columnDifference == 1)
    );
  }

  /* check if a coordinate matches chain value */
  private isChainValue(x: number, y: number): boolean {
    let coordinate: DrawAndMatchCoordinate = this.getCoordinateAt(x, y);
    return (
      this.gameArray[coordinate.row][coordinate.column].value == this.chainValue
    );
  }

  /* start the chain */
  startChain(x: number, y: number): DrawAndMatchItem | null {
    if (this.isInputInsideBoard(x, y)) {
      let coordinate: DrawAndMatchCoordinate = this.getCoordinateAt(x, y);
      this.chain.push(coordinate);
      this.chainValue = this.gameArray[coordinate.row][coordinate.column].value;
      return this.gameArray[coordinate.row][coordinate.column].item;
    }
    return null;
  }

  /* check if a coordinate is in the chain */
  private isCoordinateInChain(x: number, y: number): boolean {
    let result: boolean = false;
    let currentCoordinate: DrawAndMatchCoordinate = this.getCoordinateAt(x, y);
    this.chain.forEach((coordinate: DrawAndMatchCoordinate) => {
      if (
        currentCoordinate.row == coordinate.row &&
        currentCoordinate.column == coordinate.column
      ) {
        result = true;
      }
    });
    return result;
  }

  /* check if a coordinate is inside enough to be considered an actual item selection */
  private isInsideEnough(x: number, y: number): boolean {
    let coordinate: DrawAndMatchCoordinate = this.getCoordinateAt(x, y);
    let centerX: number =
      coordinate.column * this.config.tileSize +
      this.config.startX +
      this.config.tileSize / 2;
    let centerY: number =
      coordinate.row * this.config.tileSize +
      this.config.startY +
      this.config.tileSize / 2;
    let distanceX: number = centerX - x;
    let distanceY: number = centerY - y;
    let maxDistance: number = this.config.insideEnough * this.config.tileSize;
    return (
      distanceX * distanceX + distanceY * distanceY <= maxDistance * maxDistance
    );
  }

  /* get the screen coordinate, given a draw and match coordinate */
  private getCoordinateAt(x: number, y: number): DrawAndMatchCoordinate {
    return {
      row: Math.floor((y - this.config.startY) / this.config.tileSize),
      column: Math.floor((x - this.config.startX) / this.config.tileSize)
    };
  }

  /* remove items */
  removeItems(): DrawAndMatchItem[] {
    this.itemPool = [];
    let items: DrawAndMatchItem[] = [];
    this.chain.forEach((coordinate: DrawAndMatchCoordinate) => {
      this.gameArray[coordinate.row][coordinate.column].item.toBeRemoved =
        this.chain.length >= this.config.minChain;
      items.push(this.gameArray[coordinate.row][coordinate.column].item);
      if (this.chain.length >= this.config.minChain) {
        this.gameArray[coordinate.row][coordinate.column].empty = true;
        this.itemPool.push(
          this.gameArray[coordinate.row][coordinate.column].item
        );
      }
    });
    this.chain = [];
    return items;
  }

  /* calculate how many empty spaces there are below (row, column) */
  private emptySpacesBelow(row: number, column: number): number {
    let result: number = 0;
    if (row != this.config.rows) {
      for (let i: number = row + 1; i < this.config.rows; i++) {
        if (this.gameArray[i][column].empty) {
          result++;
        }
      }
    }
    return result;
  }

  /* arrange the board after a draw */
  arrangeBoard(): DrawAndMatchItem[] {
    let result: DrawAndMatchItem[] = [];
    for (let i: number = this.config.rows - 2; i >= 0; i--) {
      for (let j: number = 0; j < this.config.columns; j++) {
        let emptySpaces: number = this.emptySpacesBelow(i, j);
        if (!this.gameArray[i][j].empty && emptySpaces > 0) {
          let item: DrawAndMatchItem = this.gameArray[i][j].item;
          item.row += emptySpaces;
          let movement: DrawAndMatchMovement = new DrawAndMatchMovement(
            item.posX,
            item.posY,
            item.posX,
            item.posY + emptySpaces * this.config.tileSize,
            emptySpaces,
            this.config.tileSize
          );
          item.posY += emptySpaces * this.config.tileSize;
          item.movement = movement;
          result.push(item);
          let tempTile: DrawAndMatchTile = this.gameArray[i + emptySpaces][j];
          this.gameArray[i + emptySpaces][j] = this.gameArray[i][j];
          this.gameArray[i][j] = tempTile;
        }
      }
    }
    for (let i: number = 0; i < this.config.columns; i++) {
      if (this.gameArray[0][i].empty) {
        let emptySpaces: number = this.emptySpacesBelow(0, i) + 1;
        for (let j: number = emptySpaces - 1; j >= 0; j--) {
          let randomValue: number = Math.floor(
            Math.random() * this.config.items
          );
          let item: DrawAndMatchItem =
            this.itemPool.shift() as DrawAndMatchItem;
          item.value = randomValue;
          item.row = j;
          item.column = i;
          let movement: DrawAndMatchMovement = new DrawAndMatchMovement(
            this.config.startX + i * this.config.tileSize,
            this.config.startY - (emptySpaces - j) * this.config.tileSize,
            this.config.startX + i * this.config.tileSize,
            this.config.startY + j * this.config.tileSize,
            emptySpaces,
            this.config.tileSize
          );
          item.posY = this.config.startY + j * this.config.tileSize;
          item.posX = this.config.startX + i * this.config.tileSize;
          item.movement = movement;
          result.push(item);
          this.gameArray[j][i].item = item;
          this.gameArray[j][i].value = randomValue;
          this.gameArray[j][i].empty = false;
        }
      }
    }
    return result;
  }
}

export class DrawAndMatchItem {
  row: number;
  column: number;
  value: number;
  data: any;
  posX: number;
  posY: number;
  size: number;
  centerX: number;
  centerY: number;
  selected: boolean;
  arrowVisible: boolean;
  arrowDirection: number;
  movement: DrawAndMatchMovement;
  toBeRemoved: boolean;

  constructor(
    row: number,
    column: number,
    value: number,
    posX: number,
    posY: number,
    size: number
  ) {
    this.row = row;
    this.column = column;
    this.value = value;
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.centerX = posX + size / 2;
    this.centerY = posY + size / 2;
    this.selected = false;
    this.arrowVisible = false;
    this.arrowDirection = DrawAndMatchDirection.NONE;
  }

  setData(data: any): void {
    this.data = data;
  }
}

class DrawAndMatchMovement {
  startX: number;
  startY: number;
  startCenterX: number;
  startCenterY: number;
  endX: number;
  endY: number;
  endCenterX: number;
  endCenterY: number;
  deltaRow: number;

  constructor(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    deltaRow: number,
    size: number
  ) {
    this.startX = startX;
    this.startY = startY;
    this.startCenterX = startX + size / 2;
    this.startCenterY = startY + size / 2;
    this.endX = endX;
    this.endY = endY;
    this.endCenterX = endX + size / 2;
    this.endCenterY = endY + size / 2;
    this.deltaRow = deltaRow;
  }
}
