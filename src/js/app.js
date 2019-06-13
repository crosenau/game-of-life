import Grid from './grid.js';

import { scaleArray } from './scale.js';

import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

import '../styles/style.scss';

const updateiteration = () => {
  const iterDisplay = document.querySelector('#iterations');

  iterDisplay.innerHTML = `Iteration: ${grid.iteration}`;
};

const randomizeGrid = () => {
  stop();
  grid.clearGrid();
  grid.addRandomPopulation();
  updateiteration();
};

const clearGrid = () => {
  stop();
  grid.clearGrid();
  updateiteration();
};

const start = () => {
  if (!grid.animating) {
    playStopButton.innerHTML = 'Stop';
    playStopButton.onclick = stop;

    grid.animating = true;
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
};

const setCellSize = event => {
  stop();
  cellSize = Number(event.target.value);
  grid = new Grid(
    Math.ceil(canvas.width / cellSize), 
    Math.ceil(canvas.height / cellSize),
    trail
  );
  updateiteration();
};

const setTrailLength = event => {
  console.log(event.target.value);
  grid.trail = Number(event.target.value);
  randomizeGrid();
};

const randomizeButton = document.querySelector('#randomize');
const clearButton = document.querySelector('#clear');
const playStopButton = document.querySelector('#play-stop');
const speedInput = document.querySelector('#speed');
const sizeInput = document.querySelector('#size');
const trailInput = document.querySelector('#trail');

randomizeButton.onclick = randomizeGrid;
clearButton.onclick = clearGrid;
playStopButton.onclick = start;
speedInput.onchange = setSpeed;
sizeInput.onchange = setCellSize;
trailInput.onchange = setTrailLength;

let cellSize = Number(sizeInput.value);
let trail = Number(trailInput.value);

let fps = speedInput.value;
let frameInterval = 1000 / fps;
let lastFrame;

const canvas = document.querySelector('canvas');

canvas.width = Number(getComputedStyle(canvas).width.replace('px', ''));
canvas.height = Number(getComputedStyle(canvas).height.replace('px', ''));

const regl = require('regl')(canvas);

let grid = new Grid(
  Math.ceil(canvas.width / cellSize),
  Math.ceil(canvas.height / cellSize),
  trail
);

const drawCells = regl({
  vert: vertexShader,
  frag: fragmentShader,
  attributes: {
    position: (context, props) => {
      // Map screen space coordinates to gl coordinates
      return props.coords.map((coord, i) => {
        const domain = [[0, 0], [grid.cols, grid.rows]];
        const range = [[-1, 1], [1, -1]];
        
        return scaleArray(coord, domain, range);
      });
    },
    color: (context, props) => {
      return props.color.map(color => {
        const r = Math.max(color[0] / 255, 0);
        const g = Math.max(color[1] / 255, 0);
        const b = Math.max(color[2] / 255, 0);

        return [r, g, b];
      });
    }
  },
  uniforms: {
    cellSize: regl.prop('cellSize')
  },
  count: (context, props) => props.coords.length,
  primitive: 'points'
});

regl.frame(() => {
  if (grid.animating) {
    lastFrame = lastFrame ? lastFrame : Date.now();

    const now = Date.now();
    const elapsed = now - lastFrame;

    if (elapsed >= frameInterval) {
      lastFrame = now - (elapsed % frameInterval);

      grid.update();
      updateiteration();
    }
  }
});


window.addEventListener('click', event => {
  if (event.target.id) return;

  const xPos = event.clientX;
  const yPos = event.clientY;

  for (let y = 0; y < grid.rows; y++) {
    const yMin = (y - 0.5) * cellSize + canvas.offsetTop;
    const yMax = yMin + cellSize;

    if (yPos > yMin && yPos < yMax) {
      for (let x = 0; x < grid.cols; x++) {
        const xMin = (x - 1) * cellSize + canvas.offsetLeft;
        const xMax = xMin + cellSize;

        if (xPos > xMin && xPos < xMax) {
          grid.toggleCell(x, y);
        }
      }
    }
  }
});

window.addEventListener('gridupdate', event => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  });

  drawCells({
    coords: grid.getCellCoords(),
    cellSize: cellSize,
    color: grid.getCellColors(),
  });
});