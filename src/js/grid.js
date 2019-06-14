import { scaleArray } from './scale';

export default class Grid {
  constructor(cols, rows, trail = 100) {
    this.cols = cols;
    this.rows = rows;
    this.cells = [];
    
    this.iteration = 0;
    this.life = trail; // Represents live cell. Anything lower is transitioning to dead (0). Used for color trail.

    this.gridEvent = new Event('gridupdate')
  
    this.buildGrid();
    this.addRandomPopulation();
  }

  set trail(num) {
    this.life = num > 0 ? num : this.life;
  }

  buildGrid() {
    for (let y = 0; y < this.rows; y++) {
      let row = [];
      
      for (let x = 0; x < this.cols; x++) {
        row.push(0);
      }
  
      this.cells.push(row);
    }

    setTimeout(() => window.dispatchEvent(this.gridEvent), 100);
  }

  clearGrid() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.cells[y][x] = 0;
      }
    }

    this.iteration = 0;

    window.dispatchEvent(this.gridEvent);
  }

  addRandomPopulation() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.cells[y][x] = Math.round(Math.random() - 0.1) * this.life;
      }
    }

    window.dispatchEvent(this.gridEvent);
  }

  getCellCoords() {
    // Return an array of coords for each cell that is not 0 (dead/empty)
    const coords = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.cells[y][x] > 0) {
          coords.push([x, y]);
        }
      }
    }

    return coords;
  }

  getCellColors() {
    const colors = [];

    const cellValueRange = [[1, 1, 1], [this.life-1, this.life-1, this.life-1]];
    const colorRange = [[-500, -2000, 10], [255, 230, 150]];

    const colorMap = [];

    for (let val = 0; val <= this.life; val++) {
      colorMap.push(scaleArray([val, val, val], cellValueRange, colorRange));
    }

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.cells[y][x] === this.life) {
          colors.push([255, 250, 245]);
        } else if (this.cells[y][x] > 0) {
          colors.push(colorMap[this.cells[y][x]]);
        }
      }
    }

    return colors;
  }

  adjacentPopulation(x, y) {
    // adjacent cells
    const w = x > 0 ? this.cells[y][x-1] : 0;
    const e = x < this.cols - 1 ? this.cells[y][x+1] : 0;
    const n = y > 0 ? this.cells[y-1][x] : 0;
    const s = y < this.rows - 1 ? this.cells[y+1][x] : 0;
    const nw = (y > 0 && x > 0) ? this.cells[y-1][x-1] : 0;
    const ne = (y > 0 && x < this.cols - 1) ? this.cells[y-1][x+1] : 0;
    const sw = (y < this.rows -1 && x > 0) ? this.cells[y+1][x-1]: 0;
    const se = (y < this.rows -1 && x < this.cols - 1) ? this.cells[y+1][x+1] : 0;
  
    const totalPopulation = [w, e, n, s, nw, ne, sw, se].filter(val => val === this.life).length;
    
    return totalPopulation;
  }

  update() {
    const nextGrid = [];

    for (let y = 0; y < this.rows; y++) {
      let row = [];

      for (let x = 0; x < this.cols; x++) {
        const population = this.adjacentPopulation(x, y);
        let nextValue;

        if (this.cells[y][x] === this.life) {
          if (population < 2 || population > 3) {
            nextValue = this.cells[y][x] - 1;
          } else {
            nextValue = this.life;
          }
        } else {
          if (population === 3) {
            nextValue = this.life;
          } else {
            nextValue = this.cells[y][x] - 1;
          }
        }

        nextValue = nextValue >= 0 ? nextValue : 0;
        row.push(nextValue);
      }

      nextGrid.push(row);
    }
    
    this.cells = nextGrid;
    this.iteration++;
    
    window.dispatchEvent(this.gridEvent);
  }

  toggleCell(x, y) {
    this.cells[y][x] = this.cells[y][x] === this.life ? 0 : this.life;

    window.dispatchEvent(this.gridEvent);
  }
}