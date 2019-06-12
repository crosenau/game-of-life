import '../css/style.css';
import Grid from './grid.js';

import { scaleArray } from './scale.js';

import vertexShader from 'raw-loader!glslify-loader!../shaders/vertex.glsl';
import fragmentShader from 'raw-loader!glslify-loader!../shaders/fragment.glsl';

const updateGeneration = () => {
  const genDisplay = document.querySelector('#generations');

  genDisplay.innerHTML = `Generation: ${grid.generation}`;
}

const randomizeGrid = () => {
  stop();
  grid.clearGrid();
  grid.addRandomPopulation();
  updateGeneration();
}

const clearGrid = () => {
  stop();
  grid.clearGrid();
  updateGeneration();
}

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
}

const setCellSize = event => {
  stop();
  cellSize = Number(event.target.value) * 2;
  grid = new Grid(
    canvas.width,
    canvas.height,
    Math.ceil(canvas.width / cellSize), 
    Math.ceil(canvas.height / cellSize)
    );
  updateGeneration();
}

const randomizeButton = document.querySelector('#randomize');
const clearButton = document.querySelector('#clear');
const playStopButton = document.querySelector('#play-stop');
const speedInput = document.querySelector('#speed');
const scaleInput = document.querySelector('#size');

randomizeButton.onclick = randomizeGrid;
clearButton.onclick = clearGrid;
playStopButton.onclick = start;
speedInput.onchange = setSpeed;
scaleInput.onchange = setCellSize;

let cellSize = Number(scaleInput.value) * 2;

let fps = speedInput.value;
let frameInterval = 1000 / fps;
let lastFrame;

const canvas = document.querySelector('canvas');

canvas.width = Number(getComputedStyle(canvas).width.replace('px', ''));
canvas.height = Number(getComputedStyle(canvas).height.replace('px', ''));

const regl = require('regl')(canvas);

let grid = new Grid(
  canvas.width,
  canvas.height,
  Math.ceil(canvas.width / cellSize),
  Math.ceil(canvas.height / cellSize)
);

const drawCells = regl({
  vert: vertexShader,
  frag: fragmentShader,
  attributes: {
    position: (context, props) => {
      // Map screen space coordinates to gl coordinates
      return props.coords.map((coord, i) => {
        const domain = [[0, 0], [canvas.width, canvas.height]];
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
    //color: regl.prop('color'),
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
      updateGeneration();
    }
  }
});


window.addEventListener('click', event => {
  const xPos = event.clientX;
  const yPos = event.clientY;

  for (let y = 0; y < grid.rows; y++) {
    const yMin = y * grid.cellSize + canvas.offsetTop;
    const yMax = yMin + grid.cellSize;

    if (yPos > yMin && yPos < yMax) {
      for (let x = 0; x < grid.cols; x++) {
        const xMin = x * grid.cellSize + canvas.offsetLeft;
        const xMax = xMin + grid.cellSize;

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