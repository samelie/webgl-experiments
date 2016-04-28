const BASIC = `

    attribute vec3 aVertexPosition;
		//attribute vec2 aTextureCoord;
		attribute vec3 aVertexNormal;

		uniform mat4 uMVMatrix;
		uniform mat4 uPMatrix;
		uniform mat4 uNMatrix;

    varying vec3 vNormal;
    void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        vNormal = aVertexNormal;
    }



`

export default BASIC