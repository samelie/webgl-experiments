export default class Shader {
    constructor(gl, vertex, frag) {
        this.gl = gl
        let _vert = this._createVertex(vertex)
        let _frag = this._createFragment(frag)
        gl.createShader(gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
		    gl.attachShader(this.program, _vert);
		    gl.attachShader(this.program, _frag);
		    gl.linkProgram(this.program);

		    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        		console.error("Could not initialise shaders");
		    }
		    gl.useProgram(this.program);
		    this.cacheAttribLoc = {
		    	aVertexPosition:gl.getAttribLocation(this.program, "aVertexPosition"),
		    	//aVertexColor:gl.getAttribLocation(this.program, "aVertexColor"),
		    	//aTextureCoord:gl.getAttribLocation(this.program, "aTextureCoord"),
		    	aVertexNormal:gl.getAttribLocation(this.program, "aVertexNormal")
		    }
		    console.log(this.cacheAttribLoc);
		    //this.program.vertexPositionAttribute = gl.getAttribLocation(this.program, "aVertexPosition");
		    gl.enableVertexAttribArray(this.cacheAttribLoc.aVertexPosition);
		    //gl.enableVertexAttribArray(this.cacheAttribLoc.aVertexColor);
		    //gl.enableVertexAttribArray(this.cacheAttribLoc.aTextureCoord);
		    gl.enableVertexAttribArray(this.cacheAttribLoc.aVertexNormal);
		    //this.program.vertexColorAttribute = gl.getAttribLocation(this.program, "aVertexColor");
		    //gl.enableVertexAttribArray(this.cacheAttribLoc.vertexColorAttribute);

		    this.program.pMatrixUniform = gl.getUniformLocation(this.program, "uPMatrix");
		    this.program.mvMatrixUniform = gl.getUniformLocation(this.program, "uMVMatrix");
		    this.program.nMatrixUniform = gl.getUniformLocation(this.program, "nMatrix");
    }

    setMatrixUniforms(mvMatrix, pMatrix){
    	this.gl.uniformMatrix4fv(this.program.pMatrixUniform, false, pMatrix);
    	this.gl.uniformMatrix4fv(this.program.mvMatrixUniform, false, mvMatrix);
    }

    _createFragment(str){
    	return this._createShader(this.gl.FRAGMENT_SHADER, str)
    }

    _createVertex(str){
    	return this._createShader(this.gl.VERTEX_SHADER, str)
    }

    _createShader(type, str) {
        let  shader =  this.gl.createShader(type);
         this.gl.shaderSource(shader, str);
         this.gl.compileShader(shader);
        if (! this.gl.getShaderParameter(shader,  this.gl.COMPILE_STATUS)) {
        		console.error( this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
}