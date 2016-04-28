const FRAG = 
`
		precision highp float;
    varying vec3 vNormal;
    void main(void) {
        gl_FragColor = vec4(vNormal,1.0);
    }

`

export default FRAG