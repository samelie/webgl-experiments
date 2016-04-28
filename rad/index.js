import glm from 'gl-matrix';
import GL from './gl'
//const mat4 = glm.mat4;
import SPHERE from './sphere'


import Camera from './camera'
import CAMERA_INTERACTOR from './camera_interactor'
import TRANSFORMATIONS from './transformation'
import SCENE from './scene'
import Shader from './shaders/shader'

import Vert from './shaders/vert'
import Frag from './shaders/frag'

var gl, canvas, sphere;

function initGL() {
    try {
        let _g = GL
        sphere = new SPHERE(1, 26, true)
        console.log(sphere);
        gl = _g.ctx
        canvas = _g.canvas
    } catch (e) {}
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


var shaderProgram;
var shader;
var transformations, interactor;

function initShaders() {
    shader = new Shader(gl, Vert, Frag)
    shaderProgram = shader.program
    // var fragmentShader = getShader(gl, "shader-fs");
    // var vertexShader = getShader(gl, "shader-vs");
    // shaderProgram = gl.createProgram();
    // gl.attachShader(shaderProgram, vertexShader);
    // gl.attachShader(shaderProgram, fragmentShader);
    // gl.linkProgram(shaderProgram);
    // if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    //     alert("Could not initialise shaders");
    // }
    // gl.useProgram(shaderProgram);
    // shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    // gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    // shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    // gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    // shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    // shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


function initTransformations() {
    var _camera = new Camera()
    _camera.setFocus([0.0,0.0,0.0]);
    _camera.azimuth = 30;
    _camera.elevation= -45;
    _camera.setPosition( [0.0, 0.0, 6.0])
    transformations = new TRANSFORMATIONS(_camera)
    interactor = new CAMERA_INTERACTOR(_camera, canvas)

}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

function initMesh() {

}


// function initBuffers() {
//     cubeVertexPositionBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
//     var vertices = []
//         //vertices = Cube.positions
//     for (var i = 0; i < Sphere.positions.length; i++) {
//         vertices.push(Sphere.positions[i][0])
//         vertices.push(Sphere.positions[i][1])
//         vertices.push(Sphere.positions[i][2])
//     };
//     //console.log(Sphere);
//     //console.log(Sphere.positions);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
//     cubeVertexPositionBuffer.itemSize = 3;
//     cubeVertexPositionBuffer.numItems = Sphere.positions.length * 3;
//     cubeVertexColorBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
//     colors = [
//         [1.0, 0.0, 0.0, 1.0], // Front face
//         [1.0, 1.0, 0.0, 1.0], // Back face
//         [0.0, 1.0, 0.0, 1.0], // Top face
//         [1.0, 0.5, 0.5, 1.0], // Bottom face
//         [1.0, 0.0, 1.0, 1.0], // Right face
//         [0.0, 0.0, 1.0, 1.0] // Left face
//     ];
//     var colors = []
//     for (var i = 0; i < Sphere.positions.length; i++) {
//         // vertices.push(Sphere.positions[i][0])
//         // vertices.push(Sphere.positions[i][1])
//         // vertices.push(Sphere.positions[i][2])
//         colors.push([Math.random(), Math.random(), Math.random(), 1.0])
//     };
//     var unpackedColors = [];
//     for (var i in colors) {
//         var color = colors[i];
//         for (var j = 0; j < 4; j++) {
//             unpackedColors = unpackedColors.concat(color);
//         }
//     }
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
//     cubeVertexColorBuffer.itemSize = 4;
//     cubeVertexColorBuffer.numItems = Sphere.positions.length * 3;
//     cubeVertexIndexBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
//     var cubeVertexIndices = [
//         0, 1, 2, 0, 2, 3, // Front face
//         4, 5, 6, 4, 6, 7, // Back face
//         8, 9, 10, 8, 10, 11, // Top face
//         12, 13, 14, 12, 14, 15, // Bottom face
//         16, 17, 18, 16, 18, 19, // Right face
//         20, 21, 22, 20, 22, 23 // Left face
//     ];
//     cubeVertexIndices = Sphere.indices
//     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
//     cubeVertexIndexBuffer.itemSize = 1;
//     cubeVertexIndexBuffer.numItems = Sphere.indices.length;
// }
// var rPyramid = 0;
// var rCube = 0;

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    transformations.updatePerspective();
    transformations.calculateModelView();
    transformations.push();
    shader.setMatrixUniforms(transformations.mvMatrix, transformations.pMatrix);
    transformations.pop();
    //mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    //mat4.identity(mvMatrix);
    //mat4.translate(mvMatrix, [0.0, -1.0, -3.0]);
    // mvPushMatrix();
    // mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);
    // gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
    // gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    // setMatrixUniforms();
    // gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
    //mvPopMatrix();
    //mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
    // mvPushMatrix();
    //mat4.rotate(mvMatrix, degToRad(rCube), [1, 1, 1]);
    GL.draw(sphere, shader)
    // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    // gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    // gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    // mvPopMatrix();
}
var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        rPyramid += (90 * elapsed) / 1000.0;
        rCube -= (75 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}

function tick() {
    window.requestAnimationFrame(tick);
    drawScene();
    //animate();
}

function webGLStart() {
    initGL();
    initTransformations()
    initShaders()
    // initBuffers();
     gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
     tick();
}
window.onload = webGLStart