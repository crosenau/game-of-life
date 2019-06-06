const canvas = document.querySelector('canvas');

//canvas.width = Math.min(window.innerWidth, window.innerHeight) / 1.5;
//canvas.height = canvas.width;

canvas.width = window.innerWidth / 1.1;
canvas.height = window.innerHeight / 1.5;

const ctx = canvas.getContext('2d');

class Grid {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.cellSize = canvas.width / Math.max(rows, cols)
    this.cells = [];
    this.generation = 0;

    this.lastUpdate = null;
    this.animating = false;

    this.buildGrid();
    this.addRandomPopulation();
    this.draw();
  }

  buildGrid() {
    for (let y = 0; y < this.rows; y++) {
      let row = [];
      
      for (let x = 0; x < this.cols; x++) {
        row.push(0);
      }
  
      this.cells.push(row);
    }   
  }

  clearGrid() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.cells[y][x] = 0;
      }
    }

    this.generation = 0;

    if (!this.animating) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.draw();
    }
  }

  addRandomPopulation() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.cells[y][x] = Math.round(Math.random() - 0.1);
      }
    }
  }

  draw() {
    // Fill background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw populated cells
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.cells[y][x] === 1) {
          ctx.fillStyle = 'white';
          ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
  
        }
      }
    }
    
    // Draw grid
    ctx.lineWidth = this.cellSize * 0.05;
    ctx.strokeStyle = 'white';

    for (let y = 0; y <= this.rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.cellSize);
      ctx.lineTo(canvas.width, y * this.cellSize);
      ctx.stroke();
    }

    for (let x = 0; x <= this.cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * this.cellSize, 0);
      ctx.lineTo(x * this.cellSize, canvas.height);
      ctx.stroke();
    }
  }

  adjacentPopulation(x, y) {
    // adjacent cells
    const west = x > 0 ? this.cells[y][x-1] : 0;
    const east = x < this.cols - 1 ? this.cells[y][x+1] : 0;
    const north = y > 0 ? this.cells[y-1][x] : 0;
    const northWest = (y > 0 && x > 0) ? this.cells[y-1][x-1] : 0;
    const northEast = (y > 0 && x < this.cols - 1) ? this.cells[y-1][x+1] : 0;
    const south = y < this.rows - 1 ? this.cells[y+1][x] : 0;
    const southWest = (y < this.rows -1 && x > 0) ? this.cells[y+1][x-1]: 0;
    const southEast = (y < this.rows -1 && x < this.cols - 1) ? this.cells[y+1][x+1] : 0;
  
    const totalPopulation = west + east + north + northWest + northEast + south + southWest + southEast;
    
    return totalPopulation;
  }

  update() {
    const nextGrid = [];

    for (let y = 0; y < this.rows; y++) {
      let row = [];

      for (let x = 0; x < this.cols; x++) {
        const population = this.adjacentPopulation(x, y);
  
        if (this.cells[y][x] === 1) {
          if (population < 2 || population > 3) {
            row.push(0);
          } else {
            row.push(1);
          }
        } else {
          if (population === 3) {
            row.push(1);
          } else {
            row.push(0);
          }
        }
      }

      nextGrid.push(row);
    }
  
    this.cells = nextGrid;
    this.lastUpdate = Date.now();
    this.generation++;
  }

  toggleCell(xPos, yPos) {
    for (let y = 0; y < this.rows; y++) {
      const yMin = y * this.cellSize + canvas.offsetTop;
      const yMax = yMin + this.cellSize;

      if (!(yPos > yMin && yPos < yMax)) {
        continue;
      }

      for (let x = 0; x < this.cols; x++) {
        const xMin = x * this.cellSize + canvas.offsetLeft;
        const xMax = xMin + this.cellSize;

        if (xPos > xMin && xPos < xMax) {
          this.cells[y][x] = this.cells[y][x] ? 0 : 1;

          if (!this.animating) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.draw();
          }
        }
      }
    }
  }
}

const scaleInput = document.querySelector('#size');

let cellScale = Number(scaleInput.value);

let grid = new Grid(Math.ceil(canvas.width / cellScale), Math.ceil(canvas.height / cellScale));
console.log(grid);

addEventListener('mousedown', (event) => grid.toggleCell(event.clientX, event.clientY))

const speedInput = document.querySelector('#speed');

let fps = Number(speedInput.value);

const animate = () => {
  if (grid.animating) {    
    const frameDelay = 1000 / fps;
    
    if (Date.now() - grid.lastUpdate >= frameDelay) {      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      grid.update();
      grid.draw();

      updateGeneration();
    }

    requestAnimationFrame(animate);
  }
}

const updateGeneration = () => {
  const gen = document.querySelector('#generations');

  gen.innerHTML = `Generation: ${grid.generation}`;
}

const randomizeGrid = () => {
  grid.clearGrid();
  grid.addRandomPopulation();
  grid.draw();
}

const clearGrid = () => {
  grid.clearGrid();
  updateGeneration();
}

const start = () => {
  if (!grid.animating) {
    const btn = document.querySelector('#play-stop');

    btn.innerHTML = 'Stop';
    btn.onclick = stop;

    grid.animating = true;
      
    animate();
  }
};

const stop = () => {
  if (grid.animating) {
    const btn = document.querySelector('#play-stop');
  
    btn.innerHTML = 'Play';
    btn.onclick = start;
  
    grid.animating = false;
  }
};

const updateSpeed = event => fps = Number(event.value);

const updateCellScale = event => {
  stop();
  cellScale = Number(event.value);
  grid = new Grid(Math.ceil(canvas.width / cellScale), Math.ceil(canvas.height / cellScale));
}