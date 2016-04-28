const W = 500
const h = 500

let instance = null;

class GL {
    constructor(id) {
        if (!instance) {
            this._createGL(id)
            instance = this;
        }
        return instance;
    }

    _createGL(id) {
        this.canvas = document.getElementById(id);
        this.ctx = null;
        if (this.canvas == null) {
            this.canvas = this._createCanvas()
        }
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        for (var i = 0; i < names.length; ++i) {
            try {
                this.ctx = this.canvas.getContext(names[i]);
            } catch (e) {}
            if (this.ctx) {
                break;
            }
        }
        if (this.ctx == null) {
            alert("Could not initialise WebGL");
            return null;
        } else {
            this.gl = this.ctx
            this.ctx.viewportWidth = this.canvas.width;
            this.ctx.viewportHeight = this.canvas.height;
            return this.ctx;
        }
    }

    _createCanvas() {
        let c = document.createElement('canvas')
        c.width = W
        c.height = H
        document.body.appendChild(c)
        return c
    }

    _getAttribLoc(shader, name) {
        //console.log(name);
        //console.log(shader.cacheAttribLoc);
        return shader.cacheAttribLoc[name];
    }

    draw(mMesh, shader, drawingType) {
        let shaderProgram = shader.program
        drawingType = drawingType || this.gl.TRIANGLES

        //  ATTRIBUTES
        for (let i = 0; i < mMesh.attributes.length; i++) {

            let attribute = mMesh.attributes[i];
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attribute.buffer);
            let attrPosition = this._getAttribLoc(shader, attribute.name);
            this.gl.vertexAttribPointer(attrPosition, attribute.itemSize, this.gl.FLOAT, false, 0, 0);

        }


        //  BIND INDEX BUFFER

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mMesh.iBuffer);




        let drawType = mMesh.drawType;
        if (drawingType !== undefined) {
            drawType = drawingType;
        }

        //  DRAWING
        if (drawType === this.gl.POINTS) {
            this.gl.drawArrays(drawType, 0, mMesh.vertexSize);
        } else {
            this.gl.drawElements(drawType, mMesh.iBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
        }
    }
}

let _GL = new GL('webgl')

export default _GL