precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 color; // Vertex color attribute

uniform mat4 worldViewProjection;

varying vec3 vColor;

void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vColor = color;
}