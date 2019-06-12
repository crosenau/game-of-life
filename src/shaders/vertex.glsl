precision mediump float;

attribute vec2 position;
attribute vec3 color;

uniform float cellSize;

varying vec3 vColor;

void main() {
  vColor = color;
  gl_PointSize = cellSize;
  gl_Position = vec4(position, 0, 1);
}