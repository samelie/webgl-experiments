var shell = require("gl-now")()
var createMesh = require("gl-mesh")
var glm = require("gl-matrix")
var mat4 = glm.mat4
var createBuffer = require("gl-buffer")
var createVAO = require("gl-vao")
var simple3DShader = require("simple-3d-shader")
var createOrbitCamera = require("orbit-camera")
var createPlane = require("primitive-plane")
var createShader = require("gl-shader")
var createGeometry = require("gl-geometry")
var createSphere = require("icosphere")
 
var camera = createOrbitCamera([0, 10, 20],
                               [0, 3, 0],
                               [0, 1, 0])
 
var shader, mesh, plane, vao, sphere

shell.on("gl-init", function() {
  var gl = shell.gl

  //Create shader object
  shader = createShader(gl,
    `
      attribute vec2 position;
      attribute vec3 color;\

      uniform mat4 projection;
			uniform mat4 view;
			uniform mat4 model;

			varying vec2 vUv;
			varying vec3 vViewPosition;

      varying vec3 fragColor;\

      void main() {
      	//determine view space position 
			  mat4 modelViewMatrix = view * model;
			  vec4 viewModelPosition = modelViewMatrix * position;
			 
			  //pass varyings to fragment shader 
			  vViewPosition = viewModelPosition.xyz;
			  vUv = uv;
			 
			  //determine final 3D position 
			  gl_Position = projection * viewModelPosition;
        //gl_Position = vec4(position, 0, 1.0);\
        fragColor = color;\
      }`
    ,
    `
      precision highp float;\
      varying vec3 fragColor;\
      void main() {\
        gl_FragColor = vec4(fragColor, 1.0);\
      }`
  );
  shader.attributes.position.location = 0
  shader.attributes.color.location = 1

  //Create vertex array object
  //plane = createPlane(1)
  sphere = createSphere()

  // vao = createVAO(gl, [
  //   { "buffer": createBuffer(gl, plane.positions),
  //     "type": gl.FLOAT,
  //     "size": 4
  //   }
  // ])

  mesh = createGeometry(gl)
  .attr('positions', sphere.positions)
  .faces(sphere.cells)

})

shell.on("gl-render", function(t) {
  var gl = shell.gl

  //Bind the shader
  shader.bind()
  //Bind vertex array object and draw it
  mesh.bind()
  mesh.draw(gl.TRIANGLES)

  //Unbind vertex array when fini
  mesh.unbind()
})