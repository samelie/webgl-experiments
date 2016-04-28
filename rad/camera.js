var CAMERA_ORBITING_TYPE = 1;
var CAMERA_TRACKING_TYPE = 2;

export default class Camera {
    constructor(type = 1) {
        this.matrix = mat4.create();
        this.up = vec3.create();
        this.right = vec3.create();
        this.normal = vec3.create();
        this.position = vec3.create();
        this.focus = vec3.create();
        this._azimuth = 0.0;
        this._elevation = 0.0;
        this.type = type;
        this.steps = 0;

        this.home = vec3.create();

        this.hookRenderer = null;
        this.hookGUIUpdate = null;

        this.FOV = 30;
        this.minZ = 0.1;
        this.maxZ = 10000
    }

    setPosition(p) {
        vec3.set(p, this.position);
        this.update();
    }

    dolly(s) {
        var c = this;

        var p = vec3.create();
        var n = vec3.create();

        p = c.position;

        var step = s - c.steps;

        vec3.normalize(c.normal, n);

        var newPosition = vec3.create();

        if (c.type == CAMERA_TRACKING_TYPE) {
            newPosition[0] = p[0] - step * n[0];
            newPosition[1] = p[1] - step * n[1];
            newPosition[2] = p[2] - step * n[2];
        } else {
            newPosition[0] = p[0];
            newPosition[1] = p[1];
            newPosition[2] = p[2] - step;
        }

        c.setPosition(newPosition);
        c.steps = s;
    }

    update() {
        mat4.identity(this.matrix);

        this.calculateOrientation();

        if (this.type == CAMERA_TRACKING_TYPE) {
            mat4.translate(this.matrix, this.position);
            mat4.rotateY(this.matrix, this._azimuth * Math.PI / 180);
            mat4.rotateX(this.matrix, this._elevation * Math.PI / 180);
        } else {
            var trxLook = mat4.create();
            mat4.rotateY(this.matrix, this._azimuth * Math.PI / 180);
            mat4.rotateX(this.matrix, this._elevation * Math.PI / 180);
            mat4.translate(this.matrix, this.position);
            //mat4.lookAt(this.position, this.focus, this.up, trxLook);
            //mat4.inverse(trxLook);
            //mat4.multiply(this.matrix,trxLook);
        }

        this.calculateOrientation();

        /**
         * We only update the position if we have a tracking camera.
         * For an orbiting camera we do not update the position. If
         * you don't believe me, go ahead and comment the if clause...
         * Why do you think we do not update the position?
         */
        if (this.type == CAMERA_TRACKING_TYPE) {
            mat4.multiplyVec4(this.matrix, [0, 0, 0, 1], this.position);
        }

        //console.info('------------- update -------------');
        //console.info(' right: ' + vec3.str(this.right)+', up: ' + vec3.str(this.up)+',normal: ' + vec3.str(this.normal));
        //console.info('   pos: ' + vec3.str(this.position));
        //console.info('   azimuth: ' + this.azimuth +', elevation: '+ this.elevation);
    }

    calculateOrientation() {
        var m = this.matrix;
        mat4.multiplyVec4(m, [1, 0, 0, 0], this.right);
        mat4.multiplyVec4(m, [0, 1, 0, 0], this.up);
        mat4.multiplyVec4(m, [0, 0, 1, 0], this.normal);
    }

    getViewTransform() {
        var m = mat4.create();
        mat4.inverse(this.matrix, m);
        return m;
    }

    //This operation consists in aligning the normal to the focus vector
    setFocus(f) {
        vec3.set(f, this.focus);
        this.update();
    }

    set azimuth(a) {
        this._azimuth = a
    }

    get azimuth() {
        return this._azimuth
    }

    changeAzimuth(az) {
        var c = this;
        c._azimuth += az;

        if (c._azimuth > 360 || c._azimuth < -360) {
            c._azimuth = c._azimuth % 360;
        }
        c.update();
    }

    changeElevation(el) {
        var c = this;

        c._elevation += el;

        if (c._elevation > 360 || c._elevation < -360) {
            c._elevation = c._elevation % 360;
        }
        c.update();
    }

    set elevation(a) {
        this._elevation = a
    }

    get elevation() {
        return this._elevation
    }
}

export default Camera