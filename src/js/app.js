const style = require('../css/style.css');

class Grid {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.cells = [];
    this.cellSize = canvas.width > canvas.height 
      ? canvas.width / Math.max(rows, cols) 
      : canvas.height / Math.max(rows, cols);
    
    this.generation = 0;
    this.life = 20; // value representing live cell
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
        this.cells[y][x] = Math.round(Math.random() - 0.1) * this.life;
      }
    }
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw populated cells
    const r = 255;
    const g = 240;
    const b = 160;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.cells[y][x] === this.life) {
          ctx.fillStyle = `rgba(${r}, ${g}, ${b})`;
          ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        } else if (this.cells[y][x] > 0) {
          const value = this.cells[y][x];
          
          ctx.fillStyle =
            `rgb(${(value / this.life) * r}, ${(value / this.life) * g * 0.3}, ${(value / this.life) * b * 0.05})`
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
    const south = y < this.rows - 1 ? this.cells[y+1][x] : 0;
    const northWest = (y > 0 && x > 0) ? this.cells[y-1][x-1] : 0;
    const northEast = (y > 0 && x < this.cols - 1) ? this.cells[y-1][x+1] : 0;
    const southWest = (y < this.rows -1 && x > 0) ? this.cells[y+1][x-1]: 0;
    const southEast = (y < this.rows -1 && x < this.cols - 1) ? this.cells[y+1][x+1] : 0;
  
    const totalPopulation = [west, east, north, northWest, northEast, south, southWest, southEast].filter(val => val === this.life).length;
    
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
          this.cells[y][x] = this.cells[y][x] > 0 ? 0 : this.life;

          if (!this.animating) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.draw();
          }
        }
      }
    }
  }
}

const updateGeneration = () => {
  const genDisplay = document.querySelector('#generations');

  genDisplay.innerHTML = `Generation: ${grid.generation}`;
}

const randomizeGrid = () => {
  stop();
  grid.clearGrid();
  grid.addRandomPopulation();
  grid.draw();
  updateGeneration();
}

const clearGrid = () => {
  stop();
  grid.clearGrid();
  updateGeneration();
}

const start = () => {
  if (!grid.animating) {
    //const btn = document.querySelector('#play-stop');

    playStopButton.innerHTML = 'Stop';
    playStopButton.onclick = stop;

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

const setSpeed = event => {
  fps = Number(event.target.value);
  frameInterval = 1000 / fps;
  lastFrame = Date.now();
}

const setCellScale = event => {
  stop();
  cellScale = Number(event.target.value) * 2;
  grid = new Grid(Math.ceil(canvas.width / cellScale), Math.ceil(canvas.height / cellScale));
  updateGeneration();
}

const animate = () => {
  if (grid.animating) {
    lastFrame = lastFrame ? lastFrame : Date.now();

    const now = Date.now();
    const elapsed = now - lastFrame;

    if (elapsed >= frameInterval) {      
      lastFrame = now - (elapsed % frameInterval);

      grid.update();
      grid.draw();

      updateGeneration();
    }

    requestAnimationFrame(animate);
  }
}


window.addEventListener('click', (event) => grid.toggleCell(event.clientX, event.clientY))

const randomizeButton = document.querySelector('#randomize');
const clearButton = document.querySelector('#clear');
const playStopButton = document.querySelector('#play-stop');
const speedInput = document.querySelector('#speed');
const scaleInput = document.querySelector('#size');

randomizeButton.onclick = randomizeGrid;
clearButton.onclick = clearGrid;
playStopButton.onclick = start;
speedInput.onchange = setSpeed;
scaleInput.onchange = setCellScale;

let cellScale = Number(scaleInput.value) * 2;

let fps = speedInput.value;
let frameInterval = 1000 / fps;
let lastFrame;

const canvas = document.querySelector('canvas');

//canvas.width = Math.ceil(window.innerWidth * 0.85);
//canvas.height = Math.ceil(window.innerHeight * 0.65);
canvas.width = Number(getComputedStyle(canvas).width.replace('px', ''));
canvas.height = Number(getComputedStyle(canvas).height.replace('px', ''));

const ctx = canvas.getContext('2d');

let grid = new Grid(Math.ceil(canvas.width / cellScale), Math.ceil(canvas.height / cellScale));
