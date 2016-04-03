import Detector from '@stinkdigital/Detector';
import Happens from 'happens';
const assign = require('assign-deep');

export default class CameraControls {

	constructor(element, options) {

		Happens(this);

		this._rotationX = 0;
		this._rotationY = 0;
		this._offsetX = 0;
		this._offsetY = 0;
		this._width = window.innerWidth;
		this._height = window.innerHeight;

		const defaults = {
			speed: 3
		};

		this.settings = assign(defaults, options);
		this.element = element;

		this._onTouchStartHandler = this._onTouchStart.bind(this);
		this._onTouchMoveHandler = this._onTouchMove.bind(this);
		this._onTouchEndHandler = this._onTouchEnd.bind(this);

		if (Detector.IS_DESKTOP) {
			element.addEventListener('mousedown', this._onTouchStartHandler);
			element.addEventListener('mousemove', this._onTouchMoveHandler);
			element.addEventListener('mouseup', this._onTouchEndHandler);
		} else {
			element.addEventListener('touchstart', this._onTouchStartHandler);
			element.addEventListener('touchmove', this._onTouchMoveHandler);
			element.addEventListener('touchend', this._onTouchEndHandler);
		}
	}

	_onTouchStart(event) {
		this._offsetY = this._rotationY;
		this._offsetX = this._rotationX;
		this._startY = event.pageX / this._width;
		this._startX = event.pageY / this._height;
		this.isDown = true;
	}

	/*
 	Reduce the rotation between 0 - 360
 	@param Number rotation
 	@return Number
 */
	_normalizeRotation(rotation) {

		// rotation = rotation % (Math.PI * 2);
		const maxRotation = Math.PI * 2;
		const div = rotation / maxRotation;
		const intToSubtract = Math.floor(rotation / maxRotation);
		return rotation -= intToSubtract * maxRotation;
	}

	_onTouchMove(event) {

		if (this.isDown) {
			const y = event.pageX / this._width;
			const x = event.pageY / this._height;

			this._rotationX = this._offsetX + (this._startX - x) * this.settings.speed;
			this._rotationY = this._offsetY + (this._startY - y) * this.settings.speed;

			this._rotationY = this._normalizeRotation(this._rotationY);

			// console.log('cam rotation', THREE.Math.radToDeg(this._rotationY));

			this.emit('change', {
				rotationX: this._rotationX,
				rotationY: this._rotationY
			});
		}
	}

	_onTouchEnd() {
		this.isDown = false;
		this.emit('end');
	}
}