const canvas = document.querySelector('canvas');

canvas.width = Math.min(window.innerWidth, window.innerHeight) / 1.5;
canvas.height = canvas.width;

const ctx = canvas.getContext('2d');

const gridWidth = 40;
const gridHeight = 40;

let grid = buildGrid(gridWidth, gridHeight);

console.log(grid);

// add life
grid[19][20] = 1;
grid[19][21] = 1;
grid[19][22] = 1;
grid[19][23] = 1;
grid[19][24] = 1;
grid[19][25] = 1;
grid[19][26] = 1;
grid[19][27] = 1;
grid[19][28] = 1;
grid[19][29] = 1;


const fps = 6;

let lastUpdate = Date.now();

animate();

function buildGrid(columns, rows) {
  let grid = [];

  for (let y = 0; y < rows; y++) {
    let row = [];
    
    for (let x = 0; x < columns; x++) {
      row.push(0);
    }

    grid.push(row);
  }

  return grid;
}

function drawGrid() {
  const cellSize = canvas.width / Math.max(gridWidth, gridHeight);

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      ctx.fillStyle = grid[y][x] === 0 ? '#444' : 'white';
      ctx.strokeStyle = grid[y][x] === 0 ? 'white' : 'black';

      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

function adjacentLife(x, y) {
  // adjacent cells
  const west = x > 0 ? grid[y][x-1] : 0;
  const east = x < gridWidth - 1 ? grid[y][x+1] : 0;
  const north = y > 0 ? grid[y-1][x] : 0;
  const northWest = (y > 0 && x > 0) ? grid[y-1][x-1] : 0;
  const northEast = (y > 0 && x < gridWidth - 1) ? grid[y-1][x+1] : 0;
  const south = y < gridHeight - 1 ? grid[y+1][x] : 0;
  const southWest = (y < gridHeight -1 && x > 0) ? grid[y+1][x-1]: 0;
  const southEast = (y < gridHeight -1 && x < gridWidth - 1) ? grid[y+1][x+1] : 0;

  const totalLife = west + east + north + northWest + northEast + south + southWest + southEast;

  //console.log(x, y, grid[y][x]);
  //console.log(totalLife);

  return totalLife;
}

function update() {
  console.log('update')
  const nextGrid = buildGrid(gridWidth, gridHeight);

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const totalLife = adjacentLife(x, y);

      if (grid[y][x] === 1) {
        if (totalLife < 2 || totalLife > 3) {
          nextGrid[y][x] = 0;
        } else {
          nextGrid[y][x] = 1;
        }
      } else if (totalLife === 3) {
        nextGrid[y][x] = 1;
      }

    }
  }

  grid = nextGrid;
}

function animate() {
  requestAnimationFrame(animate);
  
  const frameDelay = 1000 / fps;
  
  if (Date.now() - lastUpdate >= frameDelay) {
    lastUpdate = Date.now();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    update();
  }
}