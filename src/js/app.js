import Grid from './grid.js';

import { scaleArray } from './scale.js';

import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

import '../styles/style.scss';
import '@fortawesome/fontawesome-free/js/all.js';

const updateiteration = () => {
  const iterDisplay = document.querySelector('#iterations');

  iterDisplay.innerHTML = `Iteration: ${grid.iteration}`;
};

const randomizeGrid = () => {
  grid.clearGrid();
  grid.addRandomPopulation();
  updateiteration();
};

const clearGrid = () => {
  grid.clearGrid();
  updateiteration();
};

const start = () => {
  if (!animating) {
    startStopBtn.innerHTML = 'Stop';
    startStopBtn.onclick = stop;

    animating = true;
  }
};

const stop = () => {
  if (animating) { 
    startStopBtn.innerHTML = 'Start';
    startStopBtn.onclick = start;
  
    animating = false;
    lastFrame = null;
  }
};

const setSpeed = event => {
  fps = Number(event.target.value);
  lastFrame = Date.now();
};

const setCellSize = event => {
  grid = new Grid(
    Math.ceil(canvas.width / Number(sizeInput.value)), 
    Math.ceil(canvas.height / Number(sizeInput.value)),
    Number(trailInput.value)
  );
  updateiteration();
};

const setTrailLength = event => {
  grid.trail = Number(event.target.value);
  randomizeGrid();
};

const setFilter = event => {
  console.log(event.target.checked);
  if (event.target.checked) {
    canvas.classList.add('filter');
  } else {
    canvas.classList.remove('filter');
  }
}

const randomBtn = document.querySelector('#randomize');
const clearBtn = document.querySelector('#clear');
const startStopBtn = document.querySelector('#start-stop');
const speedInput = document.querySelector('#speed');
const sizeInput = document.querySelector('#size');
const trailInput = document.querySelector('#trail');
const filterSelect = document.querySelector('#filter');

randomBtn.onclick = randomizeGrid;
clearBtn.onclick = clearGrid;
startStopBtn.onclick = start;
speedInput.onchange = setSpeed;
sizeInput.onchange = setCellSize;
trailInput.onchange = setTrailLength;
filterSelect.onchange = setFilter;

const canvas = document.querySelector('canvas');

canvas.width = Number(getComputedStyle(canvas).width.replace('px', ''));
canvas.height = Number(getComputedStyle(canvas).height.replace('px', ''));

let grid = new Grid(
  Math.ceil(canvas.width / Number(sizeInput.value)),
  Math.ceil(canvas.height / Number(sizeInput.value)),
  Number(trailInput.value)
);

const regl = require('regl')(canvas);

const drawCells = regl({
  vert: vertexShader,
  frag: fragmentShader,
  attributes: {
    position: (context, props) => {
      // Map screen pixels to gl coordinates
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

let fps = speedInput.value;
let lastFrame;
let animating;

let drawing;
let lastToggledCell = [null, null];

regl.frame(() => {
  if (animating) {
    lastFrame = lastFrame ? lastFrame : Date.now();

    const now = Date.now();
    const elapsed = now - lastFrame;
    const frameInterval = 1000 / fps;


    if (elapsed >= frameInterval) {
      lastFrame = now - (elapsed % frameInterval);

      grid.update();
      updateiteration();
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
    cellSize: Number(sizeInput.value),
    color: grid.getCellColors(),
  });
});

const downHandler = event => {
  drawing = true;
};

const moveHandler = event => {
  if (!drawing) return;

  let xPos;
  let yPos;

  if (event.touches) {
    event.preventDefault();

    xPos = event.touches[0].clientX;
    yPos = event.touches[0].clientY;    
  } else {
    xPos = event.clientX;
    yPos = event.clientY;    
  }

  for (let y = 0; y < grid.rows; y++) {
    const yMin = (y - 0.5) * Number(sizeInput.value) + canvas.offsetTop;
    const yMax = yMin + Number(sizeInput.value);

    if (yPos > yMin && yPos < yMax) {
      for (let x = 0; x < grid.cols; x++) {
        const xMin = (x - 1) * Number(sizeInput.value) + canvas.offsetLeft;
        const xMax = xMin + Number(sizeInput.value);

        if (
          (xPos > xMin && xPos < xMax)
          && (x !== lastToggledCell[0] || y !== lastToggledCell[1])
        ) {
          grid.toggleCell(x, y);
          lastToggledCell = [x, y];
        }
      }
    }
  }
};

const upHandler = event => {
  if (drawing) {
    drawing = false;
    lastToggledCell = [null, null];
  }
}

canvas.addEventListener('mousedown', downHandler);
canvas.addEventListener('mousemove', moveHandler);
canvas.addEventListener('mouseup', upHandler);
canvas.addEventListener('touchstart', downHandler);
canvas.addEventListener('touchmove', moveHandler);
canvas.addEventListener('touchend', upHandler);